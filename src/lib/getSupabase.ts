import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (import.meta.env.DEV) {
      console.warn('Supabase env missing; creating mock client for dev to avoid crashes');
      // Create a minimal client that points to a mock project; avoids crashes during dev
      client = createClient('https://mock-project.supabase.co', 'mock-key');
      return client;
    }
    // In production, create a minimal client with placeholders to avoid import-time failures
    client = createClient('https://your-project.supabase.co', 'your-anon-key');
    return client;
  }

  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  return client;
}

