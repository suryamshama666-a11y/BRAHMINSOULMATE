import { UserProfile } from '@/types';
import { supabase, apiCall, backendCall, APIResponse, getCurrentUserId } from './base';

export class ProfilesService {
  /**
   * Get profile by ID (uses backend to enforce privacy rules)
   */
  static async getProfile(userId: string): Promise<APIResponse<UserProfile>> {
    return backendCall<UserProfile>(`profile/${userId}`);
  }

  /**
   * Get current user's profile
   */
  static async getCurrentProfile(): Promise<APIResponse<UserProfile>> {
    return backendCall<UserProfile>('profile/me');
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
        })
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
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
        } as any
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

      return { data, error };
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

    return backendCall<UserProfile[]>(`profile/search/all?${params.toString()}`);
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

      return { data: data as UserProfile[], error };
    });
  }

  /**
   * Get new members
   */
  static async getNewMembers(limit: number = 20): Promise<APIResponse<UserProfile[]>> {
    return apiCall(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      return { data: data as UserProfile[], error };
    });
  }

  /**
   * Update last active timestamp
   */
  static async updateLastActive(): Promise<APIResponse<void>> {
    const userId = await getCurrentUserId();
    if (!userId) return { data: null, error: null };

    return apiCall(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ last_active: new Date().toISOString() })
        .eq('user_id', userId);

      return { data: null, error };
    });
  }

  /**
   * Calculate profile completion percentage
   */
  static calculateProfileCompletion(profile: Partial<UserProfile>): number {
    const fields = [
      profile.name,
      profile.age,
      profile.gender,
      profile.images && profile.images.length > 0,
      profile.bio,
      profile.location,
      profile.religion,
      profile.caste,
      profile.marital_status,
      profile.height,
      profile.education,
      profile.employment,
      profile.family,
      profile.preferences,
      profile.gotra,
      profile.subcaste
    ];

    const completedFields = fields.filter(field => {
      if (typeof field === 'object' && field !== null) {
        return Object.keys(field).length > 0;
      }
      return !!field;
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Update profile completion
   */
  static async updateProfileCompletion(userId: string): Promise<APIResponse<void>> {
    const profileResponse = await this.getProfile(userId);
    if (!profileResponse.data) return { data: null, error: profileResponse.error };

    const completion = this.calculateProfileCompletion(profileResponse.data);

    return apiCall(async () => {
      const { error } = await (supabase.from('profiles' as any) as any)
        .update({ profile_completion: completion })
        .eq('user_id', userId);

      return { data: null, error };
    });
  }
}

export default ProfilesService;
