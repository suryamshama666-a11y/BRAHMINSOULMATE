import { useContext } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { AuthContext } from '@/contexts/AuthContext';
import { UserProfile, UserSubscription } from '@/types';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { User, AuthError };

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, options?: { firstName?: string; lastName?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  upgradeSubscription: (planId: string) => Promise<void>;
  setNameVisibility: (visible: boolean) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  updateLastActive: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
} 