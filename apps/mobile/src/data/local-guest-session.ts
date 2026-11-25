import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const isLocalGuestEnabled = __DEV__ && process.env.EXPO_PUBLIC_DAILY_COLOR_LOCAL_GUEST === '1';

let client: SupabaseClient | undefined;
let pendingSession: Promise<string> | undefined;

export function getLocalGuestAccessToken(url: string, key: string): Promise<string> {
  if (!isLocalGuestEnabled) {
    return Promise.reject(new Error('The local guest session is disabled'));
  }

  client ??= createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { auth } = client;

  pendingSession ??= (async () => {
    const existing = await auth.getSession();
    if (existing.data.session) return existing.data.session.access_token;
    if (existing.error) throw existing.error;

    const guest = await auth.signInAnonymously();
    if (!guest.data.session) throw new Error('Could not start a local guest session');
    return guest.data.session.access_token;
  })().finally(() => {
    pendingSession = undefined;
  });

  return pendingSession;
}
