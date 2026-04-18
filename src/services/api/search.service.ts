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
      
      // Build query using any casting to bypass schema validation
      let query = (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .eq('is_banned', false)
        .is('deleted_at', null);

      // Gender filter
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      
      // Age range filter
      if (filters.ageMin !== undefined) query = query.gte('age', filters.ageMin);
      if (filters.ageMax !== undefined) query = query.lte('age', filters.ageMax);
      
      // Location filters
      if (filters.cities?.length) query = query.in('city', filters.cities);
      
      // Gotra filters
      if (filters.gotras?.length) query = query.in('gotra', filters.gotras);
      
      // Exclude same Gotra
      if (filters.excludeSameGotra && userId) {
        const { data: currentProfile } = await (supabase as any)
          .from('profiles')
          .select('gotra')
          .eq('user_id', userId)
          .single();
        
        if (currentProfile?.gotra) {
          query = query.neq('gotra', currentProfile.gotra);
        }
      }
      
      // Sorting
      const sortBy = filters.sortBy || 'recent';
      const sortOrder = filters.sortOrder || 'desc';
      
      switch (sortBy) {
        case 'recent': query = query.order('created_at', { ascending: sortOrder === 'asc' }); break;
        case 'active': query = query.order('last_seen_at', { ascending: sortOrder === 'asc' }); break;
        case 'age': query = query.order('age', { ascending: sortOrder === 'asc' }); break;
        default: query = query.order('created_at', { ascending: false });
      }
      
      // Pagination
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      const { data, error, count } = await query.range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      return {
        data: {
          profiles: (data as any) as UserProfile[],
          total: count || 0,
          hasMore: (offset + limit) < (count || 0)
        },
        error: null
      };
    });
  }
  
  /**
   * Get filter options
   */
  static async getFilterOptions(): Promise<APIResponse<{
    cities: string[];
    gotras: string[];
    subcastes: string[];
    educationLevels: string[];
    occupations: string[];
  }>> {
    return apiCall(async () => {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('city, gotra, subcaste, education_level, occupation')
        .eq('is_active', true)
        .eq('is_banned', false)
        .is('deleted_at', null)
        .limit(1000);
      
      if (error) throw error;
      
      const unique = (arr: any[], key: string) => [...new Set(arr.map(p => p[key]).filter(Boolean))].sort();
      
      return {
        data: {
          cities: unique(data || [], 'city'),
          gotras: unique(data || [], 'gotra'),
          subcastes: unique(data || [], 'subcaste'),
          educationLevels: unique(data || [], 'education_level'),
          occupations: unique(data || [], 'occupation'),
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
        error: { code: 'AUTH_ERROR', message: 'User not authenticated' } as any
      };
    }
    
    return apiCall(async () => {
      const { error } = await (supabase as any)
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
  static async getSavedSearches(): Promise<APIResponse<any[]>> {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        data: null,
        error: { code: 'AUTH_ERROR', message: 'User not authenticated' } as any
      };
    }
    
    return apiCall(async () => {
      const { data, error } = await (supabase as any)
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('last_used', { ascending: false });
      
      if (error) throw error;
      return { data: data || [], error: null };
    });
  }
  
  /**
   * Delete saved search
   */
  static async deleteSavedSearch(searchId: string): Promise<APIResponse<void>> {
    return apiCall(async () => {
      const { error } = await (supabase as any)
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
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${query}%,id.eq.${query}`)
        .eq('is_active', true)
        .limit(10);
      
      if (error) throw error;
      return { data: (data || []) as any as UserProfile[], error: null };
    });
  }
}

export default SearchService;
