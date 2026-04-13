import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase environment variables are missing in backend');
}

// Create a mock client for testing when credentials are not available
const createMockClient = (): SupabaseClient => {
  // Return a minimal mock that won't throw on instantiation
  return createClient('https://mock.supabase.co', 'mock-key-mock-key-mock-key-mock-key');
};

export const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createMockClient();
