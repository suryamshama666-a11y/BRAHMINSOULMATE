import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
                    import.meta.env.VITE_SUPABASE_URL ||
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
                        import.meta.env.VITE_SUPABASE_ANON_KEY ||
                        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// Fix URL format if needed
const formattedUrl = supabaseUrl?.endsWith('/') 
  ? supabaseUrl.slice(0, -1) 
  : supabaseUrl;

/**
 * Create a singleton Supabase client
 */
export const supabase = createClient<Database>(
  formattedUrl || 'https://your-project.supabase.co',
  supabaseAnonKey || 'your-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);

/**
 * Helper function to get user data safely
 */
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get user profile data
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
