import { resolveUserId } from '../_shared/auth.ts';
import { createAdminClient } from '../_shared/db.ts';
import type { FriendsRequest } from '../_shared/social.types.ts';

const headers = { 'Cache-Control': 'no-store' };
const uuid = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;

function parseRequest(value: unknown): FriendsRequest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !('action' in value)) return null;

  const { action } = value;
  const keys = Object.keys(value).length;
  if (action === 'overview' && keys === 1) return { action };
  if (keys !== 2) return null;

  if (action === 'search' || action === 'rename') {
    if (!('text' in value) || typeof value.text !== 'string') return null;
    const text = value.text.trim();
    return text.length >= 2 && text.length <= 32 && !/[\u0000-\u001f\u007f]/.test(text)
      ? { action, text }
      : null;
  }

  if (action === 'profile' || action === 'request' || action === 'accept' || action === 'remove') {
    if (!('target' in value) || typeof value.target !== 'string' || !uuid.test(value.target)) return null;
    return { action, target: value.target };
  }
  return null;
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: { ...headers, Allow: 'POST' } });
  }

  try {
    const admin = createAdminClient();
    const viewer = await resolveUserId(request, admin);
    if (!viewer) return Response.json({ error: 'unauthorized' }, { status: 401, headers });

    const input = parseRequest(await request.json().catch(() => null));
    if (!input || new URL(request.url).search) {
      return Response.json({ error: 'invalid_request' }, { status: 400, headers });
    }

    const { data, error } = await admin.rpc('friends_action', {
      viewer,
      action_name: input.action,
      target: 'target' in input ? input.target : null,
      input_text: 'text' in input ? input.text : null,
    });
    if (error) throw error;
    if (!data) {
      return Response.json({ error: 'not_available' }, { status: 404, headers });
    }

    return Response.json(data, { headers });
  } catch {
    console.error('Friends request failed');
    return Response.json({ error: 'friends_unavailable' }, { status: 500, headers });
  }
});
