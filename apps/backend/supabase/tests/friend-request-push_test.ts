import assert from 'node:assert/strict';
import { PGlite } from 'npm:@electric-sql/pglite@0.6.0';

const migrations = [
  '20261124154339_push_delivery.sql',
  '20261125133000_friends.sql',
  '20261125145657_friend_request_push.sql',
];
const recipient = '00000000-0000-4000-8000-000000000001';
const otherPlayer = '00000000-0000-4000-8000-000000000002';
const sender = '00000000-0000-4000-8000-000000000003';
const recipientDevices = ['ExpoPushToken[recipient_a]', 'ExpoPushToken[recipient_b]'];
const senderDevice = 'ExpoPushToken[sender]';

Deno.test('pending friend requests notify only their recipient and cancel queued deliveries when resolved', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create role account_cleanup;
      create schema auth;
      create table auth.users (id uuid primary key);
      grant usage on schema auth to account_cleanup;
      grant select, delete on auth.users to account_cleanup;
    `);
    for (const migration of migrations.slice(0, 2)) {
      await db.exec(await Deno.readTextFile(new URL(`../migrations/${migration}`, import.meta.url)));
    }
    await db.query('insert into auth.users values ($1), ($2), ($3)', [recipient, otherPlayer, sender]);
    const action = (requester: string, name: string, target: string) =>
      db.query('select public.friends_action($1, $2, $3)', [requester, name, target]);

    await action(sender, 'request', otherPlayer);
    await db.query(
      'insert into public.push_tokens (token, user_id) values ($1, $5), ($2, $5), ($3, $6), ($4, $7)',
      [...recipientDevices, 'ExpoPushToken[other_player]', senderDevice, recipient, otherPlayer, sender],
    );
    await db.exec(await Deno.readTextFile(new URL(`../migrations/${migrations[2]}`, import.meta.url)));
    await db.exec('set role service_role');

    const deliveries = async () => (await db.query<{
      user_id: string;
      token: string;
      event_key: string;
      status: string;
      error_code: string | null;
      lifetime: number;
      content: { title: string; body: string; destination: string };
    }>(`
      select user_id, token, event_key, status, error_code, content,
        extract(epoch from expires_at - created_at)::integer as lifetime
      from public.push_deliveries
      order by token, event_key
    `)).rows;

    assert.deepEqual(await deliveries(), []);
    await Promise.all([
      action(sender, 'request', recipient),
      action(sender, 'request', recipient),
      action(recipient, 'request', sender),
    ]);
    const queued = await deliveries();
    assert.deepEqual(queued.map(({ token }) => token), recipientDevices);
    const firstEvent = queued[0].event_key;
    for (const delivery of queued) {
      assert.equal(delivery.user_id, recipient);
      assert.equal(delivery.event_key, firstEvent);
      assert.equal(delivery.status, 'pending');
      assert.equal(delivery.lifetime, 86_400);
      assert.deepEqual(delivery.content, {
        title: 'Nouvelle demande d’ami',
        body: 'Un joueur souhaite t’ajouter à ses amis.',
        destination: '/amis',
      });
    }

    await action(recipient, 'accept', sender);
    assert.ok((await deliveries()).every(({ status, error_code }) =>
      status === 'failed' && error_code === 'request_resolved'
    ));
    await action(recipient, 'remove', sender);
    await action(recipient, 'request', sender);
    const fresh = (await deliveries()).find(({ status }) => status === 'pending');
    assert.equal(fresh?.token, senderDevice);
    assert.notEqual(fresh?.event_key, firstEvent);

    await action(sender, 'remove', recipient);
    assert.ok((await deliveries()).every(({ status }) => status === 'failed'));
    await action(sender, 'request', recipient);

    await db.exec('reset role; set role account_cleanup');
    await db.query('delete from auth.users where id = $1', [sender]);
    await db.exec('reset role; set role service_role');
    const remaining = await deliveries();
    assert.equal(remaining.length, 4);
    assert.ok(remaining.every(({ status, error_code }) =>
      status === 'failed' && error_code === 'request_resolved'
    ));
    assert.equal((await db.query('select * from public.claim_push_deliveries()')).rows.length, 0);
  } finally {
    await db.close();
  }
});
