import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !serviceKey) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Some routes may fail.');
    return null;
  }
  client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  return client;
}

