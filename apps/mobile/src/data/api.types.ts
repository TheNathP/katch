// Mirrors the public contract in apps/backend/supabase/functions/_shared/types.ts.
export type PushRegistrationRequest = {
  token: string;
};

export type PushRegistrationResponse = {
  registered: boolean;
};

export type PushDestination = '/' | '/amis' | '/defi' | '/progression/serie' | '/classement/amis';

export type DailyColorResponse = {
  date: string;
  colorHex: string;
  endsAt: string;
  serverTime: string;
};
