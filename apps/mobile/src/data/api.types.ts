// Mirrors the public contract in apps/backend/supabase/functions/_shared/types.ts.
export type DailyColorResponse = {
  date: string;
  colorHex: string;
  endsAt: string;
  serverTime: string;
};
