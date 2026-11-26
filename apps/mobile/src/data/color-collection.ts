export type CollectedColor = { date: string; hex: string; score: number };

export type ColorCollection = {
  offeredCount: number;
  validatedCount: number;
  validatedColors: readonly CollectedColor[];
  nextCursor: string | null;
};
