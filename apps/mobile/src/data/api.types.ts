import type { Relationship } from './social-api.types';

// Mirrors the public contract in apps/backend/supabase/functions/_shared/types.ts.

export type PushRegistrationRequest = {
  token: string;
};

export type PushRegistrationResponse = {
  registered: boolean;
};

export type PushDestination = '/' | '/amis' | '/defi' | '/progression/serie' | '/classement/amis';

/** GET get-avatar-catalog — public, no session required (shown before sign-up). */
export type AvatarCatalogResponse = {
  /** Ordered as they should be displayed. */
  avatars: { id: string; imageUrl: string }[];
  /** Ordered as they should be displayed. `hex` is `#RRGGBB`, uppercase. */
  backgrounds: { id: string; hex: string; label: string }[];
};

/**
 * GET get-my-profile — requires a session: the signed-in player's own public profile.
 * Also the response of update-my-profile.
 */
export type MyProfileResponse = {
  displayName: string;
  /** Id from the avatar catalog (`avatars[].id`). */
  avatarId: string;
  /** Id from the avatar catalog (`backgrounds[].id`). */
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
  /** 3 to 20 characters among `A-Z a-z 0-9 _ . -`, surrounding spaces ignored. */
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

/** POST delete-my-account — permanently deletes the caller’s own account. */
export type DeleteMyAccountRequest = { confirmation: "SUPPRIMER" };

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

export type ChallengeHistoryEntry = {
  date: string;
  score: number;
  targetHex: string | null;
  collected: boolean;
  photoUrl: string | null;
};

export type ChallengeHistoryResponse = {
  today: string;
  firstMonth: string;
  entries: ChallengeHistoryEntry[];
};

export type ColorCollectionResponse = {
  offeredCount: number;
  validatedCount: number;
  validatedColors: { date: string; hex: string; score: number }[];
  nextCursor: string | null;
};

export type PhotoGalleryResponse = {
  entries: ChallengeHistoryEntry[];
  nextCursor: string | null;
};
