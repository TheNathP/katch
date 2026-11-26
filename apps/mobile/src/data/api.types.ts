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

/**
 * POST submit-photo — requires a session. `multipart/form-data` body:
 * - `photo` (required): JPEG or PNG file, at most 5 MiB and 4096 px per side.
 * - `takenAt` (optional): ISO 8601 date the photo was taken, as reported by the device.
 *   Stored for information only, it never affects the score.
 *
 * The server stores the photo, analyzes it against today's color and records the score.
 *
 * Errors: 400 `invalid_request` (bad form, field or date), 400 `invalid_photo`
 * (not a JPEG/PNG, too large, unreadable), 409 `challenge_ended` (the day changed
 * while scoring), 429 `attempt_limit_reached`.
 */
export type SubmitPhotoResponse = {
  attemptId: string;
  challengeDate: string;
  targetHex: string;
  /** Color of the photo area closest to the target. */
  matchedHex: string;
  score: number;
  /** Best score of the day, this attempt included. */
  bestScore: number;
  attemptsLeft: number;
  submittedAt: string;
  takenAt: string | null;
};
