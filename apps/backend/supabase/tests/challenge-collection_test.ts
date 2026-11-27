import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.6.0';

type Palette = {
  offeredCount: number | null;
  validatedCount: number | null;
  entries: { date: string; hex: string | null; score: number; photoPath: string | null }[];
  nextCursor: string | null;
};

Deno.test('personal collection and gallery paginate globally in hue order with different eligibility', async () => {
  const db = new PGlite();
  const player = '00000000-0000-0000-0000-000000000001';
  const other = '00000000-0000-0000-0000-000000000002';
  const today = '2026-11-26';
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role;
      create schema auth;
      create table auth.users(id uuid primary key, created_at timestamptz);
      create table public.daily_challenges(challenge_date date primary key, color_hex text);
      create table public.social_results(challenge_date date, player_id uuid, score numeric(5,2), photo_object_path text);
      insert into auth.users values ('${player}', '2026-10-25 22:00:00+00');
      insert into public.daily_challenges
        select date '2026-10-25' + day, '#6424E8' from generate_series(0, 34) day;
      update public.daily_challenges set color_hex = case challenge_date
        when '2026-11-23' then '#FF0000'
        when '2026-11-24' then '#FFFF00'
        when '2026-10-31' then '#00FF00'
        when '2026-11-20' then '#0000FF'
        when '2026-11-18' then '#DDDDDD'
        else color_hex end;
      insert into public.social_results (challenge_date, player_id, score)
        select date '2026-10-25' + day, '${player}', 91.25 from generate_series(0, 28) day;
      insert into public.social_results (challenge_date, player_id, score) values
        ('2026-11-23', '${player}', 90.00),
        ('2026-11-24', '${player}', 89.99),
        ('2026-11-25', '${other}', 100.00),
        ('2026-11-27', '${player}', 99.00);
      update public.social_results set photo_object_path = challenge_date::text || '.jpg'
        where challenge_date in ('2026-11-23', '2026-11-24', '2026-10-31', '2026-11-18', '2026-11-25', '2026-11-27');
      insert into public.social_results values ('2026-10-24', '${player}', 83.00, 'older.jpg');
    `);
    await db.exec(await Deno.readTextFile(new URL(
      '../migrations/20261126155447_my_challenge_collection.sql',
      import.meta.url,
    )));
    await db.exec('set role service_role');

    async function page(before: string | null, gallery = false) {
      const { rows } = await db.query<{ palette: Palette }>(
        'select public.get_my_challenge_palette($1, $2, $3, $4, $5) as palette',
        [player, before, today, 90, gallery],
      );
      return rows[0].palette;
    }

    const first = await page(null);
    assert.equal(first.validatedCount, 30);
    assert.equal(first.offeredCount, 33);
    assert.equal(first.entries.length, 24);
    assert.deepEqual(first.entries[0], { date: '2026-11-23', hex: '#FF0000', score: 90, photoPath: null });
    assert.deepEqual(first.entries.slice(0, 3).map(color => color.hex), ['#FF0000', '#00FF00', '#0000FF']);
    assert.equal(first.nextCursor, first.entries.at(-1)?.date);
    const last = await page(first.nextCursor);
    assert.equal(last.validatedCount, 30);
    assert.equal(last.entries.length, 6);
    assert.equal(last.nextCursor, null);
    assert.equal(last.entries.at(-1)?.hex, '#DDDDDD');
    assert.equal(new Set([...first.entries, ...last.entries].map(color => color.date)).size, 30);

    const gallery = await page(null, true);
    assert.deepEqual(gallery.entries.map(color => color.hex), ['#FF0000', '#FFFF00', '#00FF00', '#DDDDDD', null]);
    assert.equal(gallery.entries[1].score, 89.99);
    assert.equal(gallery.entries[2].date, '2026-10-31');
    assert.equal(gallery.entries[2].photoPath, '2026-10-31.jpg');

    await db.exec('reset role');
    const { rows } = await db.query<{ authenticated: boolean; service_role: boolean }>(`
      select
        has_function_privilege('authenticated', 'public.get_my_challenge_palette(uuid,date,date,numeric,boolean)', 'execute') as authenticated,
        has_function_privilege('service_role', 'public.get_my_challenge_palette(uuid,date,date,numeric,boolean)', 'execute') as service_role
    `);
    assert.deepEqual(rows, [{ authenticated: false, service_role: true }]);
  } finally {
    await db.close();
  }
});
