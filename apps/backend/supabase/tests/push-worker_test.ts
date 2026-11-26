import assert from 'node:assert/strict';

import {
  createExpoPushClient,
  type ExpoMessage,
  ExpoRequestError,
} from '../functions/_shared/push/expo.ts';
import { enqueuePushNotification } from '../functions/_shared/push/delivery.ts';

type Handler = (request: Request) => Response | Promise<Response>;
const handlers: Handler[] = [];
const originalServe = Deno.serve;
Object.defineProperty(Deno, 'serve', { value: (handler: Handler) => handlers.push(handler) });
try {
  await import('../functions/push-registration/index.ts');
  await import('../functions/push-worker/index.ts');
} finally {
  Object.defineProperty(Deno, 'serve', { value: originalServe });
}
const [registration, worker] = handlers;
const secret = 'fake-test-secret-000000000000000000000000';
const userId = '00000000-0000-4000-8000-000000000001';
const token = 'ExpoPushToken[test_device]';

Deno.env.set('SUPABASE_URL', 'https://supabase.test');
Deno.env.set('SUPABASE_SECRET_KEYS', '{}');
Deno.env.set('EXPO_ACCESS_TOKEN', 'fake-expo-access-token');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'stub-service-role');
Deno.env.set('PUSH_WORKER_SECRET', secret);

async function withFetch(
  fn: (req: Request) => Promise<Response> | Response,
  use: () => Promise<void>,
) {
  const saved = globalThis.fetch;
  globalThis.fetch = async (input, init) => await fn(new Request(input, init));
  try {
    await use();
  } finally {
    globalThis.fetch = saved;
  }
}

function makeRequest(method: string, body?: unknown, headers: Record<string, string> = {}) {
  return new Request('https://edge.test/functions/v1/test', {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

Deno.test('registration uses authenticated ownership and rejects unexpected fields', async () => {
  const requests: Request[] = [];
  const auth = { Authorization: 'Bearer fake-user-jwt' };
  await withFetch((req) => {
    const url = new URL(req.url);
    if (url.pathname === '/auth/v1/user') {
      assert.equal(req.headers.get('authorization'), 'Bearer fake-user-jwt');
      return Response.json({ id: userId, aud: 'authenticated', role: 'authenticated' });
    }
    assert.equal(url.pathname, '/rest/v1/push_tokens');
    requests.push(req);
    return new Response(null, { status: 204 });
  }, async () => {
    assert.equal((await registration(makeRequest('POST', { token }))).status, 401);
    assert.equal(
      (await registration(makeRequest('POST', { token, user_id: 'spoofed' }, auth))).status,
      400,
    );
    assert.equal((await registration(makeRequest('POST', { token: 'invalid' }, auth))).status, 400);
    assert.equal(requests.length, 0);
    assert.deepEqual(await (await registration(makeRequest('POST', { token }, auth))).json(), {
      registered: true,
    });
    const insert = await requests[0].json();
    assert.equal(insert.user_id, userId);
    assert.equal(insert.token, token);
    assert.ok(insert.registration_id);
    assert.deepEqual(await (await registration(makeRequest('DELETE', { token }, auth))).json(), {
      registered: false,
    });
    const deleting = new URL(requests[1].url);
    assert.equal(deleting.searchParams.get('user_id'), 'eq.' + userId);
    assert.equal(deleting.searchParams.get('token'), 'eq.' + token);
  });
});

Deno.test('worker batches, processes tickets and receipts, and gates access', async () => {
  const now = Date.now();
  const expiry = new Date(now + 60 * 60_000).toISOString();
  const submitted = new Date(now - 17 * 60_000).toISOString();
  const content = { title: 'Katch', body: 'Défi', destination: '/defi' as const };
  const pushed: unknown[] = [];
  const outcomes: {
    id: string;
    ticket_id?: string;
    status: string;
    error_code?: string;
    next_action_at?: string;
  }[] = [];
  const header = { 'x-push-worker-secret': secret };
  await withFetch(async (req) => {
    const path = new URL(req.url).pathname;
    if (path.endsWith('/claim_push_deliveries')) {
      return Response.json([
        { id: 'queued-ok', token, content, attempts: 1, expires_at: expiry },
        {
          id: 'queued-dead',
          token: 'ExpoPushToken[other]',
          content,
          attempts: 1,
          expires_at: expiry,
        },
        {
          id: 'queued-rate',
          token: 'ExpoPushToken[rate]',
          content,
          attempts: 2,
          expires_at: expiry,
        },
      ]);
    }
    if (path.endsWith('/apply_push_results')) {
      outcomes.push(...(await req.json()).p_results);
      return Response.json(null);
    }
    if (path.endsWith('/push_deliveries')) {
      return Response.json([
        {
          id: 'seen',
          ticket_id: 'ticket-seen',
          submitted_at: submitted,
          attempts: 1,
          expires_at: expiry,
        },
        {
          id: 'waiting',
          ticket_id: 'ticket-absent',
          submitted_at: submitted,
          attempts: 1,
          expires_at: expiry,
        },
        {
          id: 'invalid',
          ticket_id: 'ticket-invalid',
          submitted_at: submitted,
          attempts: 1,
          expires_at: expiry,
        },
        {
          id: 'expired',
          ticket_id: 'ticket-expired',
          submitted_at: new Date(now - 25 * 60 * 60_000).toISOString(),
          attempts: 1,
          expires_at: expiry,
        },
      ]);
    }
    if (path.endsWith('/push/send')) {
      pushed.push(...await req.json());
      return Response.json({
        data: [
          { status: 'ok', id: 'provider-ticket' },
          {
            status: 'error',
            message: 'sensitive provider text',
            details: { error: 'DeviceNotRegistered' },
          },
          { status: 'error', details: { error: 'MessageRateExceeded' } },
        ],
      });
    }
    if (path.endsWith('/push/getReceipts')) {
      assert.deepEqual(await req.json(), {
        ids: ['ticket-seen', 'ticket-absent', 'ticket-invalid'],
      });
      return Response.json({
        data: {
          'ticket-seen': { status: 'ok' },
          'ticket-invalid': { status: 'error', details: { error: 'DeviceNotRegistered' } },
        },
      });
    }
    throw Error('Unexpected request ' + path);
  }, async () => {
    assert.equal((await worker(makeRequest('POST'))).status, 401);
    assert.equal((await worker(makeRequest('POST', { arbitrary: true }, header))).status, 400);
    assert.equal((await worker(makeRequest('GET', undefined, header))).status, 405);
    assert.equal(pushed.length, 0);
    const response = await worker(makeRequest('POST', {}, header));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { processedSends: 3, checkedReceipts: 4 });
    assert.equal(pushed.length, 3);
    assert.deepEqual((pushed[0] as ExpoMessage).data, { destination: '/defi' });
    const results = Object.fromEntries(outcomes.map((entry) => [entry.id, entry]));
    assert.equal(results['queued-ok'].ticket_id, 'provider-ticket');
    assert.equal(results['queued-ok'].status, 'submitted');
    assert.equal(results['queued-dead'].error_code, 'DeviceNotRegistered');
    assert.equal(results['queued-rate'].status, 'pending');
    assert.ok(Date.parse(results['queued-rate'].next_action_at ?? '') >= now + 120_000);
    assert.equal(results['seen'].status, 'accepted');
    assert.equal(results['invalid'].error_code, 'DeviceNotRegistered');
    assert.equal(results['waiting'].status, 'submitted');
    assert.equal(results['expired'].error_code, 'receipt_expired');
    assert.ok(!JSON.stringify(outcomes).includes('sensitive provider text'));
  });
});

Deno.test('provider backoff and ambiguous send classification', async () => {
  const message: ExpoMessage = {
    to: token,
    title: 'Katch',
    body: 'Défi',
    data: { destination: '/defi' },
    expiration: 2000000000,
    sound: 'default',
  };
  const rate = createExpoPushClient(undefined, async () => new Response(null, { status: 429 }));
  await assert.rejects(
    rate.send([message]),
    (err) => err instanceof ExpoRequestError && err.retryable && err.code === 'expo_http_429',
  );
  const ambiguous = createExpoPushClient(undefined, async () => Response.json({ data: [] }));
  await assert.rejects(
    ambiguous.send([message]),
    (err) => err instanceof ExpoRequestError && !err.retryable && err.code === 'delivery_unknown',
  );
  const timeout = createExpoPushClient(undefined, async () => {
    throw Error('network interrupted');
  });
  await assert.rejects(
    timeout.send([message]),
    (err) => err instanceof ExpoRequestError && !err.retryable && err.code === 'delivery_unknown',
  );
});

Deno.test('future events enqueue once per recipient set and validate payload size', async () => {
  const notification = { title: 'Katch', body: 'Défi', destination: '/defi' as const };
  await withFetch(async (req) => {
    assert.ok(new URL(req.url).pathname.endsWith('/enqueue_push_notification'));
    const args = await req.json();
    assert.deepEqual(args.p_user_ids, [userId]);
    assert.equal(args.p_event_key, 'defi:stable-key');
    assert.deepEqual(args.p_content, notification);
    return Response.json(1);
  }, async () => {
    const event = { eventKey: 'defi:stable-key', userIds: [userId, userId], notification };
    assert.equal(await enqueuePushNotification(event), 1);
    assert.equal(await enqueuePushNotification({ ...event, expiresAt: new Date(0) }), 0);
    await assert.rejects(
      enqueuePushNotification({
        ...event,
        notification: { ...notification, body: '🎉'.repeat(800) },
      }),
    );
  });
});
