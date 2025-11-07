import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';
import { findBestMatches } from '@/lib/matching-algorithm';

export interface SearchFilters {
  age?: { min?: number; max?: number };
  height?: { min?: number; max?: number };
  gender?: string;
  religion?: string;
  caste?: string;
  marital_status?: string;
  location?: { city?: string; state?: string; country?: string };
  education?: { level?: string; field?: string };
  employment?: { profession?: string; income_range?: string };
  verified?: boolean;
  searchTerm?: string;
  sortBy?: 'age' | 'recent' | 'compatibility';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Hook for searching profiles with filters, pagination, and caching
 */
export function useProfileSearch(filters: SearchFilters = {}, currentProfile?: UserProfile) {
  return useQuery({
    queryKey: ['profileSearch', filters],
    queryFn: async () => {
      const {
        age,
        height,
        gender,
        religion,
        caste,
        marital_status,
        location,
        education,
        employment,
        verified,
        searchTerm,
        page = 1,
        limit = 20,
      } = filters;

      try {
        // Start building query
        let query = supabase.from('profiles').select('*');
        
        // Apply filters
        if (age?.min) query = query.gte('age', age.min);
        if (age?.max) query = query.lte('age', age.max);
        
        if (height?.min) query = query.gte('height', height.min);
        if (height?.max) query = query.lte('height', height.max);
        
        if (gender) query = query.eq('gender', gender);
        if (religion) query = query.eq('religion', religion);
        if (caste) query = query.eq('caste', caste);
        if (marital_status) query = query.eq('marital_status', marital_status);
        
        if (verified !== undefined) query = query.eq('verified', verified);
        
        // Apply complex filters using Postgres operators
        if (location?.city) {
          query = query.ilike('location->>city', `%${location.city}%`);
        } else if (location?.state) {
          query = query.ilike('location->>state', `%${location.state}%`);
        } else if (location?.country) {
          query = query.ilike('location->>country', `%${location.country}%`);
        }
        
        if (education?.level) {
          query = query.ilike('education->>level', `%${education.level}%`);
        } else if (education?.field) {
          query = query.ilike('education->>field', `%${education.field}%`);
        }
        
        if (employment?.profession) {
          query = query.ilike('employment->>profession', `%${employment.profession}%`);
        }
        
        // Apply text search if searchTerm is provided
        if (searchTerm) {
          query = query.or(
            `name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,location->>city.ilike.%${searchTerm}%`
          );
        }
        
        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        // Apply sorting
        if (filters.sortBy) {
          const order = filters.sortDirection || 'asc';
          if (filters.sortBy === 'recent') {
            query = query.order('created_at', { ascending: order === 'asc' });
          } else if (filters.sortBy === 'age') {
            query = query.order('age', { ascending: order === 'asc' });
          }
          // 'compatibility' sorting is handled after fetching the data
        } else {
          // Default sort by most recent
          query = query.order('created_at', { ascending: false });
        }
        
        // Execute the query with pagination
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        let processedData = data as UserProfile[];
        
        // Apply compatibility-based sorting if requested and we have current profile
        if (filters.sortBy === 'compatibility' && currentProfile) {
          const matches = findBestMatches(currentProfile, processedData, processedData.length);
          processedData = matches.map(match => match.profile);
        }
        
        return {
          profiles: processedData,
          page,
          limit,
          totalCount: count || 0,
          hasMore: (count || 0) > (page * limit),
        };
      } catch (error) {
        console.error('Error searching profiles:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60, // 1 minute
    enabled: !!(filters && Object.keys(filters).length > 0), // Only run if filters are provided
  });
}

/**
 * Hook for getting recommended profiles based on compatibility
 */
export function useRecommendedProfiles(currentProfile?: UserProfile, limit: number = 10) {
  return useQuery({
    queryKey: ['recommendedProfiles', currentProfile?.id, limit],
    queryFn: async () => {
      if (!currentProfile) return [];
      
      try {
        // First, get a wider set of potential matches based on basic criteria
        let query = supabase.from('profiles').select('*');
        
        // Filter out the current user
        query = query.neq('id', currentProfile.id);
        
        // Basic matching criteria
        if (currentProfile.preferences?.age_range) {
          query = query.gte('age', currentProfile.preferences.age_range.min)
                       .lte('age', currentProfile.preferences.age_range.max);
        }
        
        if (currentProfile.religion) {
          query = query.eq('religion', currentProfile.religion);
        }
        
        // Gender preference logic (assuming heterosexual matching for this example)
        const targetGender = currentProfile.gender === 'male' ? 'female' : 'male';
        query = query.eq('gender', targetGender);
        
        // Get more candidates than needed for better compatibility matching
        const maxCandidates = limit * 3;
        const { data, error } = await query.limit(maxCandidates);
        
        if (error) throw error;
        
        // Use matching algorithm to find best compatible profiles
        const bestMatches = findBestMatches(
          currentProfile, 
          data as UserProfile[], 
          limit
        );
        
        return bestMatches.map(match => ({
          ...match.profile,
          compatibilityScore: Math.round(match.score * 100),
        }));
      } catch (error) {
        console.error('Error fetching recommended profiles:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!currentProfile,
  });
} 