import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    country?: string[];
  };
  country?: string[];
  gotra?: string[];
  brahminCommunity?: string[];
  marriageTimeline?: string;
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
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_id
        `)
        .neq('user_id', user.id);

      // Filtering logic...
      if (filters.ageRange) {
        const [minAge, maxAge] = filters.ageRange;
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - minAge);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - maxAge);
        query = query.gte('date_of_birth', minDate.toISOString().split('T')[0]).lte('date_of_birth', maxDate.toISOString().split('T')[0]);
      }

      if (filters.heightRange) {
        query = query.gte('height', filters.heightRange[0]).lte('height', filters.heightRange[1]);
      }

      if (filters.religion) query = query.eq('religion', filters.religion);
      if (filters.caste) query = query.eq('caste', filters.caste);
      if (filters.education?.length) query = query.in('education_level', filters.education);
      if (filters.occupation?.length) query = query.in('occupation', filters.occupation);
      if (filters.maritalStatus?.length) query = query.in('marital_status', filters.maritalStatus);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // Production Matchmaking Logic: Fetch real compatibility scores
      // Note: compatibility_scores table may not exist in schema, use fallback
      const profileIds = (data || []).map(p => p.user_id);
      let scoresData: Array<{ user1_id: string; user2_id: string; overall_score: number }> | null = null;
      
      try {
        const scoresResponse = await (supabase as any)
          .from('compatibility_scores')
          .select('user1_id, user2_id, overall_score')
          .eq('user1_id', user.id)
          .in('user2_id', profileIds);
        scoresData = scoresResponse.data;
      } catch {
        // Table doesn't exist, use fallback scoring
        console.warn('compatibility_scores table not available, using fallback');
      }

      const resultsWithScores = (data || []).map(profile => {
        const scoreRecord = scoresData?.find(s => s.user2_id === profile.user_id);
        return {
          ...profile,
          compatibility_score: scoreRecord?.overall_score || 0
        };
      });

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
      const { data, error } = await (supabase as any)
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name,
          search_criteria: filters
        })
        .select()
        .single();

      if (error) throw error;

      setSavedSearches(prev => [...prev, data as SavedSearch]);
      toast.success('Search saved successfully');
      return { success: true, data };
    } catch (error: unknown) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  const loadSavedSearches = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches((data || []) as SavedSearch[]);
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