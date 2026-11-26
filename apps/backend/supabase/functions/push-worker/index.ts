import { timingSafeEqual } from 'node:crypto';

import { createAdminClient } from '../_shared/db.ts';
import { processPushQueue } from '../_shared/push/delivery.ts';
import { createExpoPushClient, ExpoRequestError } from '../_shared/push/expo.ts';

function matchesSecret(candidate: string | null, secret: string) {
  if (!candidate) return false;
  const encoder = new TextEncoder();
  const actual = encoder.encode(candidate);
  const expected = encoder.encode(secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }

  const secret = Deno.env.get('PUSH_WORKER_SECRET');
  if (!secret || secret.length < 32) {
    return Response.json({ error: 'push_worker_unavailable' }, { status: 503 });
  }
  if (!matchesSecret(request.headers.get('x-push-worker-secret'), secret)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await request.text().catch(() => null);
  if (body === null || !/^(?:\{\s*\})?$/.test(body.trim())) {
    return Response.json({ error: 'unexpected_request_body' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const expo = createExpoPushClient(Deno.env.get('EXPO_ACCESS_TOKEN'));
    return Response.json(await processPushQueue(admin, expo));
  } catch (error) {
    if (error instanceof ExpoRequestError) {
      console.error('Push provider unavailable', error.code);
      return Response.json({ error: 'push_provider_unavailable' }, { status: 502 });
    }
    console.error('Push worker failed');
    return Response.json({ error: 'push_worker_failed' }, { status: 500 });
  }
});
