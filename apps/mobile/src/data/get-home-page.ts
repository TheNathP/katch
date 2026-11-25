import { adaptDailyColor } from '@/data/adapters/daily-color.adapters';
import type { DailyColorResponse } from '@/data/api.types';
import { getLocalGuestAccessToken } from '@/data/local-guest-session';

export async function getHomePage(signal: AbortSignal) {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration');

  const token = await getLocalGuestAccessToken(url, key);
  const response = await fetch(`${url}/functions/v1/get-daily-color`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
    signal,
  });
  if (!response.ok) throw new Error('Could not load the daily color');

  const dailyColor: DailyColorResponse = await response.json();
  return adaptDailyColor(dailyColor, performance.now());
}
