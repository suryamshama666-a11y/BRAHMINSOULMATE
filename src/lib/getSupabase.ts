import { supabase } from '@/integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns the singleton Supabase client from the unified integration.
 * This function is kept for backward compatibility with existing code.
 */
export function getSupabase(): SupabaseClient {
  return supabase;
}
