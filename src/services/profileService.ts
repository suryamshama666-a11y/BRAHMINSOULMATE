import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfileService {
  // Get profile by ID
  static async getProfile(profileId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Update profile
  static async updateProfile(profileId: string, updates: ProfileUpdate): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Search profiles with filters
  static async searchProfiles(filters: {
    gender?: string;
    ageMin?: number;
    ageMax?: number;
    heightMin?: number;
    heightMax?: number;
    location?: string;
    caste?: string;
    education?: string;
    maritalStatus?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('verified', true);

      // Apply filters
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters.ageMin) {
        query = query.gte('age', filters.ageMin);
      }
      if (filters.ageMax) {
        query = query.lte('age', filters.ageMax);
      }
      if (filters.heightMin) {
        query = query.gte('height', filters.heightMin);
      }
      if (filters.heightMax) {
        query = query.lte('height', filters.heightMax);
      }
      if (filters.caste) {
        query = query.eq('caste', filters.caste);
      }
      if (filters.maritalStatus) {
        query = query.eq('marital_status', filters.maritalStatus);
      }

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query.order('last_active', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search profiles error:', error);
      return [];
    }
  }

  // Get online profiles
  static async getOnlineProfiles(limit: number = 20): Promise<Profile[]> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .gte('last_active', fiveMinutesAgo)
        .eq('verified', true)
        .limit(limit)
        .order('last_active', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get online profiles error:', error);
      return [];
    }
  }

  // Get new members
  static async getNewMembers(limit: number = 20): Promise<Profile[]> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', oneWeekAgo)
        .eq('verified', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get new members error:', error);
      return [];
    }
  }

  // Upload profile image
  static async uploadProfileImage(file: File, profileId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload image error:', error);
      return null;
    }
  }

  // Delete profile image
  static async deleteProfileImage(imagePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('profile-images')
        .remove([imagePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete image error:', error);
      return false;
    }
  }

  // Update profile images array
  static async updateProfileImages(profileId: string, images: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ images })
        .eq('id', profileId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update profile images error:', error);
      return false;
    }
  }

  // Get profile statistics
  static async getProfileStats(profileId: string) {
    try {
      // Get profile views (you'll need to create a profile_views table)
      const { data: viewsData } = await supabase
        .from('profile_views')
        .select('id')
        .eq('viewed_profile_id', profileId);

      // Get sent interests
      const { data: sentInterests } = await supabase
        .from('matches')
        .select('id')
        .eq('user_id', profileId)
        .eq('status', 'pending');

      // Get received interests
      const { data: receivedInterests } = await supabase
        .from('matches')
        .select('id')
        .eq('match_id', profileId)
        .eq('status', 'pending');

      // Get messages count
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`);

      return {
        profileViews: viewsData?.length || 0,
        interestsSent: sentInterests?.length || 0,
        interestsReceived: receivedInterests?.length || 0,
        messageCount: messages?.length || 0,
      };
    } catch (error) {
      console.error('Get profile stats error:', error);
      return {
        profileViews: 0,
        interestsSent: 0,
        interestsReceived: 0,
        messageCount: 0,
      };
    }
  }
}