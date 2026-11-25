import type { AvatarCatalogResponse } from "@/data/api.types";

export type AvatarOption = { id: string; imageUrl: string };
export type AvatarBackgroundOption = { id: string; hex: string; label: string };

export type AvatarCatalog = {
  avatars: AvatarOption[];
  backgrounds: AvatarBackgroundOption[];
};

const HEX_PATTERN = /^#[0-9A-F]{6}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validates a catalog coming from the network or the local cache. */
export function adaptAvatarCatalog(response: unknown): AvatarCatalog {
  if (
    !isRecord(response) ||
    !Array.isArray(response.avatars) ||
    !Array.isArray(response.backgrounds)
  ) {
    throw new Error("Invalid avatar catalog");
  }
  const { avatars, backgrounds } = response as AvatarCatalogResponse;

  const validAvatars = avatars.filter(
    (avatar) =>
      isRecord(avatar) &&
      typeof avatar.id === "string" &&
      typeof avatar.imageUrl === "string" &&
      avatar.imageUrl.startsWith("https://"),
  );
  const validBackgrounds = backgrounds.filter(
    (background) =>
      isRecord(background) &&
      typeof background.id === "string" &&
      typeof background.label === "string" &&
      typeof background.hex === "string" &&
      HEX_PATTERN.test(background.hex),
  );
  if (validAvatars.length === 0 || validBackgrounds.length === 0) {
    throw new Error("Empty avatar catalog");
  }

  return {
    avatars: validAvatars.map(({ id, imageUrl }) => ({ id, imageUrl })),
    backgrounds: validBackgrounds.map(({ id, hex, label }) => ({ id, hex, label })),
  };
}
