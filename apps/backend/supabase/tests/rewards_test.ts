import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.6.0';

import type { EquippedRewards, RewardsResponse } from '../functions/_shared/types.ts';

const migrations = [
  '20261125090353_daily_challenges.sql',
  '20261125133000_friends.sql',
  '20261125141212_avatar_catalog.sql',
  '20261125162249_daily_leaderboard.sql',
  '20261126084642_leaderboard_player_photo.sql',
  '20261126095504_challenge_attempts.sql',
  '20261126103954_latest_photo_replaces_attempt.sql',
  '20261126110000_rewards.sql',
];

const player = '00000000-0000-4000-8000-000000000001';
const legacy = '00000000-0000-4000-8000-000000000003';
const stranger = '00000000-0000-4000-8000-000000000002';

Deno.test('rewards persist per player, credit each tier once, and spend the server price', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
      create schema storage;
      create table storage.buckets (
        id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]
      );
    `);

    for (const migration of migrations) {
      await db.exec(await Deno.readTextFile(new URL(`../migrations/${migration}`, import.meta.url)));
    }
    await db.query(`
      insert into auth.users (id, raw_user_meta_data)
      values ($1, '{"display_name":"TestJoueur"}'), ($2, '{"display_name":"AutreJoueur"}'),
        ($3, '{"display_name":"AncienJoueur"}')
    `, [player, stranger, legacy]);
    await db.query(`
      insert into public.reward_days (player_id, day, best_score)
      values ($1, (clock_timestamp() at time zone 'UTC')::date, 84)
    `, [legacy]);
    await db.exec(await Deno.readTextFile(
      new URL('../migrations/20261126113000_reward_coin_claims.sql', import.meta.url),
    ));
    const permissions = await db.query(`
      select has_table_privilege('authenticated', 'public.reward_purchases', 'select') as inventory,
        has_function_privilege('anon', 'public.get_rewards(uuid)', 'execute') as public_read,
        has_function_privilege('authenticated', 'public.change_reward(uuid, text, text)', 'execute') as public_write,
        has_function_privilege('service_role', 'public.change_reward(uuid, text, text)', 'execute') as server_write
    `);
    assert.deepEqual(permissions.rows[0], {
      inventory: false, public_read: false, public_write: false, server_write: true,
    });

    await db.exec('set role service_role');
    async function rewards(id = player) {
      const { rows: [row] } = await db.query<{ value: RewardsResponse }>(
        'select public.get_rewards($1) as value', [id],
      );
      return row.value;
    }
    async function change(action: string, itemId: string, id = player) {
      const { rows: [row] } = await db.query<{ value: RewardsResponse }>(
        'select public.change_reward($1, $2, $3) as value', [id, action, itemId],
      );
      return row.value;
    }

    async function claim(badgeId: string, id = player) {
      const { rows: [row] } = await db.query<{ value: RewardsResponse }>(
        'select public.claim_reward_badge($1, $2) as value', [id, badgeId],
      );
      return row.value;
    }

    const restored = await rewards(legacy);
    assert.equal(restored.coins, 25);
    assert.equal(restored.badges.find(badge => badge.id === 'first')?.claimed, true);
    assert.equal((await claim('first', legacy)).coins, 25);

    const empty = await rewards();
    assert.equal(empty.coins, 0);
    assert.equal(empty.xp, 0);
    assert.deepEqual(empty.owned, []);
    assert.deepEqual(empty.equipped, { mascots: null, backgrounds: null, frames: null });
    assert.ok(empty.badges.every(badge => !badge.eligible && !badge.claimed && badge.progress === 0));
    await assert.rejects(change('purchase', 'rose'), /insufficient_coins/);
    await assert.rejects(claim('first'), /badge_locked/);
    await assert.rejects(change('equip', 'rose'), /item_not_owned/);
    await assert.rejects(change('purchase', 'missing'), /unknown_item/);

    const { rows: [today] } = await db.query<{ date: string; hex: string }>(`
      select challenge_date::text as date, color_hex as hex from public.get_or_create_daily_challenge()
    `);

    async function submit(score: number, accountId = player) {
      const { rows: [row] } = await db.query<{ photo_coins_earned: number }>(`
        select photo_coins_earned from public.record_rewarded_challenge_attempt(
          gen_random_uuid(), $1, $2::date, $3, null, $4, '#123456', 1, $5::smallint
        )
      `, [accountId, today.date, `${accountId}/${crypto.randomUUID()}.jpg`, today.hex, score]);
      return row.photo_coins_earned;
    }
    assert.equal(await submit(69), 0);
    assert.equal((await rewards()).coins, 0);
    assert.equal(await submit(84), 0);
    const first = await rewards();
    assert.equal(first.coins, 0);
    assert.equal(first.xp, 120);
    assert.equal(first.badges.find(badge => badge.id === 'first')?.eligible, true);
    assert.equal(first.badges.find(badge => badge.id === 'first')?.claimed, false);
    assert.equal(await submit(85), 0);
    assert.equal((await rewards()).coins, 0);

    const [claimed, replay] = await Promise.all([claim('first'), claim('first')]);
    assert.equal(claimed.coins, 25);
    assert.equal(claimed.badges.find(badge => badge.id === 'first')?.claimed, true);
    assert.deepEqual(replay, claimed);
    assert.equal(await submit(86), 5);
    assert.equal((await rewards()).coins, 30);
    assert.equal(await submit(99), 0);
    assert.equal(await submit(100), 5);
    assert.equal(await submit(100), 0);
    assert.equal(await submit(20), 0);
    assert.equal((await rewards()).coins, 35);
    assert.deepEqual((await rewards()).validatedDays, [today.date]);

    const latest = await db.query<{ score: number }>('select score::int from public.social_results where player_id = $1', [player]);
    assert.equal(latest.rows[0].score, 20);

    // Create genuine attempts on prior days to reach the shop prices.
    await db.exec('reset role');
    await db.query(`
      insert into public.daily_challenges (challenge_date, color_hex)
      select $1::date - days, $2 from generate_series(1, 100) days
    `, [today.date, today.hex]);
    await db.query(`
      insert into public.challenge_attempts
        (id, player_id, challenge_date, photo_path, target_hex, matched_hex, delta_e, score)
      select gen_random_uuid(), $1::uuid, $2::date - days, ($1::uuid)::text || '/' || days || '.jpg', $3, $3, 0, 100
      from generate_series(1, 100) days
    `, [player, today.date, today.hex]);
    await db.exec('set role service_role');

    for (const badge of ['three', 'seven', 'level', 'ten']) await claim(badge);
    const funded = await rewards();
    assert.equal(funded.validatedDays.length, 101);
    assert.equal(funded.coins, 101 * 10 + 25 + 35 + 70 + 90 + 60);
    const [bought, retried] = await Promise.all([change('purchase', 'rose'), change('purchase', 'rose')]);
    assert.equal(bought.coins, funded.coins - 180);
    assert.deepEqual(retried, bought);
    assert.deepEqual(bought.owned, ['rose']);
    assert.equal(bought.equipped.mascots, 'rose');

    assert.equal((await claim('style')).coins, bought.coins + 30);
    await change('purchase', 'purple-wave');
    const framed = await change('purchase', 'lime-frame');
    const equipped: EquippedRewards = { mascots: 'rose', backgrounds: 'purple-wave', frames: 'lime-frame' };
    assert.deepEqual(framed.equipped, equipped);
    assert.deepEqual((await db.query(`
      select reward_mascot_id as mascots, reward_background_id as backgrounds, reward_frame_id as frames
      from public.social_profiles where player_id = $1
    `, [player])).rows[0], equipped);

    const unequipped = await change('unequip', 'rose');
    assert.equal(unequipped.equipped.mascots, null);
    assert.equal(unequipped.equipped.backgrounds, 'purple-wave');
    assert.equal(unequipped.coins, framed.coins);
    assert.ok(unequipped.owned.includes('rose'));
    assert.deepEqual((await change('equip', 'rose')).equipped, equipped);
    assert.deepEqual(await rewards(stranger), empty);
    await assert.rejects(change('equip', 'rose', stranger), /item_not_owned/);
    await assert.rejects(claim('first', stranger), /badge_locked/);

    const afterAnotherPurchase = await change('purchase', 'original');
    assert.equal(afterAnotherPurchase.coins, framed.coins - 250);
    const rejectedPurchase = await rewards();
    await assert.rejects(change('purchase', 'spark'), /insufficient_coins/);
    assert.deepEqual(await rewards(), rejectedPurchase);
    assert.equal(await submit(100, stranger), 10);
    assert.equal((await rewards(stranger)).coins, 10);
    assert.equal((await rewards(stranger)).badges.find(badge => badge.id === 'first')?.claimed, false);
  } finally {
    await db.close();
  }
});
