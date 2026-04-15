import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { env } from '@/config/env';

// Create mock client for local development
const createMockClient = () => {
  console.warn('⚠️  Using MOCK Supabase client (no credentials configured)');
  console.warn('💡 Database operations will fail gracefully. Configure Supabase for full functionality.');
  
  // Create a mock client with a valid URL format
  return createClient<Database>(
    'https://placeholder.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'
  );
};

// Try to create real client if credentials exist
export const supabase = (env.supabase.url && env.supabase.anonKey)
  ? (() => {
      try {
        const client = createClient<Database>(
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
        console.log('✅ Connected to Supabase');
        return client;
      } catch (error) {
        console.error('❌ Failed to connect to Supabase:', error);
        return createMockClient();
      }
    })()
  : createMockClient();
