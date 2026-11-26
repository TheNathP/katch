insert into storage.buckets (id, name, public)
values ('challenge-photos', 'challenge-photos', false)
on conflict (id) do update set public = false;

alter table public.social_results add column photo_object_path text;

comment on column public.social_results.photo_object_path is
  'Object path in the private challenge-photos bucket, attached by the submission backend.';

create function public.get_leaderboard_player(p_viewer uuid, p_player uuid)
returns jsonb
language sql stable
set search_path = ''
as $$
  with challenge as (
    select (statement_timestamp() at time zone 'UTC')::date as day
  ), photo_access as (
    select p_player = p_viewer or exists (
      select 1 from public.social_results own
      where own.player_id = p_viewer and own.challenge_date = c.day
    ) as allowed
    from challenge c
  )
  select jsonb_build_object(
    'display_name', p.display_name,
    'score', r.score,
    'relationship', case
      when p_player = p_viewer then 'self'
      when f.accepted_at is not null then 'friend'
      when f.requested_by = p_viewer then 'outgoing'
      when f.requested_by = p_player then 'incoming'
      else 'none'
    end,
    'can_view_photo', a.allowed,
    'photo_object_path', case when a.allowed then r.photo_object_path end
  )
  from public.social_profiles p
  cross join challenge c
  cross join photo_access a
  left join public.social_results r on r.player_id = p.player_id and r.challenge_date = c.day
  left join public.friendships f on f.player_a = least(p_player, p_viewer) and f.player_b = greatest(p_player, p_viewer)
  where p.player_id = p_player and (r.player_id is not null or p_player = p_viewer);
$$;

revoke all on function public.get_leaderboard_player(uuid, uuid) from public, anon, authenticated;
grant execute on function public.get_leaderboard_player(uuid, uuid) to service_role;
