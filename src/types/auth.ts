import { User, AuthError } from '@supabase/supabase-js';
import { UserProfile, UserSubscription } from '@/types';

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
