import { resolveUserId } from '../_shared/auth.ts';
import { createAdminClient } from '../_shared/db.ts';
import type { ChangeRewardRequest, RewardsResponse } from '../_shared/types.ts';

const headers = { 'Cache-Control': 'no-store' };
const statuses: Record<string, number> = {
  unknown_item: 404,
  unknown_badge: 404,
  badge_locked: 409,
  profile_not_found: 404,
  insufficient_coins: 409,
  item_not_owned: 403,
};

function parseAction(body: string): ChangeRewardRequest | null {
  if (body.length > 256) return null;
  try {
    const input = JSON.parse(body);
    if (!input || typeof input !== 'object' || Object.keys(input).length !== 2) return null;
    const idPattern = /^[a-z]+(?:-[a-z]+)*$/;
    if (input.action === 'claim') {
      return typeof input.badgeId === 'string' && idPattern.test(input.badgeId)
        ? { action: 'claim', badgeId: input.badgeId }
        : null;
    }
    if (!['purchase', 'equip', 'unequip'].includes(input.action) ||
        typeof input.itemId !== 'string' || !idPattern.test(input.itemId)) return null;
    return { action: input.action, itemId: input.itemId };
  } catch {
    return null;
  }
}

function fail(error: string, status: number) {
  return Response.json({ error }, { status, headers });
}

Deno.serve(async (request) => {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed' }, {
      status: 405, headers: { ...headers, Allow: 'GET, POST' },
    });
  }

  try {
    const admin = createAdminClient();
    const player = await resolveUserId(request, admin);
    if (!player) return fail('unauthorized', 401);
    if (new URL(request.url).search) return fail('invalid_request', 400);

    const change = request.method === 'POST' ? parseAction(await request.text()) : null;
    if (request.method === 'POST' && !change) return fail('invalid_request', 400);
    const query = !change
      ? admin.rpc('get_rewards', { player })
      : change.action === 'claim'
        ? admin.rpc('claim_reward_badge', { player, badge_id: change.badgeId })
        : admin.rpc('change_reward', { player, action: change.action, item: change.itemId });
    const { data, error } = await query.overrideTypes<RewardsResponse>();
    if (error) {
      const status = statuses[error.message];
      if (error.code === 'P0001' && typeof status === 'number') return fail(error.message, status);
      throw error;
    }
    if (!data) return fail('profile_not_found', 404);
    return Response.json(data, { headers });
  } catch {
    console.error('Rewards request failed');
    return fail('rewards_unavailable', 500);
  }
});
