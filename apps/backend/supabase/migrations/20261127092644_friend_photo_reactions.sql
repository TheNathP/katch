create table public.friend_photo_reactions (
  attempt_id uuid not null references public.challenge_attempts(id) on delete cascade,
  player_id uuid not null references public.social_profiles(player_id) on delete cascade,
  reaction text not null check (reaction in ('like', 'love', 'laugh', 'wow')),
  primary key (attempt_id, player_id)
);

create index friend_photo_reactions_player_idx on public.friend_photo_reactions (player_id);

alter table public.friend_photo_reactions enable row level security;
revoke all on public.friend_photo_reactions from public, anon, authenticated;
grant select, insert, update, delete on public.friend_photo_reactions to service_role;

-- A replay replaces the attempt ID. Reactions belong to the previous photo.
create function public.clear_replaced_photo_reactions()
returns trigger language plpgsql set search_path = '' as $$
begin
  delete from public.friend_photo_reactions where attempt_id = old.id;
  return new;
end;
$$;

revoke all on function public.clear_replaced_photo_reactions() from public, anon, authenticated;
grant execute on function public.clear_replaced_photo_reactions() to service_role;

create trigger clear_replaced_photo_reactions
before update of id on public.challenge_attempts
for each row when (old.id is distinct from new.id)
execute function public.clear_replaced_photo_reactions();

create function public.friend_photo_unlocked(p_viewer uuid, p_day date)
returns boolean language sql stable set search_path = '' as $$
  select p_day < (statement_timestamp() at time zone 'UTC')::date
    or (p_day = (statement_timestamp() at time zone 'UTC')::date and exists (
      select 1 from public.social_results
      where player_id = p_viewer and challenge_date = p_day
    ));
$$;

create function public.friend_photo_reaction_summary(p_viewer uuid, p_attempt uuid, p_owner uuid)
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'myReaction', max(grouped.reaction) filter (where grouped.selected),
    'counts', coalesce(jsonb_object_agg(grouped.reaction, grouped.total), '{}'::jsonb)
  )
  from (
    select r.reaction, count(*) as total, bool_or(r.player_id = p_viewer) as selected
    from public.friend_photo_reactions r
    join public.friendships f
      on f.player_a = least(p_owner, r.player_id) and f.player_b = greatest(p_owner, r.player_id)
      and f.accepted_at is not null
    where r.attempt_id = p_attempt
    group by r.reaction
  ) grouped;
$$;

create function public.get_friend_activity(p_viewer uuid, p_target uuid)
returns jsonb language sql stable set search_path = '' as $$
  with profile as (
    select p.player_id, p.display_name,
      case when f.accepted_at is not null then 'friend'
           when f.requested_by = p_viewer then 'outgoing'
           when f.requested_by = p_target then 'incoming'
           else 'none' end as relationship
    from public.social_profiles p
    left join public.friendships f on f.player_a = least(p_viewer, p_target)
      and f.player_b = greatest(p_viewer, p_target)
    where p.player_id = p_target
  ), access as (
    select *, p_viewer = p_target or relationship = 'friend' as can_view_results from profile
  )
  select jsonb_build_object(
    'id', p.player_id,
    'name', p.display_name,
    'relationship', p.relationship,
    'canViewResults', p.can_view_results,
    'results', case when p.can_view_results then coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', r.challenge_date,
        'score', r.score,
        'photo', case
          when a.id is null then jsonb_build_object('status', 'missing')
          when p_viewer <> p_target and not public.friend_photo_unlocked(p_viewer, r.challenge_date)
            then jsonb_build_object('status', 'locked')
          else jsonb_build_object(
            'status', 'available', 'id', a.id, 'path', a.photo_path,
            'reactions', public.friend_photo_reaction_summary(p_viewer, a.id, p_target)
          )
        end
      ) order by r.challenge_date desc)
      from (
        select challenge_date, score, photo_object_path from public.social_results
        where player_id = p_target and challenge_date between
          (statement_timestamp() at time zone 'UTC')::date - 3 and
          (statement_timestamp() at time zone 'UTC')::date
      ) r
      left join public.challenge_attempts a
        on a.player_id = p_target and a.challenge_date = r.challenge_date and a.photo_path = r.photo_object_path
    ), '[]'::jsonb) else '[]'::jsonb end
  )
  from access p;
$$;

create function public.set_friend_photo_reaction(p_viewer uuid, p_attempt uuid, p_reaction text)
returns jsonb language plpgsql set search_path = '' as $$
declare
  owner_id uuid;
  challenge_day date;
begin
  if p_reaction is not null and p_reaction not in ('like', 'love', 'laugh', 'wow') then
    return null;
  end if;

  select a.player_id, a.challenge_date into owner_id, challenge_day
  from public.challenge_attempts a
  join public.social_results r using (player_id, challenge_date)
  where a.id = p_attempt and a.photo_path = r.photo_object_path
  for key share of a;

  if not found or owner_id = p_viewer or not public.friend_photo_unlocked(p_viewer, challenge_day) then
    return null;
  end if;

  perform 1 from public.friendships
  where player_a = least(p_viewer, owner_id) and player_b = greatest(p_viewer, owner_id)
    and accepted_at is not null
  for share;
  if not found then return null; end if;

  if p_reaction is null then
    delete from public.friend_photo_reactions where attempt_id = p_attempt and player_id = p_viewer;
  else
    insert into public.friend_photo_reactions (attempt_id, player_id, reaction)
    values (p_attempt, p_viewer, p_reaction)
    on conflict (attempt_id, player_id) do update set reaction = excluded.reaction;
  end if;

  return public.friend_photo_reaction_summary(p_viewer, p_attempt, owner_id);
end;
$$;

revoke all on function public.friend_photo_unlocked(uuid, date),
  public.friend_photo_reaction_summary(uuid, uuid, uuid), public.get_friend_activity(uuid, uuid),
  public.set_friend_photo_reaction(uuid, uuid, text) from public, anon, authenticated;

grant execute on function public.friend_photo_unlocked(uuid, date),
  public.friend_photo_reaction_summary(uuid, uuid, uuid), public.get_friend_activity(uuid, uuid),
  public.set_friend_photo_reaction(uuid, uuid, text) to service_role;


-- Keep leaderboard access decisions in the original query. The reaction
-- context is for the available photo of an accepted friend.
create function public.get_leaderboard_player_with_reactions(p_viewer uuid, p_player uuid)
returns jsonb language sql stable set search_path = '' as $$
  with player as (
    select public.get_leaderboard_player(p_viewer, p_player) as payload
  )
  select p.payload || case when a.id is null then '{}'::jsonb else jsonb_build_object(
    'reaction_context', jsonb_build_object(
      'id', a.id, 'reactions', public.friend_photo_reaction_summary(p_viewer, a.id, p_player)
    )
  ) end
  from player p
  left join public.challenge_attempts a
    on p.payload->>'relationship' = 'friend'
    and a.player_id = p_player and a.photo_path = p.payload->>'photo_object_path';
$$;

revoke all on function public.get_leaderboard_player_with_reactions(uuid, uuid) from public, anon, authenticated;
grant execute on function public.get_leaderboard_player_with_reactions(uuid, uuid) to service_role;
