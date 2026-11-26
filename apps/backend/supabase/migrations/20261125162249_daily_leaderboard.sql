alter table public.social_results
  alter column score type numeric(5,2),
  add column captured_at timestamptz;

comment on column public.social_results.captured_at is
  'Capture time recorded by the submission backend. Null for results without a known capture time.';

create index social_results_daily_ranking_idx
  on public.social_results (challenge_date, score desc, captured_at, player_id);

create function public.get_daily_leaderboard(p_viewer uuid, p_scope text)
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
        'playerId', r.player_id, 'displayName', p.display_name, 'rank', r.rank, 'score', r.score
      ) order by r.rank)
      from ranked r
      join public.social_profiles p on p.player_id = r.player_id
      where p_scope = 'friends' or r.rank <= 50
    ), '[]'::jsonb),
    'currentPlayer', jsonb_build_object(
      'playerId', viewer.player_id, 'displayName', viewer.display_name,
      'rank', own.rank, 'score', own.score
    )
  )
  from challenge c
  join public.social_profiles viewer on viewer.player_id = p_viewer
  left join ranked own on own.player_id = viewer.player_id;
$$;

revoke all on function public.get_daily_leaderboard(uuid, text) from public, anon, authenticated;
grant execute on function public.get_daily_leaderboard(uuid, text) to service_role;
