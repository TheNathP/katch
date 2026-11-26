import { resolveUserId } from '../_shared/auth.ts';
import { createAdminClient, type AdminClient } from '../_shared/db.ts';
import type { ChallengeHistoryEntry, ChallengeHistoryResponse, ColorCollectionResponse, PhotoGalleryResponse } from '../_shared/types.ts';

const headers = { 'Cache-Control': 'private, no-store' };
const collectionThreshold = 90;
const signedUrlLifetime = 600;

type Selection =
  | { kind: 'history'; start: string; end: string }
  | { kind: 'collection' | 'gallery'; before: string | null };

type PaletteRow = {
  date: string;
  hex: string | null;
  score: number;
  photoPath: string | null;
};

type PalettePage = {
  entries: PaletteRow[];
  nextCursor: string | null;
  offeredCount: number | null;
  validatedCount: number | null;
};

function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1000-01-01') return false;
  const parsed = new Date(value + 'T00:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function readSelection(params: URLSearchParams, today: string): Selection | null {
  const month = params.get('month');
  const date = params.get('date');
  const before = params.get('collection') ?? params.get('gallery');
  if (params.size > 1 || (params.size === 1 && month === null && date === null && before === null)) {
    return null;
  }
  if (before !== null) {
    const kind = params.has('gallery') ? 'gallery' : 'collection';
    if (before === 'latest') return { kind, before: null };
    return isDate(before) && before <= today ? { kind, before } : null;
  }
  if (date !== null) {
    return isDate(date) && date <= today ? { kind: 'history', start: date, end: date } : null;
  }
  const start = (month ?? today.slice(0, 7)) + '-01';
  if (!isDate(start) || start > today) return null;
  const [year, number] = start.split('-').map(Number);
  const end = new Date(Date.UTC(year, number, 0)).toISOString().slice(0, 10);
  return { kind: 'history', start, end: end < today ? end : today };
}

async function toHistoryEntries(admin: AdminClient, rows: PaletteRow[]): Promise<ChallengeHistoryEntry[]> {
  const paths = [...new Set(rows.flatMap(({ photoPath }) => photoPath ? [photoPath] : []))];
  const photoUrls = new Map<string, string>();
  if (paths.length) {
    const { data, error } = await admin.storage.from('challenge-photos').createSignedUrls(paths, signedUrlLifetime);
    if (error) console.error('Could not sign personal challenge photos');
    for (const photo of data ?? []) {
      if (photo.path && photo.signedUrl) photoUrls.set(photo.path, photo.signedUrl);
    }
  }

  return rows.map(({ date, score, hex, photoPath }) => ({
    date,
    score,
    targetHex: hex,
    collected: hex !== null && score >= collectionThreshold,
    photoUrl: photoPath ? photoUrls.get(photoPath) ?? null : null,
  }));
}

async function getHistory(
  admin: AdminClient,
  player: string,
  today: string,
  { start, end }: Extract<Selection, { kind: 'history' }>,
): Promise<ChallengeHistoryResponse> {
  const [results, targets, first] = await Promise.all([
    admin.from('social_results')
      .select('challenge_date, score, photo_object_path')
      .eq('player_id', player).gte('challenge_date', start).lte('challenge_date', end)
      .order('challenge_date', { ascending: false }),
    admin.from('daily_challenges').select('challenge_date, color_hex')
      .gte('challenge_date', start).lte('challenge_date', end),
    admin.from('social_results').select('challenge_date')
      .eq('player_id', player).lte('challenge_date', today)
      .order('challenge_date').limit(1).maybeSingle(),
  ]);
  if (results.error || targets.error || first.error) throw new Error('Could not read history');

  const colors = new Map<string, string>(targets.data.map((row) => [row.challenge_date, row.color_hex]));
  return {
    today,
    firstMonth: (first.data?.challenge_date ?? today).slice(0, 7),
    entries: await toHistoryEntries(admin, results.data.map(result => ({
      date: result.challenge_date,
      score: result.score,
      hex: colors.get(result.challenge_date) ?? null,
      photoPath: result.photo_object_path,
    }))),
  };
}

Deno.serve(async (request) => {
  if (request.method !== 'GET') {
    return Response.json({ error: 'method_not_allowed' }, { status: 405, headers: { ...headers, Allow: 'GET' } });
  }

  try {
    const admin = createAdminClient();
    const player = await resolveUserId(request, admin);
    if (!player) return Response.json({ error: 'unauthorized' }, { status: 401, headers });

    const today = new Date().toISOString().slice(0, 10);
    const selection = readSelection(new URL(request.url).searchParams, today);
    if (!selection) return Response.json({ error: 'invalid_request' }, { status: 400, headers });

    if (selection.kind === 'history') {
      return Response.json(await getHistory(admin, player, today, selection), { headers });
    }

    const { data, error } = await admin.rpc('get_my_challenge_palette', {
      p_player: player,
      p_before: selection.before,
      p_today: today,
      p_min_score: collectionThreshold,
      p_gallery: selection.kind === 'gallery',
    }).overrideTypes<PalettePage, { merge: false }>();
    if (error || !data || !('entries' in data) || !Array.isArray(data.entries)) {
      throw new Error('Could not read palette');
    }

    if (selection.kind === 'gallery') {
      return Response.json({
        entries: await toHistoryEntries(admin, data.entries),
        nextCursor: data.nextCursor,
      } satisfies PhotoGalleryResponse, { headers });
    }

    if (data.offeredCount === null || data.validatedCount === null) {
      throw new Error('Missing collection totals');
    }
    return Response.json({
      offeredCount: data.offeredCount,
      validatedCount: data.validatedCount,
      nextCursor: data.nextCursor,
      validatedColors: data.entries.flatMap(({ date, hex, score }) => hex ? [{ date, hex, score }] : []),
    } satisfies ColorCollectionResponse, { headers });
  } catch {
    console.error('Personal challenge history request failed');
    return Response.json({ error: 'history_unavailable' }, { status: 500, headers });
  }
});
