// Public catalog of profile pictures: avatar images and background colors.
//
// Deliberate exception to the "JWT required" rule: the sign-up screen needs
// this list before the player has a session. It only returns reference data
// (no player data), read-only, so `verify_jwt = false` in config.toml.
import { createAdminClient } from '../_shared/db.ts';
import type { AvatarCatalogResponse } from '../_shared/types.ts';

const AVATAR_BUCKET = 'avatars';

// The catalog changes only through migrations: let clients and CDNs reuse it.
const okHeaders = { 'Cache-Control': 'public, max-age=3600' };
const errorHeaders = { 'Cache-Control': 'no-store' };

Deno.serve(async (request) => {
  if (request.method !== 'GET') {
    return Response.json({ error: 'method_not_allowed' }, {
      status: 405,
      headers: { ...errorHeaders, Allow: 'GET' },
    });
  }
  if (new URL(request.url).search) {
    return Response.json({ error: 'unexpected_query' }, { status: 400, headers: errorHeaders });
  }

  try {
    const admin = createAdminClient();
    const [avatars, backgrounds] = await Promise.all([
      admin.from('avatars').select('id, storage_path').order('position'),
      admin.from('avatar_backgrounds').select('id, hex, label').order('position'),
    ]);
    if (avatars.error || backgrounds.error) throw new Error('Could not load avatar catalog');

    const storage = admin.storage.from(AVATAR_BUCKET);
    return Response.json(
      {
        avatars: avatars.data.map((avatar) => ({
          id: avatar.id,
          imageUrl: storage.getPublicUrl(avatar.storage_path).data.publicUrl,
        })),
        backgrounds: backgrounds.data.map(({ id, hex, label }) => ({ id, hex, label })),
      } satisfies AvatarCatalogResponse,
      { headers: okHeaders },
    );
  } catch {
    console.error('Avatar catalog request failed');
    return Response.json({ error: 'avatar_catalog_unavailable' }, { status: 500, headers: errorHeaders });
  }
});
