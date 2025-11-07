import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, userData: Partial<ProfileInsert>) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
          }
        }
      });

      if (authError) throw authError;

      // Create profile after successful auth
      if (authData.user) {
        const profileData: ProfileInsert = {
          user_id: authData.user.id,
          name: userData.name || '',
          age: userData.age || 25,
          gender: userData.gender || 'male',
          location: userData.location || {},
          religion: userData.religion || 'Hindu',
          marital_status: userData.marital_status || 'never_married',
          height: userData.height || 170,
          education: userData.education || {},
          employment: userData.employment || {},
          bio: userData.bio || '',
          subscription_type: 'free',
          verified: false,
        };

        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here as auth was successful
        }

        return { user: authData.user, profile: profileResult };
      }

      return { user: authData.user, profile: null };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Update last active timestamp
      if (data.user) {
        await this.updateLastActive(data.user.id);
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Get current user profile
  static async getCurrentProfile() {
    try {
      const session = await this.getCurrentSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Update last active timestamp
  static async updateLastActive(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Update last active error:', error);
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}