import type { DailyColorResponse } from '@/data/api.types';

export type DailyColor = {
  date: string;
  hex: string;
  refreshAt: number;
};

export type DailySubmission = {
  score: number;
  scorePercent: number;
  matchedHex: string;
};

export type DailyChallenge = {
  color: DailyColor;
  submission: DailySubmission | null;
};

export type DailyColorSnapshot = {
  response: DailyColorResponse;
  savedAt: number;
};

const dayMs = 24 * 60 * 60 * 1_000;
const HEX = /^#[0-9A-F]{6}$/;

function adaptSubmission(submission: unknown): DailySubmission | null {
  if (submission === null) return null;
  const body = submission as Partial<DailySubmission> | undefined;
  if (
    typeof body !== 'object' ||
    typeof body.score !== 'number' ||
    !Number.isInteger(body.score) ||
    body.score < 0 ||
    body.score > 100 ||
    typeof body.matchedHex !== 'string' ||
    !HEX.test(body.matchedHex)
  ) {
    throw new Error('Invalid daily submission');
  }
  const { score, scorePercent, matchedHex } = body;
  return {
    score, matchedHex,
    scorePercent: typeof scorePercent === 'number' && Number.isFinite(scorePercent)
      && scorePercent >= 0 && scorePercent <= 100 ? scorePercent : score,
  };
}

export function adaptDailyChallenge(response: unknown, receivedAt: number): DailyChallenge {
  const body = response as Partial<DailyColorResponse> | null;
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof body.date !== 'string' ||
    typeof body.colorHex !== 'string' ||
    typeof body.endsAt !== 'string' ||
    typeof body.serverTime !== 'string'
  ) {
    throw new Error('Invalid daily color response');
  }

  const remainingMs = Date.parse(body.endsAt) - Date.parse(body.serverTime);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(body.date) ||
    !Number.isFinite(Date.parse(body.date)) ||
    !HEX.test(body.colorHex) ||
    !Number.isFinite(remainingMs) ||
    remainingMs <= 0 ||
    remainingMs > dayMs
  ) {
    throw new Error('Invalid daily color response');
  }

  return {
    color: { date: body.date, hex: body.colorHex, refreshAt: receivedAt + remainingMs },
    // Snapshots saved before submissions existed have no `submission` field.
    submission: adaptSubmission(body.submission ?? null),
  };
}

export function restoreDailyChallenge(snapshot: string, now: number, receivedAt: number): DailyChallenge | null {
  try {
    const { response, savedAt }: DailyColorSnapshot = JSON.parse(snapshot);
    if (!Number.isFinite(savedAt)) return null;

    const challenge = adaptDailyChallenge(response, receivedAt);
    // Rebuild the monotonic deadline using the time elapsed since the response was saved.
    const elapsed = now - savedAt;
    const refreshAt = elapsed < 0 ? receivedAt : challenge.color.refreshAt - elapsed;
    return { ...challenge, color: { ...challenge.color, refreshAt } };
  } catch {
    return null;
  }
}
