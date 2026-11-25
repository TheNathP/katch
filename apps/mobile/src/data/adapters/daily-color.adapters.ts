import type { DailyColorResponse } from '@/data/api.types';

export type DailyColor = {
  date: string;
  hex: string;
  refreshAt: number;
};

export function adaptDailyColor(response: DailyColorResponse, receivedAt: number): DailyColor {
  const remainingMs = Date.parse(response.endsAt) - Date.parse(response.serverTime);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(response.date) || !/^#[0-9A-F]{6}$/.test(response.colorHex) ||
    !Number.isFinite(remainingMs) ||
    remainingMs <= 0 || remainingMs > 24 * 60 * 60 * 1_000) {
    throw new Error('Invalid daily color response');
  }

  return { date: response.date, hex: response.colorHex, refreshAt: receivedAt + remainingMs };
}
