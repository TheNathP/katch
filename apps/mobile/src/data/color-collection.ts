export type CollectedColor = { id: string; hex: string };

export type ColorCollection = {
  offeredCount: number;
  validatedColors: readonly CollectedColor[];
};

// The profile API does not expose a player's color history yet.
export const emptyColorCollection: ColorCollection = {
  offeredCount: 0,
  validatedColors: [],
};
