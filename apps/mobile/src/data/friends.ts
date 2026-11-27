import type { FriendMutation, FriendOverview, FriendProfile, FriendsRequest, SocialPlayer } from './social-api.types';
import { callEdgeFunction, EdgeFunctionError } from './edge-functions';

async function requestFriends<T>(body: FriendsRequest, signal?: AbortSignal): Promise<T> {
  try {
    return await callEdgeFunction('friends', { method: 'POST', body, signal }) as T;
  } catch (error) {
    if (error instanceof EdgeFunctionError && error.status === 401) {
      throw new Error('Reconnecte-toi pour retrouver tes amis.');
    }
    if (error instanceof EdgeFunctionError && error.status === 404) {
      if (error.code === 'NOT_FOUND') throw new Error('Le service Amis n’est pas encore activé.');
      throw new Error('Ce profil est introuvable.');
    }
    throw new Error('Impossible de charger les amis pour le moment.');
  }
}

export const getFriends = (signal?: AbortSignal) => requestFriends<FriendOverview>({ action: 'overview' }, signal);

export async function searchFriends(text: string, signal?: AbortSignal) {
  const response = await requestFriends<{ players: SocialPlayer[] }>({ action: 'search', text }, signal);
  return response.players;
}

export async function getPlayerSocialProfile(target: string, viewer: string | undefined, signal: AbortSignal) {
  const [profile, overview] = await Promise.all([
    requestFriends<FriendProfile>({ action: 'profile', target }, signal),
    target === viewer ? null : getFriends(signal),
  ]);
  return {
    ...profile,
    relationship: overview?.players.find(player => player.id === target)?.relationship ?? 'none',
  };
}

export const changeFriendship = (action: FriendMutation, target: string) =>
  requestFriends<{ ok: true }>({ action, target });
