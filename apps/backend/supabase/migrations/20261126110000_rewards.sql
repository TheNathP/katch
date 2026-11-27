create table public.reward_shop (
  id text primary key,
  category text not null check (category in ('mascots', 'backgrounds', 'frames')),
  price integer not null check (price > 0)
);

insert into public.reward_shop (id, category, price) values
  ('original', 'mascots', 250), ('aqua', 'mascots', 400), ('spark', 'mascots', 550),
  ('rose', 'mascots', 180), ('ambre', 'mascots', 220), ('amethyste', 'mascots', 360),
  ('purple-wave', 'backgrounds', 240), ('lime-frame', 'frames', 320);

create table public.reward_purchases (
  player_id uuid not null references public.social_profiles(player_id) on delete cascade,
  item_id text not null references public.reward_shop(id),
  paid integer not null check (paid > 0),
  primary key (player_id, item_id)
);

-- Keep the best reward-eligible score independently of the leaderboard's latest photo.
create table public.reward_days (
  player_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  best_score smallint not null check (best_score between 70 and 100),
  primary key (player_id, day)
);

alter table public.reward_shop enable row level security;
alter table public.reward_purchases enable row level security;
alter table public.reward_days enable row level security;
revoke all on public.reward_shop, public.reward_purchases, public.reward_days
  from public, anon, authenticated;

alter table public.social_profiles
  add column reward_mascot_id text references public.reward_shop(id),
  add column reward_background_id text references public.reward_shop(id),
  add column reward_frame_id text references public.reward_shop(id);

create function public.remember_reward_score()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.reward_days as rewards (player_id, day, best_score)
  values (new.player_id, new.challenge_date, new.score)
  on conflict (player_id, day) do update
    set best_score = excluded.best_score
    where excluded.best_score > rewards.best_score;
  return null;
end;
$$;

create trigger remember_reward_score
after insert or update of score on public.challenge_attempts
for each row when (new.score >= 70) execute function public.remember_reward_score();

-- Award existing accounts from real attempts only. Demo state lives on old devices.
insert into public.reward_days (player_id, day, best_score)
select player_id, challenge_date, score from public.challenge_attempts where score >= 70;

create function public.get_rewards(player uuid)
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
      coalesce(sum(case when best_score = 100 then 10 when best_score > 85 then 5 else 0 end), 0) as photo_coins
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
    'coins', stats.photo_coins + (select coalesce(sum(coins), 0) from badges where progress = goal)
      - (select coalesce(sum(paid), 0) from bag),
    'owned', (select coalesce(jsonb_agg(item_id order by item_id), '[]'::jsonb) from bag),
    'items', (select jsonb_agg(jsonb_build_object('id', id, 'price', price) order by id) from public.reward_shop),
    'badges', (select jsonb_agg(jsonb_build_object(
      'id', id, 'progress', progress, 'goal', goal, 'coins', coins, 'unlocked', progress = goal
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

create function public.change_reward(player uuid, action text, item text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  product public.reward_shop%rowtype;
  already_owned boolean;
  balance jsonb;
begin
  if action is null or action not in ('purchase', 'equip', 'unequip') then
    raise exception 'invalid_request';
  end if;

  select * into product from public.reward_shop where id = item;
  if not found then raise exception 'unknown_item'; end if;

  -- Serialize competing purchases and photo updates for the same player.
  perform pg_advisory_xact_lock(hashtextextended('public.challenge_attempts:' || player::text, 0));
  balance := public.get_rewards(player);
  if balance is null then raise exception 'profile_not_found'; end if;

  select exists (select 1 from public.reward_purchases where player_id = player and item_id = item)
  into already_owned;

  if action = 'purchase' then
    if already_owned then return balance; end if;
    if (balance ->> 'coins')::bigint < product.price then raise exception 'insufficient_coins'; end if;
    insert into public.reward_purchases (player_id, item_id, paid) values (player, item, product.price);
  elsif not already_owned then
    raise exception 'item_not_owned';
  end if;

  -- Unequip is idempotent and cannot clear a newer selection of another item.
  update public.social_profiles set
    reward_mascot_id = case
      when product.category <> 'mascots' then reward_mascot_id
      when action <> 'unequip' then item
      when reward_mascot_id = item then null
      else reward_mascot_id end,
    reward_background_id = case
      when product.category <> 'backgrounds' then reward_background_id
      when action <> 'unequip' then item
      when reward_background_id = item then null
      else reward_background_id end,
    reward_frame_id = case
      when product.category <> 'frames' then reward_frame_id
      when action <> 'unequip' then item
      when reward_frame_id = item then null
      else reward_frame_id end
  where player_id = player;

  return public.get_rewards(player);
end;
$$;

revoke all on function public.remember_reward_score() from public, anon, authenticated;
revoke all on function public.get_rewards(uuid), public.change_reward(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.get_rewards(uuid), public.change_reward(uuid, text, text) to service_role;
