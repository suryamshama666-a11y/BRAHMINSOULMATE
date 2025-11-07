
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

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
}

export const useCompatibility = () => {
  const { user } = useSupabaseAuth();
  const [matches, setMatches] = useState<CompatibilityMatch[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock compatibility calculation since we don't have the actual table
  const calculateCompatibility = async (userId1: string, userId2: string) => {
    try {
      // Mock calculation - in real app this would use horoscope data
      const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
      
      return {
        overall_score: mockScore,
        guna_milan_score: Math.floor(Math.random() * 36) + 18, // 18-36 range
        rashi_compatibility: Math.floor(Math.random() * 25) + 10,
        nakshatra_compatibility: Math.floor(Math.random() * 25) + 10,
        dosha_compatibility: Math.floor(Math.random() * 25) + 10,
        personality_score: Math.floor(Math.random() * 30) + 70,
        lifestyle_score: Math.floor(Math.random() * 30) + 70,
        family_score: Math.floor(Math.random() * 30) + 70,
        compatibility_details: {
          calculated_factors: {
            rashi_match: Math.random() > 0.5,
            manglik_match: Math.random() > 0.3
          }
        }
      };
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return null;
    }
  };

  const getCompatibilityScore = async (userId: string) => {
    if (!user) return null;
    return calculateCompatibility(user.id, userId);
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
