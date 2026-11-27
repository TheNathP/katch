create function public.get_profile_challenge_stats(p_player uuid)
returns jsonb
language sql stable set search_path = ''
as $$
  select jsonb_build_object(
    'completedChallenges', count(*),
    'averageScore', coalesce(round(avg(score), 1), 0)
  )
  from public.social_results
  where player_id = p_player;
$$;

revoke all on function public.get_profile_challenge_stats(uuid) from public, anon, authenticated;
grant execute on function public.get_profile_challenge_stats(uuid) to service_role;
