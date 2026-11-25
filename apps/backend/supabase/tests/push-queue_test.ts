import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.6.0';

Deno.test('push queue deduplicates events and keeps newer device registrations', async () => {
  const migration = new URL('../migrations/20261124154339_push_delivery.sql', import.meta.url);
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
    `);
    await db.exec(await Deno.readTextFile(migration));

    const userId = '00000000-0000-4000-8000-000000000001';
    const token = 'ExpoPushToken[test_device]';
    const notification = { title: 'Katch', body: 'Nouveau défi', destination: '/defi' };
    await db.query('insert into auth.users (id) values ($1)', [userId]);
    const privileges = await db.query(`
      select
        has_table_privilege('anon', 'public.push_tokens', 'select') as read_tokens,
        has_function_privilege('authenticated', 'public.claim_push_deliveries()', 'execute')
          as claim_deliveries,
        has_function_privilege('authenticated',
          'public.enqueue_push_notification(text,uuid[],jsonb,timestamptz)', 'execute')
          as enqueue_deliveries
    `);
    assert.deepEqual(privileges.rows[0], {
      read_tokens: false,
      claim_deliveries: false,
      enqueue_deliveries: false,
    });

    await db.exec('set role service_role');
    await db.query('insert into public.push_tokens (token, user_id) values ($1, $2)', [
      token,
      userId,
    ]);
    const enqueue = async (eventKey: string) => {
      const result = await db.query<{ queued: number }>(
        `
        select public.enqueue_push_notification($1, $2, $3, now() + interval '1 hour') as queued
      `,
        [eventKey, [userId, userId], JSON.stringify(notification)],
      );
      return result.rows[0].queued;
    };

    assert.equal(await enqueue('daily-challenge:example'), 1);
    assert.equal(await enqueue('daily-challenge:example'), 0);
    const claim = () =>
      db.query<{ id: string; attempts: number; token: string }>(
        'select * from public.claim_push_deliveries()',
      );
    const { rows: [delivery] } = await claim();
    assert.equal(delivery.token, token);
    assert.equal((await claim()).rows.length, 0);

    const apply = (result: Record<string, unknown>) =>
      db.query('select public.apply_push_results($1::jsonb)', [JSON.stringify([result])]);
    const attempt = { id: delivery.id, attempts: delivery.attempts };
    await apply({
      ...attempt,
      previous_status: 'sending',
      status: 'submitted',
      ticket_id: 'expo-test-ticket',
      next_action_at: new Date().toISOString(),
    });
    await db.query(
      'update public.push_tokens set registration_id = gen_random_uuid() where token = $1',
      [
        token,
      ],
    );
    await apply({
      ...attempt,
      previous_status: 'submitted',
      status: 'failed',
      error_code: 'DeviceNotRegistered',
    });

    const { rows: [outcome] } = await db.query(
      'select status, error_code from public.push_deliveries where id = $1',
      [delivery.id],
    );
    assert.deepEqual(outcome, { status: 'failed', error_code: 'DeviceNotRegistered' });
    assert.equal(await enqueue('daily-challenge:next'), 1);
  } finally {
    await db.close();
  }
});
