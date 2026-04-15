import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { UserProfile, UserSubscription } from '@/types';
import { AuthContextType } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isDevBypassMode, getDevUser, getDevProfile } from '@/config/dev';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError) {
        if (profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }
      } else if (profileData) {
        setProfile(profileData as any);
      }

      const { data: subscriptionData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!subError && subscriptionData) {
        setSubscription(subscriptionData as UserSubscription);
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err);
    }
  }, []);

  // effect:audited — Auth state listener (Supabase auth subscription)
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isDevBypassMode()) {
          setUser(getDevUser() as unknown as User);
          setProfile(getDevProfile() as unknown as UserProfile);
          setLoading(false);
          return;
        }

        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError);
        } else {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await fetchUserData(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (isDevBypassMode()) return;
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchUserData(currentSession.user.id);
      } else {
        setProfile(null);
        setSubscription(null);
      }
      
      setLoading(false);
    });

    return () => {
      authListener.unsubscribe();
    };
  }, [fetchUserData]);

  const signUp = async (email: string, password: string, options?: { firstName?: string; lastName?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: options?.firstName,
          last_name: options?.lastName,
        },
      },
    });

    if (error) throw error;
    
    // Note: Profile creation is now securely handled by a database trigger 
    // (`handle_new_user`) that fires automatically on `auth.users` insert.
    // This prevents client-side race conditions and RLS privilege violations.
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    const updateData = { ...profileData, updated_at: new Date().toISOString() };
    if (profileData.first_name || profileData.last_name) {
      updateData.name = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
      delete updateData.first_name;
      delete updateData.last_name;
    }
    const { error } = await (supabase as any)
      .from('profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchUserData(user.id);
    toast.success('Profile updated');
  };

  /**
   * Initiate subscription upgrade via backend payment flow.
   * SECURITY: Never insert subscription records directly from the client.
   * The backend payment verification endpoint handles subscription activation
   * only after confirmed payment from Razorpay.
   */
  const upgradeSubscription = async (planId: string) => {
    if (!user) return;
    
    // Get the session token for authenticated API call
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.error('Please log in again to upgrade');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Return the order data for the payment component to process
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upgrade failed';
      toast.error(message);
      throw err;
    }
  };

  const setNameVisibility = async (visible: boolean) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        name_visibility: visible,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
    if (error) throw error;
    await fetchUserData(user.id);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    toast.success('Password updated');
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const updateLastActive = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('user_id', user.id);
    if (error) throw error;
  };

  const isPremium = subscription?.status === 'active';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
        value={{
          user,
          profile,
          subscription,
          isAuthenticated,
          isPremium,
          loading,
          error,
          signUp,
          signIn,
          signOut,
          resetPassword,
          updateProfile,
          upgradeSubscription,
          setNameVisibility,
          updatePassword,
          signInWithGoogle,
          signInWithFacebook,
          updateLastActive,
        }}
    >
      {children}
    </AuthContext.Provider>
  );
};
