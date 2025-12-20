
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/getSupabase';
import { toast } from 'sonner';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session,
        });

          if (event === 'SIGNED_IN' && session?.user) {
            const firstName = session.user.user_metadata?.first_name || session.user.email?.split('@')[0];
            toast.success(`Welcome, ${firstName}!`);
          } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out successfully');
        }
      }
    );

    // Check for existing session
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: { firstName?: string; lastName?: string }) => {
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: userData?.firstName || '',
            last_name: userData?.lastName || '',
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast.success('Please check your email to confirm your account');
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { user: null, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { user: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await getSupabase().auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success('Password reset email sent');
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: error.message };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
};
