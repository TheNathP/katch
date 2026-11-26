-- Photos submitted for the daily challenge, scored by the submit-photo Edge Function.

-- Private bucket (created by the leaderboard migration): only Edge Functions (service role)
-- read and write the photos. Objects are stored as <player_id>/<challenge_date>/<attempt_id>.<jpg|png>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('challenge-photos', 'challenge-photos', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table public.challenge_attempts (
  id uuid primary key,
  player_id uuid not null references auth.users(id) on delete cascade,
  challenge_date date not null references public.daily_challenges(challenge_date),
  photo_path text not null unique,
  -- When the photo was taken, as reported by the device (camera clock or EXIF). Informational only.
  taken_at timestamptz,
  -- When the server received and scored the photo. This is the authoritative time.
  submitted_at timestamptz not null default clock_timestamp(),
  target_hex text not null check (target_hex ~ '^#[0-9A-F]{6}$'),
  matched_hex text not null check (matched_hex ~ '^#[0-9A-F]{6}$'),
  delta_e real not null check (delta_e >= 0),
  score smallint not null check (score between 0 and 100)
);

create index challenge_attempts_player_day_idx on public.challenge_attempts (player_id, challenge_date);

alter table public.challenge_attempts enable row level security;
revoke all on public.challenge_attempts from public, anon, authenticated;
grant select, insert on public.challenge_attempts to service_role;

-- Stores a scored attempt for today's challenge and keeps the player's best score in
-- social_results, with the server time and the photo of that best attempt (shown by the leaderboard). Raises 'challenge_ended' when the day changed since the photo
-- was scored, and 'attempt_limit_reached' once the player used every attempt of the day.
create function public.record_challenge_attempt(
  attempt_id uuid,
  attempt_player uuid,
  attempt_date date,
  attempt_photo_path text,
  attempt_taken_at timestamptz,
  attempt_target_hex text,
  attempt_matched_hex text,
  attempt_delta_e real,
  attempt_score smallint,
  max_attempts integer
)
returns table (
  submitted_at timestamptz,
  best_score smallint,
  attempts_left integer
)
language plpgsql
set search_path = ''
as $$
declare
  used integer;
  recorded_at timestamptz;
  best smallint;
begin
  -- The photo must have been scored against today's color.
  if attempt_date <> (clock_timestamp() at time zone 'UTC')::date or not exists (
    select 1 from public.daily_challenges d
    where d.challenge_date = attempt_date and d.color_hex = attempt_target_hex
  ) then
    raise exception 'challenge_ended';
  end if;

  -- Serialize the attempts of one player so parallel requests cannot bypass the daily limit.
  perform pg_advisory_xact_lock(hashtextextended('public.challenge_attempts:' || attempt_player::text, 0));

  select count(*)::integer into used
  from public.challenge_attempts a
  where a.player_id = attempt_player and a.challenge_date = attempt_date;
  if used >= max_attempts then
    raise exception 'attempt_limit_reached';
  end if;

  insert into public.challenge_attempts as a (
    id, player_id, challenge_date, photo_path, taken_at, target_hex, matched_hex, delta_e, score
  )
  values (
    attempt_id, attempt_player, attempt_date, attempt_photo_path, attempt_taken_at, attempt_target_hex,
    attempt_matched_hex, attempt_delta_e, attempt_score
  )
  returning a.submitted_at into recorded_at;

  -- Only a strictly better score replaces the published result, so ties keep the earlier capture.
  insert into public.social_results as r (player_id, challenge_date, score, captured_at, photo_object_path)
  values (attempt_player, attempt_date, attempt_score, recorded_at, attempt_photo_path)
  on conflict (player_id, challenge_date) do update set
    score = excluded.score,
    captured_at = excluded.captured_at,
    photo_object_path = excluded.photo_object_path
  where r.score < excluded.score;

  select round(r.score)::smallint into best
  from public.social_results r
  where r.player_id = attempt_player and r.challenge_date = attempt_date;

  return query select recorded_at, best, max_attempts - used - 1;
end;
$$;

revoke all on function public.record_challenge_attempt(uuid, uuid, date, text, timestamptz, text, text, real, smallint, integer)
  from public, anon, authenticated;
grant execute on function public.record_challenge_attempt(uuid, uuid, date, text, timestamptz, text, text, real, smallint, integer)
  to service_role;
