/**
 * Profiles Service
 * Handles all profile-related API operations
 */

import { UserProfile } from '@/types';
import { supabase, apiCall, APIResponse, getCurrentUserId } from './base';

export class ProfilesService {
  /**
   * Get profile by user ID
   */
  static async getProfile(userId: string): Promise<APIResponse<UserProfile>> {
    return apiCall(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data, error };
    });
  }

  /**
   * Get current user's profile
   */
  static async getCurrentProfile(): Promise<APIResponse<UserProfile>> {
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

    return this.getProfile(userId);
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
    ageRange?: { min: number; max: number };
    heightRange?: { min: number; max: number };
    locations?: string[];
    educationLevels?: string[];
    occupations?: string[];
    gotras?: string[];
    subcastes?: string[];
    maritalStatus?: string[];
    excludeSameGotra?: boolean;
    currentUserGotra?: string;
    limit?: number;
    offset?: number;
  }): Promise<APIResponse<UserProfile[]>> {
    return apiCall(async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('account_status', 'active');

      // Age range filter
      if (filters.ageRange) {
        query = query
          .gte('age', filters.ageRange.min)
          .lte('age', filters.ageRange.max);
      }

      // Height range filter
      if (filters.heightRange) {
        query = query
          .gte('height', filters.heightRange.min)
          .lte('height', filters.heightRange.max);
      }

      // Location filter
      if (filters.locations && filters.locations.length > 0) {
        query = query.in('location->>city', filters.locations);
      }

      // Education filter
      if (filters.educationLevels && filters.educationLevels.length > 0) {
        query = query.in('education->>level', filters.educationLevels);
      }

      // Occupation filter
      if (filters.occupations && filters.occupations.length > 0) {
        query = query.in('employment->>profession', filters.occupations);
      }

      // Gotra filter
      if (filters.gotras && filters.gotras.length > 0) {
        query = query.in('gotra', filters.gotras);
      }

      // Exclude same Gotra
      if (filters.excludeSameGotra && filters.currentUserGotra) {
        query = query.neq('gotra', filters.currentUserGotra);
      }

      // Subcaste filter
      if (filters.subcastes && filters.subcastes.length > 0) {
        query = query.in('subcaste', filters.subcastes);
      }

      // Marital status filter
      if (filters.maritalStatus && filters.maritalStatus.length > 0) {
        query = query.in('marital_status', filters.maritalStatus);
      }

      // Pagination
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      return { data, error };
    });
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

      return { data, error };
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

      return { data, error };
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
      const { error } = await supabase
        .from('profiles')
        .update({ profile_completion: completion })
        .eq('user_id', userId);

      return { data: null, error };
    });
  }
}

export default ProfilesService;
