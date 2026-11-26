import type { Relationship } from './social-api.types';

// Mirrors the public contract in apps/backend/supabase/functions/_shared/types.ts.

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

export type LeaderboardScope = 'friends' | 'world';

type LeaderboardPlayer = {
  playerId: string;
  displayName: string;
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
