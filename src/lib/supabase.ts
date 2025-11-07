import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Avoid leaking env details in production
if (import.meta.env.DEV) {
  console.log('Supabase URL set:', !!supabaseUrl);
  console.log('Supabase Key available:', !!supabaseAnonKey);
}

// Create a fallback client with mock functionality if environment variables are missing (dev only)
if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env.DEV) {
  console.warn('Missing Supabase credentials. Using mock client for development.');
}

let supabaseClient;

try {
  console.log('Creating Supabase client...');
  
  if (supabaseUrl && supabaseAnonKey) {
    // Create real client if credentials are available
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    console.log('Supabase client created successfully with real credentials');
    
    // Test the connection
    supabaseClient.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connection test successful, session:', data.session ? 'exists' : 'none');
      }
    });
  } else {
    // Create a mock client for development
    supabaseClient = createClient('https://mock-project.supabase.co', 'mock-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log('Mock Supabase client created for development');
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
  // Create a minimal client as fallback
  supabaseClient = createClient('https://mock-project.supabase.co', 'mock-key');
  console.warn('Using minimal fallback Supabase client due to initialization error');
}

export const supabase = supabaseClient; 