import { adaptLeaderboard } from '@/data/adapters/leaderboard.adapters';
import type { DailyLeaderboardResponse, LeaderboardScope } from '@/data/api.types';
import { supabase, supabaseConfig } from '@/data/supabase';

export async function getLeaderboardPage(scope: LeaderboardScope, signal: AbortSignal) {
  const { url, publishableKey } = supabaseConfig;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('No active session for the leaderboard');

  const response = await fetch(`${url}/functions/v1/get-leaderboard?scope=${scope}`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${session.access_token}` },
    signal,
  });
  if (!response.ok) throw new Error('Could not load the leaderboard');

  const leaderboard: DailyLeaderboardResponse = await response.json();
  return adaptLeaderboard(leaderboard, performance.now());
}
