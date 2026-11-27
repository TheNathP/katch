import { resolveUserId } from '../_shared/auth.ts';
import { createAdminClient, type AdminClient } from '../_shared/db.ts';
import { pixReactions, type FriendProfile, type FriendsRequest, type PhotoReactions, type PixReaction } from '../_shared/social.types.ts';

const headers = { 'Cache-Control': 'no-store' };
const uuid = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;

function parseRequest(value: unknown): FriendsRequest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !('action' in value)) return null;

  const { action } = value;
  const keys = Object.keys(value).length;
  if (action === 'overview' && keys === 1) return { action };
  if (action === 'react' && keys === 3) {
    if (!('attempt' in value) || typeof value.attempt !== 'string' || !uuid.test(value.attempt)) return null;
    if (!('reaction' in value)) return null;
    const reaction = value.reaction === null ? null : pixReactions.find(option => option === value.reaction);
    return reaction === undefined ? null : { action, attempt: value.attempt, reaction };
  }
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

type Activity = Omit<FriendProfile, 'results'> & {
  results: {
    date: string;
    score: number;
    photo: { status: 'locked' | 'missing' } | { status: 'available'; id: string; path: string; reactions: PhotoReactions };
  }[];
};

async function getActivity(admin: AdminClient, viewer: string, target: string): Promise<FriendProfile | null> {
  const { data, error } = await admin.rpc('get_friend_activity', {
    p_viewer: viewer, p_target: target,
  }).overrideTypes<Activity, { merge: false }>();
  if (error) throw error;
  if (!data) return null;
  if (!('results' in data)) throw new Error('Invalid activity response');

  const paths = data.results.flatMap(({ photo }) => photo.status === 'available' ? [photo.path] : []);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed, error: signError } = await admin.storage.from('challenge-photos').createSignedUrls(paths, 120);
    if (signError) console.error('Could not sign friend challenge photos');
    for (const item of signed ?? []) {
      if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
    }
  }

  return {
    ...data,
    results: data.results.map(({ date, score, photo }) => {
      if (photo.status !== 'available') return { date, score, photo };
      const url = urls.get(photo.path);
      return {
        date, score, photo: url
          ? { status: 'available', id: photo.id, url, reactions: photo.reactions }
          : { status: 'unavailable' },
      };
    }),
  };
}

async function setReaction(admin: AdminClient, viewer: string, attempt: string, reaction: PixReaction | null) {
  const { data, error } = await admin.rpc('set_friend_photo_reaction', {
    p_viewer: viewer, p_attempt: attempt, p_reaction: reaction,
  }).overrideTypes<PhotoReactions, { merge: false }>();
  if (error) throw error;
  if (data && !('myReaction' in data)) throw new Error('Invalid reaction response');
  return data;
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

    if (input.action === 'profile') {
      const profile = await getActivity(admin, viewer, input.target);
      return profile
        ? Response.json(profile, { headers })
        : Response.json({ error: 'not_available' }, { status: 404, headers });
    }

    if (input.action === 'react') {
      const result = await setReaction(admin, viewer, input.attempt, input.reaction);
      return result
        ? Response.json(result, { headers })
        : Response.json({ error: 'reaction_not_available' }, { status: 403, headers });
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
