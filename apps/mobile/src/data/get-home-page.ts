import { adaptDailyChallenge } from '@/data/adapters/daily-color.adapters';
import type { DailyColorResponse } from '@/data/api.types';
import { saveDailyChallenge } from '@/data/daily-color-cache';
import { callEdgeFunction } from '@/data/edge-functions';

export async function getHomePage(signal: AbortSignal) {
  const response = await callEdgeFunction('get-daily-color', { method: 'GET', signal });
  const savedAt = Date.now();
  const challenge = adaptDailyChallenge(response, performance.now());
  // The response has just been validated by the adapter.
  if (!signal.aborted) {
    await saveDailyChallenge({ response: response as DailyColorResponse, savedAt }).catch(() => {});
  }
  return challenge;
}
