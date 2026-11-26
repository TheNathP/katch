import { resolveUserId } from '../_shared/auth.ts';
import { createAdminClient } from '../_shared/db.ts';
import type { PushRegistrationRequest, PushRegistrationResponse } from '../_shared/types.ts';

function isRegistration(input: unknown): input is PushRegistrationRequest {
  if (typeof input !== 'object' || input === null || Object.keys(input).length !== 1) {
    return false;
  }
  return 'token' in input && typeof input.token === 'string' && input.token.length <= 512 &&
    /^(?:Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$/.test(input.token);
}

Deno.serve(async (request) => {
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    return Response.json({ error: 'method_not_allowed' }, {
      status: 405,
      headers: { Allow: 'POST, DELETE' },
    });
  }

  try {
    const admin = createAdminClient();
    const userId = await resolveUserId(request, admin);
    if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 });

    const input: unknown = await request.json().catch(() => null);
    if (!isRegistration(input)) {
      return Response.json({ error: 'invalid_push_registration' }, { status: 400 });
    }

    const registered = request.method === 'POST';
    const { error } = registered
      ? await admin.from('push_tokens').upsert({
        token: input.token,
        user_id: userId,
        // Receipts from sends before this registration must not revoke it.
        registration_id: crypto.randomUUID(),
      }, { onConflict: 'token' })
      : await admin.from('push_tokens').delete().eq('token', input.token).eq('user_id', userId);

    if (error) throw new Error('Could not update push registration');
    return Response.json({ registered } satisfies PushRegistrationResponse);
  } catch {
    console.error('Push registration failed');
    return Response.json({ error: 'push_registration_failed' }, { status: 500 });
  }
});
