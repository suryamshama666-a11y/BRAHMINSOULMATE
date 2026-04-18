/**
 * Authentication related types
 */
import { User as SupabaseUser, Session as SupabaseSession, AuthError } from '@supabase/supabase-js';
import { UserProfile } from './user';
import { UserSubscription } from './subscription';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  session: SupabaseSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, options?: { firstName?: string; lastName?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  upgradeSubscription: (planId: string) => Promise<any>;
  setNameVisibility: (visible: boolean) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  updateLastActive: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}
