// The player's own profile: input validation and row mapping, shared by
// get-my-profile and update-my-profile. Pure functions, no Supabase access.
import type { MyProfileResponse, UpdateMyProfileRequest } from "./types.ts";

const DISPLAY_NAME_PATTERN = /^[A-Za-z0-9_.-]{3,20}$/;
const CATALOG_ID_PATTERN = /^[a-z]+(-[a-z]+)*$/;
const CATALOG_ID_MAX_LENGTH = 64;

export const PROFILE_COLUMNS = "display_name, avatar_id, avatar_background_id";

export type SocialProfileRow = {
  display_name: string;
  avatar_id: string;
  avatar_background_id: string;
};

export type SocialProfileUpdate = Partial<SocialProfileRow>;

export function toMyProfileResponse(row: SocialProfileRow): MyProfileResponse {
  return {
    displayName: row.display_name,
    avatarId: row.avatar_id,
    avatarBackgroundId: row.avatar_background_id,
  };
}

function isCatalogId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= CATALOG_ID_MAX_LENGTH &&
    CATALOG_ID_PATTERN.test(value)
  );
}

const ALLOWED_KEYS: ReadonlySet<string> = new Set<keyof UpdateMyProfileRequest>(
  ["displayName", "avatarId", "avatarBackgroundId"],
);

/**
 * Validates an update-my-profile body and turns it into a row update, or
 * returns null when anything is unexpected (unknown key, wrong type, bad
 * format, empty update). Whether catalog ids exist is checked by the
 * database foreign keys.
 */
export function parseProfileUpdate(body: unknown): SocialProfileUpdate | null {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return null;
  const keys = Object.keys(body);
  if (keys.length === 0 || keys.some((key) => !ALLOWED_KEYS.has(key)))
    return null;

  const input = body as Record<string, unknown>;
  const update: SocialProfileUpdate = {};

  if ("displayName" in input) {
    if (typeof input.displayName !== "string") return null;
    const displayName = input.displayName.trim();
    if (!DISPLAY_NAME_PATTERN.test(displayName)) return null;
    update.display_name = displayName;
  }
  if ("avatarId" in input) {
    if (!isCatalogId(input.avatarId)) return null;
    update.avatar_id = input.avatarId;
  }
  if ("avatarBackgroundId" in input) {
    if (!isCatalogId(input.avatarBackgroundId)) return null;
    update.avatar_background_id = input.avatarBackgroundId;
  }
  return update;
}
