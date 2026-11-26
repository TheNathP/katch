import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.6.0';

const pushMigration = new URL('../migrations/20261124154339_push_delivery.sql', import.meta.url);
const colorMigration = new URL('../migrations/20261125090353_daily_challenges.sql', import.meta.url);
const triggerMigration = new URL('../migrations/20261125133756_daily_challenge_push.sql', import.meta.url);
const midnight = Date.UTC(2026, 10, 26);

const playerOne = '00000000-0000-4000-8000-000000000001';
const playerTwo = '00000000-0000-4000-8000-000000000002';
const playerWithoutDevice = '00000000-0000-4000-8000-000000000003';
const devices = ['ExpoPushToken[phone_a]', 'ExpoPushToken[phone_b]', 'ExpoPushToken[phone_c]'];

Deno.test('a new UTC challenge queues a single push per registered device', async () => {
  const db = new PGlite();
  const realNow = Date.now;

  try {
    Date.now = () => midnight - 60_000;
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      set time zone 'Pacific/Honolulu';
    `);
    await db.exec(await Deno.readTextFile(pushMigration));
    await db.exec(await Deno.readTextFile(colorMigration));
    await db.exec(await Deno.readTextFile(triggerMigration));
    await db.query('insert into auth.users (id) values ($1), ($2), ($3)', [
      playerOne,
      playerTwo,
      playerWithoutDevice,
    ]);
    await db.exec('set role service_role');
    await db.query(
      'insert into public.push_tokens (token, user_id) values ($1, $4), ($2, $4), ($3, $5)',
      [...devices, playerOne, playerTwo],
    );

    await db.query("insert into public.daily_challenges values ('2026-11-24', '#8A3FFC')");
    const loadChallenge = async () => (await db.query<{ day: string; color_hex: string }>(`
      select to_char(challenge_date, 'YYYY-MM-DD') as day, color_hex
      from public.get_or_create_daily_challenge()
    `)).rows[0];
    const [first, second] = await Promise.all([loadChallenge(), loadChallenge()]);
    assert.equal(first.day, '2026-11-25');
    assert.deepEqual(second, first);

    const loadDeliveries = async () => (await db.query<{
      event_key: string;
      token: string;
      content: { title: string; body: string; destination: string };
      expires_at: string;
    }>(`
      select event_key, token, content, expires_at::text
      from public.push_deliveries
      order by event_key, token
    `)).rows;
    const deliveries = await loadDeliveries();
    assert.deepEqual(deliveries.map(({ token }) => token), devices);
    for (const delivery of deliveries) {
      assert.equal(delivery.event_key, 'daily-challenge:2026-11-25');
      assert.equal(Date.parse(delivery.expires_at), midnight);
      assert.deepEqual(delivery.content, {
        title: 'Nouveau défi Katch',
        body: 'La couleur du jour est prête à être dévoilée !',
        destination: '/',
      });
    }

    Date.now = () => midnight + 1_000;
    assert.equal((await loadChallenge()).day, '2026-11-26');
    assert.deepEqual((await loadDeliveries()).slice(devices.length).map(({ event_key, token }) => [
      event_key,
      token,
    ]), devices.map((token) => ['daily-challenge:2026-11-26', token]));
  } finally {
    Date.now = realNow;
    await db.close();
  }
});
