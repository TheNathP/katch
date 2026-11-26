-- New rule: players submit as many photos as they want; only the latest one counts.
-- challenge_attempts now keeps one row per player and day, overwritten by each submission,
-- and social_results always mirrors that latest attempt (no more daily limit, no more best score).
-- The submit-photo Edge Function deletes the replaced photo from storage so it does not pile up.

-- Keep only the latest attempt of each player and day. The photos of the removed rows stay
-- in the challenge-photos bucket: storage objects can only be deleted through the Storage API.
delete from public.challenge_attempts a
using public.challenge_attempts newer
where newer.player_id = a.player_id
  and newer.challenge_date = a.challenge_date
  and (newer.submitted_at, newer.id) > (a.submitted_at, a.id);

-- Publish the latest attempt instead of the best one.
update public.social_results r
set score = a.score, captured_at = a.submitted_at, photo_object_path = a.photo_path
from public.challenge_attempts a
where a.player_id = r.player_id and a.challenge_date = r.challenge_date;

drop index public.challenge_attempts_player_day_idx;
alter table public.challenge_attempts
  add constraint challenge_attempts_player_day_key unique (player_id, challenge_date);

grant update on public.challenge_attempts to service_role;

drop function public.record_challenge_attempt(uuid, uuid, date, text, timestamptz, text, text, real, smallint, integer);

-- Stores a scored attempt for today's challenge, replacing the player's previous attempt of the
-- day, and publishes it in social_results with the server time and its photo (shown by the
-- leaderboard). Returns the path of the replaced photo, which the caller removes from storage.
-- Raises 'challenge_ended' when the day changed since the photo was scored.
create function public.record_challenge_attempt(
  attempt_id uuid,
  attempt_player uuid,
  attempt_date date,
  attempt_photo_path text,
  attempt_taken_at timestamptz,
  attempt_target_hex text,
  attempt_matched_hex text,
  attempt_delta_e real,
  attempt_score smallint
)
returns table (
  submitted_at timestamptz,
  replaced_photo_path text
)
language plpgsql
set search_path = ''
as $$
declare
  previous_path text;
  recorded_at timestamptz;
begin
  -- The photo must have been scored against today's color.
  if attempt_date <> (clock_timestamp() at time zone 'UTC')::date or not exists (
    select 1 from public.daily_challenges d
    where d.challenge_date = attempt_date and d.color_hex = attempt_target_hex
  ) then
    raise exception 'challenge_ended';
  end if;

  -- Serialize the submissions of one player so the latest one wins and each replaced photo
  -- is reported exactly once.
  perform pg_advisory_xact_lock(hashtextextended('public.challenge_attempts:' || attempt_player::text, 0));

  select a.photo_path into previous_path
  from public.challenge_attempts a
  where a.player_id = attempt_player and a.challenge_date = attempt_date;

  insert into public.challenge_attempts as a (
    id, player_id, challenge_date, photo_path, taken_at, target_hex, matched_hex, delta_e, score
  )
  values (
    attempt_id, attempt_player, attempt_date, attempt_photo_path, attempt_taken_at, attempt_target_hex,
    attempt_matched_hex, attempt_delta_e, attempt_score
  )
  on conflict (player_id, challenge_date) do update set
    id = excluded.id,
    photo_path = excluded.photo_path,
    taken_at = excluded.taken_at,
    submitted_at = excluded.submitted_at,
    target_hex = excluded.target_hex,
    matched_hex = excluded.matched_hex,
    delta_e = excluded.delta_e,
    score = excluded.score
  returning a.submitted_at into recorded_at;

  insert into public.social_results as r (player_id, challenge_date, score, captured_at, photo_object_path)
  values (attempt_player, attempt_date, attempt_score, recorded_at, attempt_photo_path)
  on conflict (player_id, challenge_date) do update set
    score = excluded.score,
    captured_at = excluded.captured_at,
    photo_object_path = excluded.photo_object_path;

  return query select recorded_at, previous_path;
end;
$$;

revoke all on function public.record_challenge_attempt(uuid, uuid, date, text, timestamptz, text, text, real, smallint)
  from public, anon, authenticated;
grant execute on function public.record_challenge_attempt(uuid, uuid, date, text, timestamptz, text, text, real, smallint)
  to service_role;
