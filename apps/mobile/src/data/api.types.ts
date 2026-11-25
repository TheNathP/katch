// Mirrors the public push contract in apps/backend/supabase/functions/_shared/types.ts.
export type PushRegistrationRequest = {
  token: string;
};

export type PushRegistrationResponse = {
  registered: boolean;
};

export type PushDestination = '/defi' | '/progression/serie' | '/classement/amis';
