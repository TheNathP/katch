import type { DailyLeaderboardResponse } from '@/data/api.types';
import { formatLeaderboardScore } from '@/lib/format-leaderboard-score';

export type LeaderboardEntry = {
  id: string;
  name: string;
  avatarId?: string;
  avatarBackgroundId?: string;
  rank: number | null;
  scoreLabel: string | null;
  isCurrentPlayer: boolean;
};

export function adaptLeaderboard(response: DailyLeaderboardResponse, receivedAt: number) {
  const remainingMs = Date.parse(response.endsAt) - Date.parse(response.serverTime);
  if (!Number.isFinite(remainingMs) || remainingMs <= 0 || remainingMs > 24 * 60 * 60 * 1_000) {
    throw new Error('Invalid leaderboard reset time');
  }

  const { entries, currentPlayer } = response;
  const adaptEntry = (player: DailyLeaderboardResponse['currentPlayer']): LeaderboardEntry => ({
    id: player.playerId,
    name: player.displayName,
    avatarId: player.avatarId,
    avatarBackgroundId: player.avatarBackgroundId,
    rank: player.rank,
    scoreLabel: formatLeaderboardScore(player.score),
    isCurrentPlayer: player.playerId === currentPlayer.playerId,
  });

  return {
    entries: entries.map(adaptEntry),
    ownEntry: entries.some((entry) => entry.playerId === currentPlayer.playerId) ? null : adaptEntry(currentPlayer),
    refreshAt: receivedAt + remainingMs,
  };
}
