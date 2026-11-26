import type { LeaderboardPlayerResponse } from '@/data/api.types';
import { formatLeaderboardScore } from '@/lib/format-leaderboard-score';

export function adaptLeaderboardPlayer({ displayName, relationship, photo, score }: LeaderboardPlayerResponse) {
  return { name: displayName, relationship, photo, scoreLabel: formatLeaderboardScore(score) };
}

export type LeaderboardPlayer = ReturnType<typeof adaptLeaderboardPlayer>;
