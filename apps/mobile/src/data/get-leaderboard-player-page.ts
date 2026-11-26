import { adaptLeaderboardPlayer } from '@/data/adapters/leaderboard-player.adapters';
import type { LeaderboardPlayerResponse } from '@/data/api.types';
import { supabase, supabaseConfig } from '@/data/supabase';

export async function getLeaderboardPlayerPage(playerId: string, signal: AbortSignal) {
  const { url, publishableKey } = supabaseConfig;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Reconnecte-toi pour voir ce profil.');

  const query = new URLSearchParams({ player: playerId });
  const response = await fetch(`${url}/functions/v1/get-leaderboard-player?${query}`, {
    headers: { apikey: publishableKey, Authorization: `Bearer ${session.access_token}` },
    signal,
  });
  if (response.status === 404) throw new Error('Ce profil n’est plus disponible dans le classement du jour.');
  if (!response.ok) throw new Error('Impossible de charger le profil.');

  const player: LeaderboardPlayerResponse = await response.json();
  return adaptLeaderboardPlayer(player);
}
