import { adaptLeaderboardPlayer } from '@/data/adapters/leaderboard-player.adapters';
import type { LeaderboardPlayerResponse } from '@/data/api.types';
import { callEdgeFunction, EdgeFunctionError } from '@/data/edge-functions';

export async function getLeaderboardPlayerPage(playerId: string, signal: AbortSignal) {
  const query = new URLSearchParams({ player: playerId });
  try {
    const player = await callEdgeFunction(`get-leaderboard-player?${query}`, {
      method: 'GET', signal,
    }) as LeaderboardPlayerResponse;
    return adaptLeaderboardPlayer(player);
  } catch (error) {
    if (error instanceof EdgeFunctionError && error.status === 401) {
      throw new Error('Reconnecte-toi pour voir ce profil.');
    }
    if (error instanceof EdgeFunctionError && error.status === 404) {
      throw new Error('Ce profil n’est plus disponible dans le classement du jour.');
    }
    throw new Error('Impossible de charger le profil.');
  }
}
