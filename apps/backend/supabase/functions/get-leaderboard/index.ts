import { resolveUserId } from '../_shared/auth.ts';
import { createAdminClient } from '../_shared/db.ts';
import type { DailyLeaderboardResponse } from '../_shared/types.ts';

const headers = { 'Cache-Control': 'no-store' };

Deno.serve(async (request) => {
  if (request.method !== 'GET') {
    return Response.json({ error: 'method_not_allowed' }, {
      status: 405,
      headers: { ...headers, Allow: 'GET' },
    });
  }

  try {
    const admin = createAdminClient();
    const viewer = await resolveUserId(request, admin);
    if (!viewer) return Response.json({ error: 'unauthorized' }, { status: 401, headers });

    const params = new URL(request.url).searchParams;
    const scope = params.get('scope');
    if (params.size !== 1 || (scope !== 'friends' && scope !== 'world')) {
      return Response.json({ error: 'invalid_scope' }, { status: 400, headers });
    }

    const { data, error } = await admin.rpc('get_daily_leaderboard', {
      p_viewer: viewer,
      p_scope: scope,
    }).overrideTypes<DailyLeaderboardResponse, { merge: false }>();

    if (error || !data) throw new Error('Could not load the leaderboard');
    return Response.json(data, { headers });
  } catch {
    console.error('Daily leaderboard request failed');
    return Response.json({ error: 'leaderboard_unavailable' }, { status: 500, headers });
  }
});
