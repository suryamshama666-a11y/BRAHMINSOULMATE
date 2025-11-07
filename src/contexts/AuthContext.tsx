import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthError, AuthResponse, AuthTokenResponse, Session } from '@supabase/supabase-js';
import { UserProfile, UserSubscription, SubscriptionPlan } from '@/types';
import { toast } from 'sonner';
import { getSupabase } from '@/lib/getSupabase';
import type { AuthContextType } from '@/hooks/useAuth';

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'brahmin_soulmate_user';

// Get Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Set up auth state listener
  useEffect(() => {
    // Set up initial session and user
    const setupAuth = async () => {
      try {
        setLoading(true);
        console.log('Setting up auth...');
        
        // Get current session
        const { data: { session }, error: sessionError } = await getSupabase().auth.getSession();
        
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          setError(sessionError);
          setLoading(false);
          return;
        }
        
        console.log('Session data:', session ? 'Session exists' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);
        
        // If we have a user, fetch their profile
        if (session?.user) {
          console.log('User authenticated, fetching profile...');
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No authenticated user');
          setProfile(null);
          setSubscription(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in setupAuth:', err);
        setLoading(false);
      }
    };
    
    setupAuth();

    // Listen for auth changes
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      // If we have a user, fetch their profile
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setSubscription(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      // Fetch user profile
      const { data: profileData, error: profileError } = await getSupabase()
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // Check if the profiles table exists
        if (profileError.code === 'PGRST116') {
          // Table doesn't exist or no rows returned
          console.log('Profiles table may not exist or profile not found');
          
          // Try to create a basic profile
          try {
            const userInfo = await getSupabase().auth.getUser();
            if (userInfo.data.user) {
              const userEmail = userInfo.data.user.email || '';
              const userName = userEmail.split('@')[0] || 'New User';
              
              console.log('Attempting to create basic profile for user:', userId);
              const { data, error } = await getSupabase()
                .from('profiles')
                .insert({
                  user_id: userId,
                  name: userName,
                  email: userEmail,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  profile_completion: 5,
                })
                .select()
                .single();
              
              if (error) {
                // If table doesn't exist, just set minimal profile data
                console.log('Table may not exist, creating minimal profile');
                setProfile({
                  id: userId,
                  user_id: userId,
                  name: userName,
                  email: userEmail,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  profile_completion: 5,
                } as any);
              } else {
                console.log('Basic profile created successfully');
                setProfile(data as UserProfile);
              }
            }
          } catch (createError) {
            console.log('Failed to create profile, setting minimal profile');
            // Set a minimal profile state for the app to function
            const userEmail = user?.email || '';
            const userName = userEmail.split('@')[0] || 'User';
            setProfile({
              id: userId,
              user_id: userId,
              name: userName,
              email: userEmail,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              profile_completion: 5,
            } as any);
          }
        } else {
          setProfile(null);
        }
      } else {
        console.log('Profile fetched successfully');
        setProfile(profileData as UserProfile);
      }
      
      // Fetch user subscription (with better error handling)
      try {
        const { data: subscriptionData, error: subscriptionError } = await getSupabase()
          .from('user_subscriptions')
          .select('*, subscription_plans(*)')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('end_date', { ascending: false })
          .limit(1)
          .single();
        
        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subscriptionError);
          setSubscription(null);
        } else if (subscriptionError && subscriptionError.code === 'PGRST116') {
          console.log('No active subscription found');
          setSubscription(null);
        } else {
          console.log('Subscription fetched successfully');
          setSubscription(subscriptionData as UserSubscription);
        }
      } catch (subErr) {
        console.log('Subscription table may not exist, setting subscription to null');
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      // Set minimal profile data for the app to function
      const userEmail = user?.email || '';
      const userName = userEmail.split('@')[0] || 'User';
      setProfile({
        id: userId,
        user_id: userId,
        name: userName,
        email: userEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_completion: 5,
      } as any);
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    options?: { firstName?: string; lastName?: string }
  ): Promise<void> => {
    try {
      console.log('Attempting to sign up user:', email);
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: options?.firstName,
            last_name: options?.lastName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      console.log('Sign up successful, user data:', data);

      // Create a basic profile for the new user
      if (data.user) {
        console.log('Creating profile for new user');
        const { error: profileError } = await getSupabase()
          .from('profiles')
          .insert({
            user_id: data.user.id,
            name: `${options?.firstName || ''} ${options?.lastName || ''}`.trim() || email.split('@')[0],
            first_name: options?.firstName,
            last_name: options?.lastName,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            profile_completion: 10, // Basic profile is 10% complete
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else {
          console.log('Profile created successfully');
        }
      }
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting to sign in user:', email);
      
      // Log auth configuration
      console.log('Auth configuration check:');
      console.log('- Supabase URL defined:', !!supabaseUrl);
      console.log('- Supabase key defined:', !!supabaseAnonKey);
      
      // Try with explicit timeout to help diagnose network issues
      const signInPromise = getSupabase().auth.signInWithPassword({
        email,
        password,
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication request timed out after 10 seconds')), 10000);
      });
      
      // Race the sign-in against the timeout
      const { data, error } = await Promise.race([
        signInPromise,
        timeoutPromise.then(() => { throw new Error('Timeout'); })
      ]) as AuthResponse;

      if (error) {
        console.error("Authentication error:", error);
        
        // Provide more detailed error information
        if (error.message.includes('Failed to fetch')) {
          console.error("Network error details:", {
            url: supabaseUrl,
            error: error.message
          });
        }
        
        throw error;
      }

      if (!data || !data.user) {
        console.error("No user data returned");
        throw new Error("Invalid login credentials");
      }

      // Success - user data is automatically set by the onAuthStateChange listener
      console.log("Login successful:", data.user);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      console.log('Signing out user');
      const { error } = await getSupabase().auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      console.log('Sign out successful');
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (err) {
      console.error('Reset password error:', err);
      throw err;
    }
  };

  // Upgrade subscription
  const upgradeSubscription = async (planId: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to upgrade your subscription');
      return;
    }
    
    try {
      // First, get the subscription plan details
      const { data: planData, error: planError } = await getSupabase()
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (planError) {
        console.error('Error fetching plan:', planError);
        toast.error('Failed to fetch subscription plan details');
        return;
      }
      
      const plan = planData as SubscriptionPlan;
      
      // Calculate end date based on plan duration
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + plan.duration);
      
      // Create new subscription record
      const { data: subscriptionData, error: subscriptionError } = await getSupabase()
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          payment_id: `payment_${Date.now()}`, // In a real app, this would come from payment processor
        })
        .select();
        
      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        toast.error('Failed to upgrade subscription');
        return;
      }
      
      // Update user profile with new subscription type
      const { error: profileError } = await getSupabase()
        .from('profiles')
        .update({
          subscription_type: plan.name,
          subscription_expiry: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
        
      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast.error('Failed to update profile with subscription');
        return;
      }
      
      // Refresh user profile
      await fetchUserProfile(user.id);
      
      toast.success(`Successfully upgraded to ${plan.name} subscription!`);
    } catch (err) {
      console.error('Subscription upgrade error:', err);
      toast.error('An unexpected error occurred during subscription upgrade');
    }
  };

  // Update name visibility settings
  const setNameVisibility = async (visible: boolean): Promise<void> => {
    if (!user || !profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          privacy_settings: {
            ...profile.privacy_settings,
            show_contact_info_to: visible ? 'all' : 'matches',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Refresh profile
      await fetchUserProfile(user.id);
      
      toast.success('Privacy settings updated');
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      toast.error('Failed to update privacy settings');
    }
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<void> => {
    try {
      const { error } = await getSupabase().auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (err) {
      console.error('Password update error:', err);
      toast.error('Failed to update password');
      throw err;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const { data, error } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google sign in error:', err);
      throw err;
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async (): Promise<void> => {
    try {
      const { data, error } = await getSupabase().auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Facebook sign in error:', err);
      throw err;
    }
  };

  // Update last active status
  const updateLastActive = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const { error } = await getSupabase()
        .from('profiles')
        .update({
          last_active: new Date().toISOString(),
        })
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error updating last active status:', error);
      }
    } catch (err) {
      console.error('Error in updateLastActive:', err);
    }
  };

  // Update profile
  const updateProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    try {
      // Calculate profile completion percentage
      let completionPercentage = 10; // Base completion
      
      const profileFields = [
        'name', 'age', 'gender', 'bio', 'location', 'religion',
        'caste', 'marital_status', 'height', 'education',
        'employment', 'family', 'horoscope', 'interests', 'languages'
      ];
      
      const fieldsToCheck = profile ? { ...profile, ...profileData } : profileData;
      
      // Each field contributes to completion percentage
      profileFields.forEach(field => {
        if (fieldsToCheck[field as keyof typeof fieldsToCheck]) {
          completionPercentage += 6; // ~6% per field for 15 fields = ~90% max
        }
      });
      
      // Images contribute the final 10%
      if (fieldsToCheck.images && fieldsToCheck.images.length > 0) {
        completionPercentage += 10;
      }
      
      // Cap at 100%
      completionPercentage = Math.min(completionPercentage, 100);
      
      const { error } = await getSupabase()
        .from('profiles')
        .update({
          ...profileData,
          profile_completion: completionPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Refresh profile
      await fetchUserProfile(user.id);
      
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error('Failed to update profile');
    }
  };

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
        upgradeSubscription,
        setNameVisibility,
        updatePassword,
        signInWithGoogle,
        signInWithFacebook,
        updateLastActive,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
