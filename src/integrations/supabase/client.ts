import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { env } from '@/config/env';

export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);
