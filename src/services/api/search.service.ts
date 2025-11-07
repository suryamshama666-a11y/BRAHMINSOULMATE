/**
 * Search Service
 * Handles advanced profile search with multiple filters
 */

import { UserProfile } from '@/types';
import { supabase, apiCall, APIResponse, getCurrentUserId } from './base';

export interface SearchFilters {
  // Age range
  ageMin?: number;
  ageMax?: number;
  
  // Height range (in cm)
  heightMin?: number;
  heightMax?: number;
  
  // Location filters
  cities?: string[];
  states?: string[];
  countries?: string[];
  
  // Education filters
  educationLevels?: string[];
  
  // Occupation filters
  occupations?: string[];
  
  // Gotra and caste filters
  gotras?: string[];
  subcastes?: string[];
  excludeSameGotra?: boolean;
  
  // Marital status
  maritalStatus?: string[];
  
  // Other filters
  religion?: string;
  gender?: 'male' | 'female' | 'other';
  verifiedOnly?: boolean;
  premiumOnly?: boolean;
  withPhotosOnly?: boolean;
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Sorting
  sortBy?: 'recent' | 'active' | 'completion' | 'age';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  profiles: UserProfile[];
  total: number;
  hasMore: boolean;
}

export class SearchService {
  /**
   * Search profiles with advanced filters
   */
  static async searchProfiles(filters: SearchFilters): Promise<APIResponse<SearchResult>> {
    return apiCall(async () => {
      const userId = await getCurrentUserId();
      
      // Build query
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('account_status', 'active');
      
      // Exclude current user
      if (userId) {
        query = query.neq('user_id', userId);
      }
      
      // Age range filter
      if (filters.ageMin !== undefined) {
        query = query.gte('age', filters.ageMin);
      }
      if (filters.ageMax !== undefined) {
        query = query.lte('age', filters.ageMax);
      }
      
      // Height range filter
      if (filters.heightMin !== undefined) {
        query = query.gte('height', filters.heightMin);
      }
      if (filters.heightMax !== undefined) {
        query = query.lte('height', filters.heightMax);
      }
      
      // Gender filter
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      
      // Religion filter
      if (filters.religion) {
        query = query.eq('religion', filters.religion);
      }
      
      // Location filters
      if (filters.cities && filters.cities.length > 0) {
        query = query.in('location->>city', filters.cities);
      }
      if (filters.states && filters.states.length > 0) {
        query = query.in('location->>state', filters.states);
      }
      if (filters.countries && filters.countries.length > 0) {
        query = query.in('location->>country', filters.countries);
      }
      
      // Education filter
      if (filters.educationLevels && filters.educationLevels.length > 0) {
        query = query.in('education->>level', filters.educationLevels);
      }
      
      // Occupation filter
      if (filters.occupations && filters.occupations.length > 0) {
        query = query.in('employment->>profession', filters.occupations);
      }
      
      // Gotra filters
      if (filters.gotras && filters.gotras.length > 0) {
        query = query.in('gotra', filters.gotras);
      }
      
      // Exclude same Gotra (important for matrimonial compatibility)
      if (filters.excludeSameGotra && userId) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('gotra')
          .eq('user_id', userId)
          .single();
        
        if (currentProfile?.gotra) {
          query = query.neq('gotra', currentProfile.gotra);
        }
      }
      
      // Subcaste filter
      if (filters.subcastes && filters.subcastes.length > 0) {
        query = query.in('subcaste', filters.subcastes);
      }
      
      // Marital status filter
      if (filters.maritalStatus && filters.maritalStatus.length > 0) {
        query = query.in('marital_status', filters.maritalStatus);
      }
      
      // Verified only
      if (filters.verifiedOnly) {
        query = query.eq('verification_status', 'verified');
      }
      
      // Premium only
      if (filters.premiumOnly) {
        query = query.in('subscription_type', ['premium', 'gold']);
      }
      
      // With photos only
      if (filters.withPhotosOnly) {
        query = query.not('images', 'is', null);
      }
      
      // Sorting
      const sortBy = filters.sortBy || 'recent';
      const sortOrder = filters.sortOrder || 'desc';
      
      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
          break;
        case 'active':
          query = query.order('last_active', { ascending: sortOrder === 'asc' });
          break;
        case 'completion':
          query = query.order('profile_completion', { ascending: sortOrder === 'asc' });
          break;
        case 'age':
          query = query.order('age', { ascending: sortOrder === 'asc' });
          break;
      }
      
      // Pagination
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      
      const { data, error, count } = await query.range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      const total = count || 0;
      const hasMore = offset + limit < total;
      
      return {
        data: {
          profiles: data as UserProfile[],
          total,
          hasMore
        },
        error: null
      };
    });
  }
  
  /**
   * Get filter options (for dropdowns)
   */
  static async getFilterOptions(): Promise<APIResponse<{
    cities: string[];
    states: string[];
    educationLevels: string[];
    occupations: string[];
    gotras: string[];
    subcastes: string[];
  }>> {
    return apiCall(async () => {
      // Get unique values for each filter
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('location, education, employment, gotra, subcaste')
        .eq('account_status', 'active');
      
      if (error) throw error;
      
      const cities = new Set<string>();
      const states = new Set<string>();
      const educationLevels = new Set<string>();
      const occupations = new Set<string>();
      const gotras = new Set<string>();
      const subcastes = new Set<string>();
      
      profiles.forEach((profile: any) => {
        if (profile.location?.city) cities.add(profile.location.city);
        if (profile.location?.state) states.add(profile.location.state);
        if (profile.education?.level) educationLevels.add(profile.education.level);
        if (profile.employment?.profession) occupations.add(profile.employment.profession);
        if (profile.gotra) gotras.add(profile.gotra);
        if (profile.subcaste) subcastes.add(profile.subcaste);
      });
      
      return {
        data: {
          cities: Array.from(cities).sort(),
          states: Array.from(states).sort(),
          educationLevels: Array.from(educationLevels).sort(),
          occupations: Array.from(occupations).sort(),
          gotras: Array.from(gotras).sort(),
          subcastes: Array.from(subcastes).sort(),
        },
        error: null
      };
    });
  }
  
  /**
   * Save search filters
   */
  static async saveSearch(name: string, filters: SearchFilters): Promise<APIResponse<void>> {
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
    
    return apiCall(async () => {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: userId,
          search_name: name,
          filters: filters as any,
        });
      
      if (error) throw error;
      return { data: null, error: null };
    });
  }
  
  /**
   * Get saved searches
   */
  static async getSavedSearches(): Promise<APIResponse<Array<{
    id: string;
    search_name: string;
    filters: SearchFilters;
    created_at: string;
    last_used: string;
  }>>> {
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
    
    return apiCall(async () => {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('last_used', { ascending: false });
      
      if (error) throw error;
      return { data: data as any, error: null };
    });
  }
  
  /**
   * Delete saved search
   */
  static async deleteSavedSearch(searchId: string): Promise<APIResponse<void>> {
    return apiCall(async () => {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);
      
      if (error) throw error;
      return { data: null, error: null };
    });
  }
  
  /**
   * Quick search by name or ID
   */
  static async quickSearch(query: string): Promise<APIResponse<UserProfile[]>> {
    return apiCall(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${query}%,id.eq.${query}`)
        .eq('account_status', 'active')
        .limit(10);
      
      if (error) throw error;
      return { data: data as UserProfile[], error: null };
    });
  }
}

export default SearchService;
