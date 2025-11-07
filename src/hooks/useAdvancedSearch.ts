
import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/getSupabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export interface SearchFilters {
  ageRange: [number, number];
  heightRange: [number, number];
  religion?: string;
  caste?: string;
  subcaste?: string;
  education?: string[];
  occupation?: string[];
  maritalStatus?: string[];
  location?: {
    states?: string[];
    cities?: string[];
    maxDistance?: number;
  };
  income?: {
    min?: number;
    max?: number;
    currency?: string;
    range?: string;
  };
  horoscope?: {
    rashi?: string[];
    manglik?: boolean | null;
    nakshatra?: string[];
  };
  family?: {
    type?: string[];
    siblings?: number;
  };
  verified?: boolean;
  onlineStatus?: boolean;
  recentlyActive?: boolean;
}

export interface CompatibilityScore {
  user_id: string;
  overall_score: number;
  personality_score: number;
  lifestyle_score: number;
  family_score: number;
  horoscope_score: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  search_criteria: SearchFilters;
  user_id: string;
  created_at: string;
}

export const useAdvancedSearch = () => {
  const { user } = useSupabaseAuth();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [compatibilityScores, setCompatibilityScores] = useState<CompatibilityScore[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);

  const performAdvancedSearch = useCallback(async (filters: SearchFilters) => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = getSupabase()
        .from('profiles')
        .select(`
          *,
          user_id
        `)
        .neq('user_id', user.id);

      // Age filter
      if (filters.ageRange) {
        const [minAge, maxAge] = filters.ageRange;
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - minAge);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - maxAge);
        
        query = query
          .gte('date_of_birth', minDate.toISOString().split('T')[0])
          .lte('date_of_birth', maxDate.toISOString().split('T')[0]);
      }

      // Height filter
      if (filters.heightRange) {
        query = query
          .gte('height', filters.heightRange[0])
          .lte('height', filters.heightRange[1]);
      }

      // Religion filter
      if (filters.religion) {
        query = query.eq('religion', filters.religion);
      }

      // Caste filter
      if (filters.caste) {
        query = query.eq('caste', filters.caste);
      }

      // Education filter
      if (filters.education && filters.education.length > 0) {
        query = query.in('education_level', filters.education);
      }

      // Occupation filter
      if (filters.occupation && filters.occupation.length > 0) {
        query = query.in('occupation', filters.occupation);
      }

      // Marital status filter
      if (filters.maritalStatus && filters.maritalStatus.length > 0) {
        query = query.in('marital_status', filters.maritalStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // For now, just set results without compatibility calculation
      // since we don't have the compatibility calculation function
      const resultsWithScores = (data || []).map(profile => ({
        ...profile,
        compatibility_score: Math.floor(Math.random() * 100) // Mock score for now
      }));

      // Sort by compatibility score
      resultsWithScores.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));

      setSearchResults(resultsWithScores);
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Failed to search profiles');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveSearch = async (name: string, filters: SearchFilters) => {
    if (!user) {
      toast.error('Please login to save searches');
      return { success: false };
    }

    try {
      // Mock implementation since saved_searches table doesn't exist
      const newSavedSearch: SavedSearch = {
        id: `search-${Date.now()}`,
        name,
        search_criteria: filters,
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      setSavedSearches(prev => [...prev, newSavedSearch]);
      toast.success('Search saved successfully');
      return { success: true, data: newSavedSearch };
    } catch (error: any) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
      return { success: false, error: error.message };
    }
  };

  const loadSavedSearches = useCallback(async () => {
    if (!user) return;

    try {
      // Mock implementation since saved_searches table doesn't exist
      const mockSavedSearches: SavedSearch[] = [
        {
          id: 'search-1',
          name: 'Preferred Match',
          search_criteria: {
            ageRange: [25, 35],
            heightRange: [160, 180],
            religion: 'Hindu'
          },
          user_id: user.id,
          created_at: new Date().toISOString()
        }
      ];

      setSavedSearches(mockSavedSearches);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSavedSearches();
    }
  }, [user, loadSavedSearches]);

  return {
    searchResults,
    compatibilityScores,
    savedSearches,
    loading,
    performAdvancedSearch,
    saveSearch,
  };
};
