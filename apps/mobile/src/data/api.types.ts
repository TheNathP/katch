// Mirrors the public contract in apps/backend/supabase/functions/_shared/types.ts.

/** GET get-avatar-catalog — public, no session required (shown before sign-up). */
export type AvatarCatalogResponse = {
  /** Ordered as they should be displayed. */
  avatars: { id: string; imageUrl: string }[];
  /** Ordered as they should be displayed. `hex` is `#RRGGBB`, uppercase. */
  backgrounds: { id: string; hex: string; label: string }[];
};
