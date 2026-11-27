begin;

create table public.reward_badge_claims (
  player_id uuid not null references public.social_profiles(player_id) on delete cascade,
  badge_id text not null,
  coins integer not null check (coins > 0),
  primary key (player_id, badge_id)
);

alter table public.reward_badge_claims enable row level security;
revoke all on public.reward_badge_claims from public, anon, authenticated;

-- Preserve badge coins already included in existing balances, including spent coins.
lock table public.reward_days, public.reward_purchases in share row exclusive mode;
with players as (
  select player_id from public.reward_days
  union
  select player_id from public.reward_purchases
)
insert into public.reward_badge_claims (player_id, badge_id, coins)
select players.player_id, badge->>'id', (badge->>'coins')::integer
from players
cross join lateral jsonb_array_elements(public.get_rewards(players.player_id)->'badges') as badge
where (badge->>'unlocked')::boolean;

create function public.photo_reward_coins(score smallint)
returns integer language sql immutable set search_path = ''
as $$
  select case when score = 100 then 10 when score > 85 then 5 else 0 end;
$$;

create or replace function public.get_rewards(player uuid)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  with days as (
    select day, best_score, day - row_number() over (order by day)::integer as streak_group
    from public.reward_days where player_id = player
  ),
  streaks as (
    select count(*)::integer as length from days group by streak_group
  ),
  bag as (
    select purchases.item_id, purchases.paid, shop.category
    from public.reward_purchases purchases
    join public.reward_shop shop on shop.id = purchases.item_id
    where purchases.player_id = player
  ),
  stats as (
    select count(*)::integer as total,
      coalesce((select max(length) from streaks), 0) as best_streak,
      coalesce(sum(public.photo_reward_coins(best_score)), 0) as photo_coins
    from days
  ),
  badges as (
    select badge.id, badge.goal, badge.coins, least(badge.progress, badge.goal) as progress
    from stats cross join lateral (values
      ('first', 1, 25, stats.total),
      ('three', 3, 35, stats.best_streak),
      ('seven', 7, 70, stats.best_streak),
      ('level', 3, 90, stats.total * 120 / 600),
      ('ten', 10, 60, stats.total),
      ('style', 1, 30, (select count(*)::integer from bag where category = 'mascots'))
    ) badge(id, goal, coins, progress)
  )
  select jsonb_build_object(
    'coins', stats.photo_coins + (select coalesce(sum(coins), 0) from public.reward_badge_claims where player_id = player)
      - (select coalesce(sum(paid), 0) from bag),
    'owned', (select coalesce(jsonb_agg(item_id order by item_id), '[]'::jsonb) from bag),
    'items', (select jsonb_agg(jsonb_build_object('id', id, 'price', price) order by id) from public.reward_shop),
    'badges', (select jsonb_agg(jsonb_build_object(
      'id', id, 'progress', progress, 'goal', goal, 'coins', coins, 'eligible', progress = goal,
      'claimed', exists (select 1 from public.reward_badge_claims claimed where claimed.player_id = player and claimed.badge_id = badges.id)
    ) order by id) from badges),
    'validatedDays', (select coalesce(jsonb_agg(day order by day), '[]'::jsonb) from days),
    'xp', stats.total * 120,
    'xpPerLevel', 600,
    'equipped', jsonb_build_object(
      'mascots', profile.reward_mascot_id,
      'backgrounds', profile.reward_background_id,
      'frames', profile.reward_frame_id
    )
  )
  from stats cross join public.social_profiles profile
  where profile.player_id = player;
$$;

create function public.claim_reward_badge(player uuid, badge_id text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  summary jsonb;
  badge jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended('public.challenge_attempts:' || player::text, 0));
  summary := public.get_rewards(player);
  if summary is null then raise exception 'profile_not_found'; end if;

  select entry into badge
  from jsonb_array_elements(summary->'badges') as entry
  where entry->>'id' = badge_id;
  if badge is null then raise exception 'unknown_badge'; end if;
  if not (badge->>'eligible')::boolean then raise exception 'badge_locked'; end if;

  insert into public.reward_badge_claims (player_id, badge_id, coins)
  values (player, badge_id, (badge->>'coins')::integer)
  on conflict on constraint reward_badge_claims_pkey do nothing;

  return public.get_rewards(player);
end;
$$;

-- Report the coin delta while holding the same lock as submissions and purchases.
-- The original RPC remains available during deployment and for existing clients.
create function public.record_rewarded_challenge_attempt(
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
returns table (submitted_at timestamptz, replaced_photo_path text, photo_coins_earned integer)
language plpgsql security definer set search_path = ''
as $$
declare
  previous_coins integer;
  current_coins integer;
  recorded record;
begin
  perform pg_advisory_xact_lock(hashtextextended('public.challenge_attempts:' || attempt_player::text, 0));
  select public.photo_reward_coins(best_score) into previous_coins
  from public.reward_days where player_id = attempt_player and day = attempt_date;

  select * into recorded from public.record_challenge_attempt(
    attempt_id, attempt_player, attempt_date, attempt_photo_path, attempt_taken_at,
    attempt_target_hex, attempt_matched_hex, attempt_delta_e, attempt_score
  );

  select public.photo_reward_coins(best_score) into current_coins
  from public.reward_days where player_id = attempt_player and day = attempt_date;

  return query select recorded.submitted_at, recorded.replaced_photo_path,
    coalesce(current_coins, 0) - coalesce(previous_coins, 0);
end;
$$;

revoke all on function public.photo_reward_coins(smallint), public.claim_reward_badge(uuid, text),
  public.record_rewarded_challenge_attempt(uuid, uuid, date, text, timestamptz, text, text, real, smallint)
  from public, anon, authenticated;
grant execute on function public.claim_reward_badge(uuid, text),
  public.record_rewarded_challenge_attempt(uuid, uuid, date, text, timestamptz, text, text, real, smallint)
  to service_role;

commit;
