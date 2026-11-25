// Profile picture helpers. The catalog itself (avatars and background colors)
// comes from the server, see data/avatar-catalog.ts.

type CatalogIds = {
  avatars: readonly { id: string }[];
  backgrounds: readonly { id: string }[];
};

export type AvatarChoice = {
  avatar: string;
  background: string;
};

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** A random avatar on a random background, used as the default profile picture. */
export function randomAvatarChoice(catalog: CatalogIds): AvatarChoice {
  return {
    avatar: pickRandom(catalog.avatars).id,
    background: pickRandom(catalog.backgrounds).id,
  };
}

/** Whether both parts of the choice still exist in the catalog. */
export function isChoiceInCatalog(
  choice: AvatarChoice,
  catalog: CatalogIds,
): boolean {
  return (
    catalog.avatars.some((avatar) => avatar.id === choice.avatar) &&
    catalog.backgrounds.some((background) => background.id === choice.background)
  );
}

export const DISPLAY_NAME_MIN_LENGTH = 3;
export const DISPLAY_NAME_MAX_LENGTH = 20;

const DISPLAY_NAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

export function validateDisplayName(displayName: string): string | null {
  const value = displayName.trim();
  if (
    value.length < DISPLAY_NAME_MIN_LENGTH ||
    value.length > DISPLAY_NAME_MAX_LENGTH
  ) {
    return `Le pseudo doit contenir entre ${DISPLAY_NAME_MIN_LENGTH} et ${DISPLAY_NAME_MAX_LENGTH} caractères.`;
  }
  if (!DISPLAY_NAME_PATTERN.test(value)) {
    return "Le pseudo ne peut contenir que des lettres sans accent, des chiffres, « _ », « . » et « - ».";
  }
  return null;
}
