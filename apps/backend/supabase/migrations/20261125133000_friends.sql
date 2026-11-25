create table public.social_profiles (
  player_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 32)
);

create table public.friendships (
  player_a uuid not null references public.social_profiles(player_id) on delete cascade,
  player_b uuid not null references public.social_profiles(player_id) on delete cascade,
  requested_by uuid not null,
  accepted_at timestamptz,
  primary key (player_a, player_b),
  check (player_a < player_b),
  check (requested_by in (player_a, player_b))
);

create index friendships_player_b_idx on public.friendships (player_b);

-- The server can publish one best score per player and challenge day here.
create table public.social_results (
  player_id uuid not null references public.social_profiles(player_id) on delete cascade,
  challenge_date date not null,
  score smallint not null check (score between 0 and 100),
  primary key (player_id, challenge_date)
);

alter table public.social_profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.social_results enable row level security;
revoke all on public.social_profiles, public.friendships, public.social_results from public, anon, authenticated;
grant select, insert, update on public.social_profiles to service_role;
grant select, insert, update, delete on public.friendships, public.social_results to service_role;

create function public.create_social_profile()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.social_profiles (player_id, display_name)
  values (new.id, 'Pix-' || left(replace(new.id::text, '-', ''), 12));
  return new;
end;
$$;

revoke all on function public.create_social_profile() from public, anon, authenticated;

create trigger create_social_profile_for_user
after insert on auth.users for each row execute function public.create_social_profile();

insert into public.social_profiles (player_id, display_name)
select id, 'Pix-' || left(replace(id::text, '-', ''), 12)
from auth.users
on conflict (player_id) do nothing;

create function public.friends_action(viewer uuid, action_name text, target uuid default null, input_text text default null)
returns jsonb
language plpgsql set search_path = ''
as $$
declare
  outcome jsonb;
begin
  if action_name = 'overview' then
    with connections as (
      select p.player_id, p.display_name,
        case when f.accepted_at is not null then 'friend'
             when f.requested_by = viewer then 'outgoing'
             else 'incoming' end as relationship
      from public.friendships f
      join public.social_profiles p on p.player_id = case when f.player_a = viewer then f.player_b else f.player_a end
      where viewer in (f.player_a, f.player_b)
    )
    select jsonb_build_object('players', coalesce(jsonb_agg(jsonb_build_object(
      'id', player_id, 'name', display_name, 'relationship', relationship
    ) order by lower(display_name), player_id), '[]'::jsonb))
    into outcome
    from connections;
  elsif action_name = 'search' then
    select jsonb_build_object('players', coalesce(jsonb_agg(found.player order by found.sort_name, found.player_id), '[]'::jsonb))
      into outcome
    from (
      select p.player_id, lower(p.display_name) as sort_name,
        jsonb_build_object('id', p.player_id, 'name', p.display_name, 'relationship',
          case when f.accepted_at is not null then 'friend'
               when f.requested_by = viewer then 'outgoing'
               when f.requested_by = p.player_id then 'incoming'
               else 'none' end) as player
      from public.social_profiles p
      left join public.friendships f on f.player_a = least(p.player_id, viewer) and f.player_b = greatest(p.player_id, viewer)
      where p.player_id <> viewer and strpos(lower(p.display_name), lower(input_text)) > 0
      order by sort_name, p.player_id
      limit 25
    ) found;
  elsif action_name = 'profile' then
    with access as (
      select (target = viewer or exists (
        select 1 from public.friendships
        where player_a = least(viewer, target) and player_b = greatest(viewer, target) and accepted_at is not null
      )) as can_view_results
    )
    select jsonb_build_object(
      'id', p.player_id, 'name', p.display_name,
      'canViewResults', a.can_view_results,
      'results', case when a.can_view_results then coalesce((
        select jsonb_agg(jsonb_build_object('date', r.challenge_date, 'score', r.score) order by r.challenge_date desc)
        from (
          select challenge_date, score from public.social_results
          where player_id = target order by challenge_date desc limit 15
        ) r
      ), '[]'::jsonb) else '[]'::jsonb end
    ) into outcome
    from public.social_profiles p cross join access a where p.player_id = target;
  elsif action_name = 'rename' then
    update public.social_profiles
    set display_name = input_text
    where player_id = viewer
    returning jsonb_build_object('name', display_name) into outcome;
  elsif action_name = 'request' then
    if target = viewer or not exists (select 1 from public.social_profiles where player_id = target) then
      return null;
    end if;
    insert into public.friendships (player_a, player_b, requested_by)
    values (least(viewer, target), greatest(viewer, target), viewer)
    on conflict do nothing;
    outcome := jsonb_build_object('ok', true);
  elsif action_name = 'accept' then
    update public.friendships set accepted_at = now()
    where player_a = least(viewer, target) and player_b = greatest(viewer, target)
      and requested_by = target and accepted_at is null;
    outcome := jsonb_build_object('ok', true);
  elsif action_name = 'remove' then
    delete from public.friendships
    where player_a = least(viewer, target) and player_b = greatest(viewer, target);
    outcome := jsonb_build_object('ok', true);
  end if;
  return outcome;
end;
$$;

revoke all on function public.friends_action(uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.friends_action(uuid, text, uuid, text) to service_role;
