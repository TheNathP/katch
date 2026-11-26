import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.6.0';
import type { DailyLeaderboardResponse, LeaderboardScope } from '../functions/_shared/types.ts';

const friendsMigration = new URL('../migrations/20261125133000_friends.sql', import.meta.url);
const leaderboardMigration = new URL('../migrations/20261125162249_daily_leaderboard.sql', import.meta.url);
const player = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;

Deno.test('daily rankings use UTC, accepted friendships, and capture time to break ties', async () => {
  const db = new PGlite();
  const realNow = Date.now;
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      set time zone 'Pacific/Honolulu';
    `);
    await db.exec(await Deno.readTextFile(friendsMigration));
    for (const id of [1, 2, 3, 4, 5, 6]) {
      await db.query('insert into auth.users (id) values ($1)', [player(id)]);
    }
    await db.query(`insert into public.social_results values ($1, '2026-11-25', 98)`, [player(4)]);
    await db.exec(await Deno.readTextFile(leaderboardMigration));

    const privileges = await db.query(`
      select
        has_function_privilege('anon', 'public.get_daily_leaderboard(uuid,text)', 'execute') as anon,
        has_function_privilege('authenticated', 'public.get_daily_leaderboard(uuid,text)', 'execute') as authenticated,
        has_function_privilege('service_role', 'public.get_daily_leaderboard(uuid,text)', 'execute') as service_role
    `);
    assert.deepEqual(privileges.rows[0], { anon: false, authenticated: false, service_role: true });

    await db.exec('set role service_role');
    await db.query(`
      insert into public.friendships (player_a, player_b, requested_by, accepted_at)
      values ($1, $2, $2, now()), ($1, $3, $1, null), ($1, $4, $1, now())
    `, [player(1), player(2), player(3), player(5)]);
    await db.query(`
      insert into public.social_results (player_id, challenge_date, score, captured_at)
      values
        ($1, '2026-11-25', 98.25, '2026-11-25 01:05:00+00'),
        ($2, '2026-11-25', 98.25, '2026-11-25 01:00:00+00'),
        ($3, '2026-11-25', 99.10, '2026-11-25 01:15:00+00'),
        ($4, '2026-11-24', 100.00, '2026-11-24 14:00:00+00'),
        ($4, '2026-11-25', 98.00, '2026-11-25 01:30:00+00')
    `, [player(1), player(2), player(3), player(6)]);

    const load = async (scope: LeaderboardScope, viewer = player(1)) => {
      const { rows } = await db.query<{ board: DailyLeaderboardResponse }>(
        'select public.get_daily_leaderboard($1, $2) as board',
        [viewer, scope],
      );
      return rows[0].board;
    };

    Date.now = () => Date.UTC(2026, 10, 25, 2);
    const friends = await load('friends');
    assert.equal(friends.date, '2026-11-25');
    assert.equal(Date.parse(friends.endsAt), Date.UTC(2026, 10, 26));
    assert.deepEqual(friends.entries.map(({ playerId, score, rank }) => [playerId, score, rank]), [
      [player(2), 98.25, 1],
      [player(1), 98.25, 2],
    ]);
    assert.deepEqual(friends.currentPlayer, friends.entries[1]);

    const world = await load('world');
    assert.deepEqual(world.entries.map(({ playerId }) => playerId), [3, 2, 1, 6, 4].map(player));
    assert.equal(world.currentPlayer.rank, 3);

    const unranked = await load('friends', player(5));
    assert.deepEqual(unranked.entries.map(({ playerId }) => playerId), [player(1)]);
    assert.equal(unranked.currentPlayer.playerId, player(5));
    assert.equal(unranked.currentPlayer.rank, null);
    assert.equal(unranked.currentPlayer.score, null);

    await db.exec(`
      reset role;
      insert into auth.users (id)
      select ('00000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid
      from generate_series(100, 149) as n;
      set role service_role;
      insert into public.social_results (player_id, challenge_date, score, captured_at)
      select player_id, '2026-11-25', 100, '2026-11-25 01:00:00+00'
      from public.social_profiles where player_id >= '00000000-0000-0000-0000-000000000100';
    `);
    const crowded = await load('world');
    assert.deepEqual(crowded.entries.map(({ playerId }) => playerId), Array.from({ length: 50 }, (_, n) => player(n + 100)));
    assert.equal(crowded.currentPlayer.rank, 53);

    Date.now = () => Date.UTC(2026, 10, 26);
    const next = await load('world');
    assert.equal(next.date, '2026-11-26');
    assert.deepEqual(next.entries, []);
    assert.equal(next.currentPlayer.rank, null);
  } finally {
    Date.now = realNow;
    await db.close();
  }
});
