import { createClient } from 'npm:@supabase/supabase-js@2.119.2';

export function createAdminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const keys = Deno.env.get('SUPABASE_SECRET_KEYS');
  const key = (keys ? JSON.parse(keys).default : undefined) ??
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || typeof key !== 'string' || !key) {
    throw new Error('Missing Supabase server configuration');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type AdminClient = ReturnType<typeof createAdminClient>;
