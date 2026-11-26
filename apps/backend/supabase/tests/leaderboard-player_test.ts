import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.6.0';

const migrations = '../migrations/';
const viewer = '00000000-0000-0000-0000-000000000001';
const player = '00000000-0000-0000-0000-000000000002';

Deno.test('player details only reveal a photo object after participation in the same UTC challenge', async () => {
  const db = new PGlite();
  const realNow = Date.now;
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      create schema storage;
      create table storage.buckets (id text primary key, name text not null, public boolean);
      insert into storage.buckets values ('challenge-photos', 'challenge-photos', true);
      set time zone 'Pacific/Honolulu';
    `);
    for (const file of [
      '20261125133000_friends.sql',
      '20261125162249_daily_leaderboard.sql',
      '20261126084642_leaderboard_player_photo.sql',
    ]) {
      await db.exec(await Deno.readTextFile(new URL(migrations + file, import.meta.url)));
    }

    const { rows: [access] } = await db.query(`
      select public as bucket_public,
        has_function_privilege('anon', 'public.get_leaderboard_player(uuid,uuid)', 'execute') as anon,
        has_function_privilege('authenticated', 'public.get_leaderboard_player(uuid,uuid)', 'execute') as authenticated
      from storage.buckets where id = 'challenge-photos'
    `);
    assert.deepEqual(access, { bucket_public: false, anon: false, authenticated: false });

    await db.query('insert into auth.users (id) values ($1), ($2)', [viewer, player]);
    await db.exec('set role service_role');
    await db.query(`
      insert into public.social_results (player_id, challenge_date, score, photo_object_path)
      values ($1, '2026-11-25', 98, 'yesterday.jpg'), ($2, '2026-11-26', 99, 'today.jpg')
    `, [viewer, player]);
    Date.now = () => Date.UTC(2026, 10, 26, 1);

    const load = async (viewerId = viewer, playerId = player) => (await db.query(`
      select public.get_leaderboard_player($1, $2) as detail
    `, [viewerId, playerId])).rows[0];

    assert.deepEqual(await load(), {
      detail: {
        display_name: 'Pix-000000000000', score: 99, relationship: 'none', can_view_photo: false, photo_object_path: null,
      },
    });
    assert.deepEqual(await load(player, viewer), { detail: null });
    assert.deepEqual(await load(player), {
      detail: {
        display_name: 'Pix-000000000000', score: 99, relationship: 'self', can_view_photo: true, photo_object_path: 'today.jpg',
      },
    });

    await db.query('select public.friends_action($1, $2, $3)', [viewer, 'request', player]);
    await db.query(`
      insert into public.social_results (player_id, challenge_date, score) values ($1, '2026-11-26', 85)
    `, [viewer]);
    assert.deepEqual(await load(), {
      detail: {
        display_name: 'Pix-000000000000', score: 99, relationship: 'outgoing', can_view_photo: true, photo_object_path: 'today.jpg',
      },
    });
  } finally {
    Date.now = realNow;
    await db.close();
  }
});
