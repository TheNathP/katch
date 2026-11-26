import { resolveUserId } from '../_shared/auth.ts';
import { createAdminClient, type AdminClient } from '../_shared/db.ts';
import type { LeaderboardPlayerResponse } from '../_shared/types.ts';

const headers = { 'Cache-Control': 'no-store' };
const uuid = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;

type PlayerRow = {
  display_name: string;
  score: number | null;
  relationship: LeaderboardPlayerResponse['relationship'];
  can_view_photo: boolean;
  photo_object_path: string | null;
};

async function getPhoto(admin: AdminClient, row: PlayerRow): Promise<LeaderboardPlayerResponse['photo']> {
  if (!row.can_view_photo) return { status: 'locked' };
  if (!row.photo_object_path) return { status: 'missing' };

  const { data, error } = await admin.storage.from('challenge-photos').createSignedUrl(row.photo_object_path, 120);
  if (error || !data) {
    console.error('Could not sign challenge photo');
    return { status: 'missing' };
  }
  return { status: 'available', url: data.signedUrl };
}

Deno.serve(async (request) => {
  if (request.method !== 'GET') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: { ...headers, Allow: 'GET' } });
  }

  try {
    const admin = createAdminClient();
    const viewer = await resolveUserId(request, admin);
    if (!viewer) return Response.json({ error: 'unauthorized' }, { status: 401, headers });

    const params = new URL(request.url).searchParams;
    const player = params.get('player');
    if (params.size !== 1 || !player || !uuid.test(player)) {
      return Response.json({ error: 'invalid_player' }, { status: 400, headers });
    }

    const { data, error } = await admin.rpc('get_leaderboard_player', {
      p_viewer: viewer,
      p_player: player,
    }).overrideTypes<PlayerRow, { merge: false }>();
    if (error) throw error;
    if (!data) return Response.json({ error: 'player_not_found' }, { status: 404, headers });
    if (!('display_name' in data)) throw new Error('Invalid player details');

    return Response.json({
      displayName: data.display_name,
      score: data.score,
      relationship: data.relationship,
      photo: await getPhoto(admin, data),
    } satisfies LeaderboardPlayerResponse, { headers });
  } catch {
    console.error('Leaderboard player request failed');
    return Response.json({ error: 'leaderboard_player_unavailable' }, { status: 500, headers });
  }
});
