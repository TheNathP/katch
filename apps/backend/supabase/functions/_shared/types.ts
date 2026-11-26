import type { Relationship } from './social.types.ts';

export type PushRegistrationRequest = {
  token: string;
};

export type PushRegistrationResponse = {
  registered: boolean;
};

export type PushDestination = '/' | '/amis' | '/defi' | '/progression/serie' | '/classement/amis';

export type PushNotification = {
  title: string;
  body: string;
  destination: PushDestination;
};

/** GET get-avatar-catalog — public, no session required (shown before sign-up). */
export type AvatarCatalogResponse = {
  avatars: { id: string; imageUrl: string }[];
  backgrounds: { id: string; hex: string; label: string }[];
};

/**
 * GET get-my-profile — requires a session: the signed-in player's own public profile.
 * Also the response of update-my-profile.
 */
export type MyProfileResponse = {
  displayName: string;
  avatarId: string;
  avatarBackgroundId: string;
};

/**
 * PATCH update-my-profile — requires a session. Responds with the updated
 * `MyProfileResponse`. Every field is optional but at least one is required;
 * unknown fields are rejected.
 *
 * Errors: 400 `invalid_request` (bad shape or display name format),
 * 400 `unknown_avatar` (id not in the catalog), 409 `display_name_taken`.
 */
export type UpdateMyProfileRequest = {
  displayName?: string;
  avatarId?: string;
  avatarBackgroundId?: string;
};

export type DailyColorResponse = {
  date: string;
  colorHex: string;
  endsAt: string;
  serverTime: string;
};

export type LeaderboardScope = 'friends' | 'world';

type LeaderboardPlayer = {
  playerId: string;
  displayName: string;
  avatarId?: string;
  avatarBackgroundId?: string;
};

type RankedLeaderboardPlayer = LeaderboardPlayer & { rank: number; score: number };
type UnrankedLeaderboardPlayer = LeaderboardPlayer & { rank: null; score: null };

export type DailyLeaderboardResponse = {
  date: string;
  endsAt: string;
  serverTime: string;
  entries: RankedLeaderboardPlayer[];
  currentPlayer: RankedLeaderboardPlayer | UnrankedLeaderboardPlayer;
};

export type LeaderboardPlayerResponse = {
  displayName: string;
  score: number | null;
  relationship: Relationship | 'self';
  photo: { status: 'available'; url: string } | { status: 'locked' | 'missing' };
};
