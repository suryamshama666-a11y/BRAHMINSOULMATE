import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { UserProfile, UserSubscription, SubscriptionPlan } from '@/types';
import { AuthContextType } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isDevBypassMode, getDevUser, getDevProfile } from '@/config/dev';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,
              email: (await supabase.auth.getUser()).data.user?.email || '',
              name: (await supabase.auth.getUser()).data.user?.email?.split('@')[0] || 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              profile_completion: 10
            })
            .select()
            .single();
          
          if (!createError) {
            setProfile(newProfile as UserProfile);
          }
        }
      } else {
        setProfile(profileData as UserProfile);
      }

      const { data: subscriptionData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!subError) {
        setSubscription(subscriptionData as UserSubscription);
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isDevBypassMode()) {
          setUser(getDevUser() as any);
          setProfile(getDevProfile() as any);
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

    if (data.user) {
      await supabase.from('profiles').upsert({
        user_id: data.user.id,
        email: email,
        name: `${options?.firstName || ''} ${options?.lastName || ''}`.trim() || email.split('@')[0],
        first_name: options?.firstName,
        last_name: options?.lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_completion: 10
      });
    }
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
    const { error } = await supabase
      .from('profiles')
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    
    if (error) throw error;
    await fetchUserData(user.id);
    toast.success('Profile updated');
  };

  const upgradeSubscription = async (planId: string) => { /* Mock */ };
  const setNameVisibility = async (visible: boolean) => { /* Mock */ };
  const updatePassword = async (newPassword: string) => { /* Mock */ };
  const signInWithGoogle = async () => { /* Mock */ };
  const signInWithFacebook = async () => { /* Mock */ };
  const updateLastActive = async () => { /* Mock */ };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        upgradeSubscription: upgradeSubscription as any,
        setNameVisibility: setNameVisibility as any,
        updatePassword: updatePassword as any,
        signInWithGoogle: signInWithGoogle as any,
        signInWithFacebook: signInWithFacebook as any,
        updateLastActive: updateLastActive as any,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
