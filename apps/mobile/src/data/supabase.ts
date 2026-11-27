import { createClient } from "@supabase/supabase-js";

import { secureSessionStorage } from "./secure-session-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: copy apps/mobile/.env.example to apps/mobile/.env.local",
  );
}

export const supabaseConfig = { url: supabaseUrl, publishableKey: supabasePublishableKey };

export const supabase = createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
  auth: {
    storage: secureSessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
