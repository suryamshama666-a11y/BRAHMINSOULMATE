
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';
import { horoscopeService, Horoscope } from '@/services/api/horoscope.service';
import { supabase } from '@/lib/supabase';

export interface CompatibilityMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  overall_score: number;
  guna_milan_score: number;
  personality_score: number;
  lifestyle_score: number;
  family_score: number;
  created_at: string;
  rashi_compatibility?: number;
  nakshatra_compatibility?: number;
  dosha_compatibility?: number;
  compatibility_details?: any;
}

export const useCompatibility = () => {
  const { user } = useSupabaseAuth();
  const [matches, setMatches] = useState<CompatibilityMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateCompatibility = async (userId1: string, userId2: string) => {
    try {
      setLoading(true);
      
      // Fetch horoscope details for both users
      const { data: h1 } = await supabase
        .from('horoscope_details')
        .select('*')
        .eq('user_id', userId1)
        .single();

      const { data: h2 } = await supabase
        .from('horoscope_details')
        .select('*')
        .eq('user_id', userId2)
        .single();

      if (!h1 || !h2) {
        // Fallback to mock if data is missing, or return null
        return null;
      }

      const compatibility = horoscopeService.calculateCompatibility(h1, h2);
      
      return {
        overall_score: compatibility.score,
        guna_milan_score: compatibility.factors.nakshatra, // Use nakshatra score as guna milan proxy
        rashi_compatibility: compatibility.factors.moonSign,
        nakshatra_compatibility: compatibility.factors.nakshatra,
        dosha_compatibility: compatibility.factors.manglik,
        personality_score: 85, // Mocked for now
        lifestyle_score: 80, // Mocked for now
        family_score: 75, // Mocked for now
        compatibility_details: {
          calculated_factors: {
            rashi_match: compatibility.factors.moonSign >= 70,
            manglik_match: compatibility.factors.manglik >= 60
          },
          details: compatibility.details
        }
      };
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityScore = async (targetUserId: string) => {
    if (!user) return null;
    
    // Check if we already have a saved match in compatibility_matches table
    const { data: existing } = await supabase
      .from('compatibility_matches')
      .select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
      .single();

    if (existing) {
      return {
        overall_score: existing.overall_score,
        guna_milan_score: existing.guna_milan_score,
        personality_score: existing.personality_score,
        lifestyle_score: existing.lifestyle_score,
        family_score: existing.family_score,
        ...existing.compatibility_details
      };
    }

    return calculateCompatibility(user.id, targetUserId);
  };

  // Mock function to get potential matches from profiles
  const fetchPotentialMatches = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create mock compatibility matches since we don't have the table
      const mockMatches: CompatibilityMatch[] = [
        {
          id: 'match-1',
          user1_id: user.id,
          user2_id: 'user-2',
          overall_score: 85,
          guna_milan_score: 28,
          personality_score: 90,
          lifestyle_score: 80,
          family_score: 85,
          created_at: new Date().toISOString()
        },
        {
          id: 'match-2',
          user1_id: user.id,
          user2_id: 'user-3',
          overall_score: 78,
          guna_milan_score: 25,
          personality_score: 75,
          lifestyle_score: 82,
          family_score: 77,
          created_at: new Date().toISOString()
        }
      ];

      setMatches(mockMatches);
    } catch (error) {
      console.error('Error fetching potential matches:', error);
      toast.error('Failed to load compatibility matches');
    } finally {
      setLoading(false);
    }
  };

  const saveCompatibilityMatch = async (matchData: Omit<CompatibilityMatch, 'id' | 'created_at'>) => {
    if (!user) {
      toast.error('Please login to save compatibility matches');
      return { success: false };
    }

    try {
      // For now, just add to local state since table doesn't exist
      const newMatch: CompatibilityMatch = {
        ...matchData,
        id: `match-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      setMatches(prev => [newMatch, ...prev]);
      toast.success('Compatibility match saved!');
      return { success: true, match: newMatch };
    } catch (error: any) {
      console.error('Error saving compatibility match:', error);
      toast.error('Failed to save compatibility match');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (user) {
      fetchPotentialMatches();
    }
  }, [user]);

  return {
    matches,
    loading,
    calculateCompatibility,
    getCompatibilityScore,
    fetchPotentialMatches,
    saveCompatibilityMatch
  };
};
