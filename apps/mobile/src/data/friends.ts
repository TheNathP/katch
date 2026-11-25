import type { FriendMutation, FriendOverview, FriendProfile, FriendsRequest, SocialPlayer } from './social-api.types';
import { supabase } from './supabase';

async function requestFriends<T>(body: FriendsRequest): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Reconnecte-toi pour retrouver tes amis.');

  const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/friends`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      apikey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) throw new Error('Reconnecte-toi pour retrouver tes amis.');
  if (response.status === 404) {
    const body: { code?: string } | null = await response.json().catch(() => null);
    if (body?.code === 'NOT_FOUND') throw new Error('Le service Amis n’est pas encore activé.');
    throw new Error('Ce profil est introuvable.');
  }
  if (!response.ok) throw new Error('Impossible de charger les amis pour le moment.');

  return response.json() as Promise<T>;
}

export const getFriends = () => requestFriends<FriendOverview>({ action: 'overview' });

export async function searchFriends(text: string) {
  const response = await requestFriends<{ players: SocialPlayer[] }>({ action: 'search', text });
  return response.players;
}

export const getFriendProfile = (target: string) => requestFriends<FriendProfile>({ action: 'profile', target });

export async function getPlayerSocialProfile(target: string, viewer?: string) {
  const [profile, overview] = await Promise.all([
    getFriendProfile(target),
    target === viewer ? null : getFriends(),
  ]);
  return {
    ...profile,
    relationship: overview?.players.find(player => player.id === target)?.relationship ?? 'none',
  };
}

export const changeFriendship = (action: FriendMutation, target: string) =>
  requestFriends<{ ok: true }>({ action, target });

export const renamePlayer = (text: string) => requestFriends<{ name: string }>({ action: 'rename', text });
