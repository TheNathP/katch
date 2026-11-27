import type { FriendMutation, FriendOverview, FriendProfile, FriendsRequest, PhotoReactions, PixReaction, SocialPlayer } from './social-api.types';
import { callEdgeFunction, EdgeFunctionError } from './edge-functions';

async function requestFriends<T>(body: FriendsRequest, signal?: AbortSignal, expectedUserId?: string): Promise<T> {
  try {
    return await callEdgeFunction('friends', { method: 'POST', body, signal, expectedUserId }) as T;
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
  const profile = await requestFriends<FriendProfile>({ action: 'profile', target }, signal, viewer);
  const overview = !profile.relationship && target !== viewer
    ? await requestFriends<FriendOverview>({ action: 'overview' }, signal, viewer) : null;
  return {
    ...profile,
    relationship: profile.relationship ?? overview?.players.find(player => player.id === target)?.relationship ?? 'none',
  };
}

export async function reactToFriendPhoto(attempt: string, reaction: PixReaction | null, viewer: string) {
  try {
    return await callEdgeFunction('friends', {
      method: 'POST', body: { action: 'react', attempt, reaction } satisfies FriendsRequest,
      expectedUserId: viewer,
    }) as PhotoReactions;
  } catch (error) {
    if (error instanceof EdgeFunctionError && error.status === 403) {
      throw new Error('Cette photo n’est plus disponible pour les réactions.');
    }
    throw new Error('Ta réaction n’a pas pu être enregistrée. Réessaie.');
  }
}

export const changeFriendship = (action: FriendMutation, target: string) =>
  requestFriends<{ ok: true }>({ action, target });
