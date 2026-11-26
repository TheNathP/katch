create or replace function public.get_daily_leaderboard(p_viewer uuid, p_scope text)
returns jsonb
language sql stable
set search_path = ''
as $$
  with challenge as (
    select (statement_timestamp() at time zone 'UTC')::date as day
  ), ranked as (
    select
      r.player_id,
      r.score,
      row_number() over (
        order by r.score desc, r.captured_at asc nulls last, r.player_id
      ) as rank
    from public.social_results r
    join challenge c on r.challenge_date = c.day
    where p_scope = 'world'
       or (p_scope = 'friends' and (
         r.player_id = p_viewer or exists (
           select 1 from public.friendships f
           where f.player_a = least(p_viewer, r.player_id)
             and f.player_b = greatest(p_viewer, r.player_id)
             and f.accepted_at is not null
         )
       ))
  )
  select jsonb_build_object(
    'date', c.day,
    'endsAt', (c.day + 1)::timestamp at time zone 'UTC',
    'serverTime', statement_timestamp(),
    'entries', coalesce((
      select jsonb_agg(jsonb_build_object(
        'playerId', r.player_id, 'displayName', p.display_name,
        'avatarId', p.avatar_id, 'avatarBackgroundId', p.avatar_background_id,
        'rank', r.rank, 'score', r.score
      ) order by r.rank)
      from ranked r
      join public.social_profiles p on p.player_id = r.player_id
      where p_scope = 'friends' or r.rank <= 50
    ), '[]'::jsonb),
    'currentPlayer', jsonb_build_object(
      'playerId', viewer.player_id, 'displayName', viewer.display_name,
      'avatarId', viewer.avatar_id, 'avatarBackgroundId', viewer.avatar_background_id,
      'rank', own.rank, 'score', own.score
    )
  )
  from challenge c
  join public.social_profiles viewer on viewer.player_id = p_viewer
  left join ranked own on own.player_id = viewer.player_id;
$$;
