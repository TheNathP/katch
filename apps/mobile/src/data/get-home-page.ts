import { adaptDailyColor } from '@/data/adapters/daily-color.adapters';
import type { DailyColorResponse } from '@/data/api.types';
import { saveDailyColor } from '@/data/daily-color-cache';
import { supabase, supabaseConfig } from '@/data/supabase';

export async function getHomePage(signal: AbortSignal) {
  const { url, publishableKey } = supabaseConfig;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('No active session for the daily challenge');

  const response = await fetch(`${url}/functions/v1/get-daily-color`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${session.access_token}` },
    signal,
  });
  if (!response.ok) throw new Error('Could not load the daily color');

  const dailyColor: DailyColorResponse = await response.json();
  const savedAt = Date.now();
  const color = adaptDailyColor(dailyColor, performance.now());
  if (!signal.aborted) await saveDailyColor({ response: dailyColor, savedAt }).catch(() => {});
  return color;
}
