import type { DailyColorResponse } from '@/data/api.types';

export type DailyColor = {
  date: string;
  hex: string;
  refreshAt: number;
};

const dayMs = 24 * 60 * 60 * 1_000;

export type DailyColorSnapshot = {
  response: DailyColorResponse;
  savedAt: number;
};

export function adaptDailyColor(response: DailyColorResponse, receivedAt: number): DailyColor {
  const remainingMs = Date.parse(response.endsAt) - Date.parse(response.serverTime);

  if (typeof response.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(response.date) ||
    !Number.isFinite(Date.parse(response.date)) ||
    typeof response.colorHex !== 'string' || !/^#[0-9A-F]{6}$/.test(response.colorHex) ||
    !Number.isFinite(remainingMs) ||
    remainingMs <= 0 || remainingMs > dayMs) {
    throw new Error('Invalid daily color response');
  }

  return { date: response.date, hex: response.colorHex, refreshAt: receivedAt + remainingMs };
}

export function restoreDailyColor(snapshot: string, now: number, receivedAt: number): DailyColor | null {
  try {
    const { response, savedAt }: DailyColorSnapshot = JSON.parse(snapshot);
    if (!Number.isFinite(savedAt)) return null;

    const color = adaptDailyColor(response, receivedAt);
    // Rebuild the monotonic deadline using the time elapsed since the response was saved.
    const elapsed = now - savedAt;
    return { ...color, refreshAt: elapsed < 0 ? receivedAt : color.refreshAt - elapsed };
  } catch {
    return null;
  }
}
