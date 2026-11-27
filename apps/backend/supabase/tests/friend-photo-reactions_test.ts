import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.6.0';

import type { PhotoReactions, PixReaction } from '../functions/_shared/social.types.ts';

const migrations = [
  '20261125090353_daily_challenges.sql',
  '20261125133000_friends.sql',
  '20261125162249_daily_leaderboard.sql',
  '20261126084642_leaderboard_player_photo.sql',
  '20261126095504_challenge_attempts.sql',
  '20261126103954_latest_photo_replaces_attempt.sql',
  '20261127092644_friend_photo_reactions.sql',
];

const viewer = '00000000-0000-4000-8000-000000000001';
const owner = '00000000-0000-4000-8000-000000000002';
const stranger = '00000000-0000-4000-8000-000000000003';
const oldPhoto = '00000000-0000-4000-8000-000000000004';
const newPhoto = '00000000-0000-4000-8000-000000000005';
const replacement = '00000000-0000-4000-8000-000000000006';

type TestActivity = {
  relationship: string;
  canViewResults: boolean;
  results: { photo: { status: string; path?: string; reactions?: PhotoReactions } }[];
};

Deno.test('friend photo reactions respect friendship, challenge day and photo replacement', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      create schema storage;
      create table storage.buckets (
        id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]
      );
    `);
    for (const migration of migrations) {
      await db.exec(await Deno.readTextFile(new URL(`../migrations/${migration}`, import.meta.url)));
    }

    const { rows: [grants] } = await db.query(`
      select has_table_privilege('authenticated', 'public.friend_photo_reactions', 'select') as read,
        has_function_privilege('authenticated', 'public.get_friend_activity(uuid,uuid)', 'execute') as profile,
        has_function_privilege('anon', 'public.set_friend_photo_reaction(uuid,uuid,text)', 'execute') as react
    `);
    assert.deepEqual(grants, { read: false, profile: false, react: false });

    await db.query('insert into auth.users (id) values ($1), ($2), ($3)', [viewer, owner, stranger]);
    await db.exec(`
      insert into public.daily_challenges (challenge_date, color_hex)
      values ((statement_timestamp() at time zone 'UTC')::date - 3, '#FF8000'),
             ((statement_timestamp() at time zone 'UTC')::date, '#FF8000')
      on conflict (challenge_date) do update set color_hex = excluded.color_hex;
      set role service_role;
    `);
    await db.query(`
      insert into public.challenge_attempts (id, player_id, challenge_date, photo_path, target_hex, matched_hex, delta_e, score)
      values ($1, $3, (statement_timestamp() at time zone 'UTC')::date - 3, 'old.jpg', '#FF8000', '#FF8000', 0, 100),
             ($2, $3, (statement_timestamp() at time zone 'UTC')::date, 'new.jpg', '#FF8000', '#FF8000', 0, 100)
    `, [oldPhoto, newPhoto, owner]);
    await db.exec(`
      insert into public.social_results (player_id, challenge_date, score, photo_object_path)
      select player_id, challenge_date, score, photo_path from public.challenge_attempts
    `);
    await db.query(`
      insert into public.social_results (player_id, challenge_date, score)
      values ($1, (statement_timestamp() at time zone 'UTC')::date - 4, 90)
    `, [owner]);

    async function profile(id = viewer) {
      const { rows: [row] } = await db.query<{ result: TestActivity }>(
        'select public.get_friend_activity($1, $2) as result', [id, owner],
      );
      return row.result;
    }
    async function leaderboardPhoto(id = viewer) {
      const { rows: [row] } = await db.query<{ result: {
        can_view_photo: boolean;
        reaction_context?: { id: string; reactions: PhotoReactions };
      } }>('select public.get_leaderboard_player_with_reactions($1, $2) as result', [id, owner]);
      return row.result;
    }
    async function react(attempt: string, reaction: PixReaction | null, id = viewer) {
      const { rows: [row] } = await db.query<{ result: PhotoReactions | null }>(
        'select public.set_friend_photo_reaction($1, $2, $3) as result', [id, attempt, reaction],
      );
      return row.result;
    }
    async function friendship(actor: string, action: string, target: string) {
      await db.query('select public.friends_action($1, $2, $3)', [actor, action, target]);
    }

    assert.deepEqual((await profile()).results, []);
    assert.equal(await react(oldPhoto, 'like'), null);
    await friendship(viewer, 'request', owner);
    assert.equal((await profile()).canViewResults, false);
    assert.equal(await react(oldPhoto, 'like'), null);

    await friendship(owner, 'accept', viewer);
    const activity = await profile();
    assert.equal(activity.relationship, 'friend');
    assert.deepEqual(activity.results.map(result => result.photo.status), ['locked', 'available']);
    assert.equal(activity.results[0].photo.path, undefined);
    assert.equal((await profile(owner)).results[0].photo.path, 'new.jpg');
    assert.equal(await react(newPhoto, 'like'), null);
    assert.equal((await leaderboardPhoto()).reaction_context, undefined);
    assert.equal(await react(oldPhoto, 'like', stranger), null);
    assert.equal(await react(oldPhoto, 'like', owner), null);
    assert.deepEqual(await react(oldPhoto, 'like'), { counts: { like: 1 }, myReaction: 'like' });
    assert.deepEqual(await react(oldPhoto, 'like'), { counts: { like: 1 }, myReaction: 'like' });
    assert.deepEqual(await react(oldPhoto, 'love'), { counts: { love: 1 }, myReaction: 'love' });
    assert.deepEqual((await profile(owner)).results[1].photo.reactions, { counts: { love: 1 }, myReaction: null });
    assert.deepEqual(await react(oldPhoto, null), { counts: {}, myReaction: null });

    await db.query(`
      insert into public.social_results (player_id, challenge_date, score)
      values ($1, (statement_timestamp() at time zone 'UTC')::date, 85)
    `, [viewer]);
    assert.equal((await profile()).results[0].photo.path, 'new.jpg');
    assert.deepEqual(await react(newPhoto, 'wow'), { counts: { wow: 1 }, myReaction: 'wow' });
    assert.deepEqual((await leaderboardPhoto()).reaction_context, {
      id: newPhoto, reactions: { counts: { wow: 1 }, myReaction: 'wow' },
    });
    await db.query(`
      insert into public.social_results (player_id, challenge_date, score)
      values ($1, (statement_timestamp() at time zone 'UTC')::date, 85)
    `, [stranger]);
    assert.equal((await leaderboardPhoto(stranger)).can_view_photo, true);
    assert.equal((await leaderboardPhoto(stranger)).reaction_context, undefined);
    await db.query(`
      select public.record_challenge_attempt($1, $2, (clock_timestamp() at time zone 'UTC')::date,
        'replacement.jpg', null, '#FF8000', '#FF8000', 0::real, 100::smallint)
    `, [replacement, owner]);
    assert.equal(await react(newPhoto, 'wow'), null);
    assert.deepEqual((await profile()).results[0].photo.reactions, { counts: {}, myReaction: null });
    assert.deepEqual(await react(replacement, 'laugh'), { counts: { laugh: 1 }, myReaction: 'laugh' });

    await friendship(owner, 'remove', viewer);
    assert.deepEqual((await profile()).results, []);
    assert.equal(await react(replacement, 'love'), null);
    assert.deepEqual((await profile(owner)).results[0].photo.reactions, { counts: {}, myReaction: null });
  } finally {
    await db.close();
  }
});
