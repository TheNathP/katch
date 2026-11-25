import type {
  MyProfileResponse,
  UpdateMyProfileRequest,
} from "@/data/api.types";
import { EdgeFunctionError } from "@/data/edge-functions";
import type { AvatarChoice } from "@/lib/profile";

export type MyProfile = {
  displayName: string;
  avatar: AvatarChoice;
};

/** Only the fields that changed. */
export type MyProfileChanges = {
  displayName?: string;
  avatar?: AvatarChoice;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function adaptMyProfile(response: unknown): MyProfile {
  if (
    !isRecord(response) ||
    typeof response.displayName !== "string" ||
    typeof response.avatarId !== "string" ||
    typeof response.avatarBackgroundId !== "string"
  ) {
    throw new Error("Invalid profile");
  }
  const { displayName, avatarId, avatarBackgroundId } =
    response as MyProfileResponse;
  return {
    displayName,
    avatar: { avatar: avatarId, background: avatarBackgroundId },
  };
}

export function toUpdateMyProfileRequest(
  changes: MyProfileChanges,
): UpdateMyProfileRequest {
  return {
    ...(changes.displayName !== undefined && {
      displayName: changes.displayName.trim(),
    }),
    ...(changes.avatar && {
      avatarId: changes.avatar.avatar,
      avatarBackgroundId: changes.avatar.background,
    }),
  };
}

const GENERIC_ERROR = "Une erreur est survenue. Réessaie dans un instant.";

const messagesByCode: Record<string, string> = {
  display_name_taken: "Ce pseudo est déjà pris. Choisis-en un autre.",
  invalid_request: "Ce pseudo n’est pas valide.",
  unknown_avatar: "Cette photo n’est plus disponible. Choisis-en une autre.",
  unauthorized: "Ta session a expiré. Reconnecte-toi.",
};

export function toMyProfileErrorMessage(error: unknown): string {
  if (error instanceof EdgeFunctionError && error.code) {
    return messagesByCode[error.code] ?? GENERIC_ERROR;
  }
  return GENERIC_ERROR;
}
