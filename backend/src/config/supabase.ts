import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Note: Environment variables are loaded in server.ts before this module is imported
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a mock client for local development when credentials are not available
const createMockClient = (): SupabaseClient => {
  logger.warn('⚠️  Using MOCK Supabase client (no credentials configured)');
  logger.warn('💡 Database operations will fail gracefully. Configure Supabase for full functionality.');
  
  // Create a mock client with a valid URL format
  // This client will fail on actual operations but won't crash on initialization
  return createClient(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'
  );
};

// Try to create real client if credentials exist
export const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createMockClient();
