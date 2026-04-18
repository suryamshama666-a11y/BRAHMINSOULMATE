import { UserProfile } from '@/types';
import { ProfileRow, isProfileRow } from '@/types/supabase-extended';
import { supabase, apiCall, backendCall, APIResponse, getCurrentUserId } from './base';
import { mapToUserProfile, calculateProfileCompletion } from '@/utils/profileUtils';

export class ProfilesService {
  /**
   * Get profile by ID (uses backend to enforce privacy rules)
   */
  static async getProfile(userId: string): Promise<APIResponse<UserProfile>> {
    const result = await backendCall<any>(`profile/${userId}`);
    if (result.data) {
      result.data = mapToUserProfile(result.data);
    }
    return result;
  }

  /**
   * Get current user's profile
   */
  static async getCurrentProfile(): Promise<APIResponse<UserProfile>> {
    const result = await backendCall<any>('profile/me');
    if (result.data) {
      result.data = mapToUserProfile(result.data);
    }
    return result;
  }

  /**
   * Update profile
   */
  static async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<APIResponse<UserProfile>> {
    return apiCall(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        } as any)
        .eq('user_id', userId)
        .select()
        .single();

      return { 
        data: data ? mapToUserProfile(data) : null, 
        error 
      };
    });
  }

  /**
   * Update current user's profile
   */
  static async updateCurrentProfile(
    updates: Partial<UserProfile>
  ): Promise<APIResponse<UserProfile>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        data: null,
        error: {
          code: 'AUTH_ERROR',
          message: 'User not authenticated',
          statusCode: 401,
          name: 'APIError'
        }
      };
    }

    return this.updateProfile(userId, updates);
  }


  /**
   * Get multiple profiles by IDs
   */
  static async getProfiles(userIds: string[]): Promise<APIResponse<UserProfile[]>> {
    return apiCall(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      return { 
        data: (data || [])
          .map(row => mapToUserProfile(row)), 
        error 
      };
    });
  }

  /**
   * Search profiles with filters
   */
  static async searchProfiles(filters: {
    gender?: string;
    min_age?: number;
    max_age?: number;
    city?: string;
    religion?: string;
    limit?: number;
  }): Promise<APIResponse<UserProfile[]>> {
    const params = new URLSearchParams();
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.min_age) params.append('min_age', filters.min_age.toString());
    if (filters.max_age) params.append('max_age', filters.max_age.toString());
    if (filters.city) params.append('city', filters.city);
    if (filters.religion) params.append('religion', filters.religion);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const result = await backendCall<any[]>(`profile/search/all?${params.toString()}`);
    if (result.data) {
      result.data = result.data.map(row => mapToUserProfile(row));
    }
    return result;
  }

  /**
   * Get online profiles
   */
  static async getOnlineProfiles(limit: number = 20): Promise<APIResponse<UserProfile[]>> {
    return apiCall(async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_status', 'active')
        .gte('last_active', fiveMinutesAgo)
        .order('last_active', { ascending: false })
        .limit(limit);

      return { 
        data: (data || []).map(row => mapToUserProfile(row)), 
        error 
      };
    });
  }

  /**
   * Get profile completion status
   */
  static async getProfileCompletion(): Promise<number> {
    const profile = await this.getCurrentProfile();
    if (profile.data) {
      return calculateProfileCompletion(profile.data);
    }
    return 0;
  }
}

export const profilesService = new ProfilesService();
