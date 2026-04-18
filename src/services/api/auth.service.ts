/**
 * Authentication Service
 * Handles user authentication, session management, and token refresh
 */

import { supabase, apiCall, APIResponse, ErrorCode, APIError } from './base';
import { User, Session } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export class AuthService {
  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<APIResponse<AuthResponse>> {
    return apiCall(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return { 
        data: {
          user: data.user,
          session: data.session!
        }, 
        error: null 
      };
    });
  }

  /**
   * Register new user
   */
  static async register(registerData: RegisterData): Promise<APIResponse<AuthResponse>> {
    return apiCall(async () => {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            first_name: registerData.firstName,
            last_name: registerData.lastName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create profile - Using any casting to handle schema flexibility (e.g. required gender)
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          name: `${registerData.firstName} ${registerData.lastName}`,
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          email: registerData.email,
          role: 'user',
          status: 'active',
          profile_completion: 0
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // We don't throw here to allow user to continue; they can fix profile later
      }

      // Create analytics record - Using any casting for potential untyped table
      try {
        await (supabase as any)
          .from('user_analytics')
          .insert({
            user_id: authData.user.id,
          });
      } catch (e) {
        // Analytics failure shouldn't block registration
      }

      return {
        data: {
          user: authData.user,
          session: authData.session!
        },
        error: null
      };
    });
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<APIResponse<void>> {
    return apiCall(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { data: null, error: null };
    });
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<APIResponse<Session>> {
    return apiCall(async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) {
        throw new APIError(ErrorCode.AUTH_ERROR, 'No active session', 401);
      }
      return { data: data.session, error: null };
    });
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<APIResponse<User>> {
    return apiCall(async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!data.user) {
        throw new APIError(ErrorCode.AUTH_ERROR, 'User not found', 401);
      }
      return { data: data.user, error: null };
    });
  }

  /**
   * Refresh session token
   */
  static async refreshSession(): Promise<APIResponse<Session>> {
    return apiCall(async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (!data.session) {
        throw new APIError(ErrorCode.AUTH_ERROR, 'Failed to refresh session', 401);
      }
      return { data: data.session, error: null };
    });
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<APIResponse<void>> {
    return apiCall(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { data: null, error: null };
    });
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<APIResponse<void>> {
    return apiCall(async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { data: null, error: null };
    });
  }

  /**
   * Update email
   */
  static async updateEmail(newEmail: string): Promise<APIResponse<void>> {
    return apiCall(async () => {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (error) throw error;
      return { data: null, error: null };
    });
  }

  /**
   * Subscribe to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  }

  /**
   * Get access token
   */
  static async getAccessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<APIResponse<void>> {
    return apiCall(async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });
      if (error) throw error;
      return { data: null, error: null };
    });
  }
}

export default AuthService;
