import { adaptLeaderboard } from '@/data/adapters/leaderboard.adapters';
import type { DailyLeaderboardResponse, LeaderboardScope } from '@/data/api.types';
import { callEdgeFunction } from '@/data/edge-functions';

export async function getLeaderboardPage(scope: LeaderboardScope, signal: AbortSignal) {
  const leaderboard = await callEdgeFunction(`get-leaderboard?scope=${scope}`, {
    method: 'GET', signal,
  }) as DailyLeaderboardResponse;
  return adaptLeaderboard(leaderboard, performance.now());
}
