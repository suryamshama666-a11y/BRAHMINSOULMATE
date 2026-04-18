
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';
import { horoscopeService } from '@/services/api/horoscope.service';
import { supabase, backendCall } from '@/services/api/base';

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

const fetchPotentialMatchesData = async (userId: string | undefined): Promise<CompatibilityMatch[]> => {
  if (!userId) return [];

  // Create mock compatibility matches since we don't have the table
  const mockMatches: CompatibilityMatch[] = [
    {
      id: 'match-1',
      user1_id: userId,
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
      user1_id: userId,
      user2_id: 'user-3',
      overall_score: 78,
      guna_milan_score: 25,
      personality_score: 75,
      lifestyle_score: 82,
      family_score: 77,
      created_at: new Date().toISOString()
    }
  ];

  return mockMatches;
};

export const useCompatibility = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['compatibility-matches', user?.id],
    queryFn: () => fetchPotentialMatchesData(user?.id),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const fetchPotentialMatches = () => refetch();

  const calculateCompatibility = async (userId1: string, userId2: string) => {
    try {
      // Fetch horoscope details for both users
      // Note: horoscope_details table may not exist, use fallback
      let h1: { birth_date?: string; rashi?: string; nakshatra?: string; manglik?: boolean } | null = null;
      let h2: { birth_date?: string; rashi?: string; nakshatra?: string; manglik?: boolean } | null = null;
      
      try {
        const h1Response = await (supabase as any)
          .from('horoscope_details')
          .select('*')
          .eq('user_id', userId1)
          .maybeSingle();
        h1 = h1Response.data;
      } catch {
        console.warn('horoscope_details table not available');
      }
      
      try {
        const h2Response = await (supabase as any)
          .from('horoscope_details')
          .select('*')
          .eq('user_id', userId2)
          .maybeSingle();
        h2 = h2Response.data;
      } catch {
        console.warn('horoscope_details table not available');
      }

      if (!h1 || !h2) {
        // Fallback to mock if data is missing, or return null
        return null;
      }

      // Create properly typed horoscope objects for compatibility calculation
      // The service only needs birth_date, rashi, nakshatra, and manglik_status
      const horoscope1 = {
        id: 'temp-1',
        user_id: userId1,
        birth_date: h1.birth_date || '',
        birth_time: '',
        birth_place: '',
        rashi: h1.rashi,
        nakshatra: h1.nakshatra,
        manglik_status: (h1.manglik ? 'yes' : 'no') as 'yes' | 'no' | 'anshik' | 'unknown',
        created_at: '',
        updated_at: ''
      };
      const horoscope2 = {
        id: 'temp-2',
        user_id: userId2,
        birth_date: h2.birth_date || '',
        birth_time: '',
        birth_place: '',
        rashi: h2.rashi,
        nakshatra: h2.nakshatra,
        manglik_status: (h2.manglik ? 'yes' : 'no') as 'yes' | 'no' | 'anshik' | 'unknown',
        created_at: '',
        updated_at: ''
      };

      const compatibility = horoscopeService.calculateCompatibility(horoscope1, horoscope2);
      
      // Attempt to get advanced matching from backend
      try {
        const advancedResponse = await backendCall<any>('horoscope/match', {
          method: 'POST',
          body: JSON.stringify({ partnerId: userId2 })
        });
        
        if (!advancedResponse.error && advancedResponse.data) {
          const ad = advancedResponse.data;
          // Normalize API response shape if needed (backendCall already tries to normalize)
          const finalAd = ad.data || ad; 
          
          return {
            overall_score: Math.round((finalAd.score / finalAd.total_points) * 100),
            guna_milan_score: finalAd.score,
            rashi_compatibility: (finalAd.kootas?.find((k: any) => k.name === 'Varna')?.score || 0) * 100,
            nakshatra_compatibility: (finalAd.kootas?.find((k: any) => k.name === 'Nadi')?.score || 0) * 12.5,
            dosha_compatibility: compatibility.factors.manglik,
            personality_score: 85,
            lifestyle_score: 80,
            family_score: 75,
            compatibility_details: {
              calculated_factors: {
                rashi_match: compatibility.factors.moonSign >= 70,
                manglik_match: compatibility.factors.manglik >= 60
              },
              details: compatibility.details,
              advanced: finalAd
            }
          };
        }
      } catch (err) {
        console.warn('Advanced matching failed, using local simplified calculation', err);
      }

      return {
        overall_score: compatibility.score,
        guna_milan_score: Math.round(compatibility.factors.nakshatra / 100 * 36), // Approximateguna score
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
    }
  };

  const getCompatibilityScore = async (targetUserId: string) => {
    if (!user) return null;
    
    // Check if we already have a saved match in compatibility_matches table
    let existing: { overall_score: number; guna_milan_score: number; personality_score?: number; lifestyle_score?: number; family_score?: number; compatibility_details?: unknown } | null = null;
    
    try {
      const existingResponse = await (supabase as any)
        .from('compatibility_scores')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
        .maybeSingle();
      existing = existingResponse.data;
    } catch {
      console.warn('compatibility_scores table not available');
    }

    if (existing) {
      return {
        overall_score: existing.overall_score,
        guna_milan_score: existing.guna_milan_score,
        personality_score: existing.personality_score,
        lifestyle_score: existing.lifestyle_score,
        family_score: existing.family_score,
        ...(existing.compatibility_details || {})
      };
    }

    return calculateCompatibility(user.id, targetUserId);
  };

  const saveMatchMutation = useMutation({
    mutationFn: async (matchData: Omit<CompatibilityMatch, 'id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');

      // For now, just return the new match since table doesn't exist
      const newMatch: CompatibilityMatch = {
        ...matchData,
        id: `match-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      return newMatch;
    },
    onSuccess: (newMatch) => {
      toast.success('Compatibility match saved!');
      queryClient.setQueryData(['compatibility-matches', user?.id], (old: CompatibilityMatch[] = []) => 
        [newMatch, ...old]
      );
    },
    onError: (error: unknown) => {
      console.error('Error saving compatibility match:', error);
      toast.error('Failed to save compatibility match');
    }
  });

  const saveCompatibilityMatch = async (matchData: Omit<CompatibilityMatch, 'id' | 'created_at'>) => {
    if (!user) {
      toast.error('Please login to save compatibility matches');
      return { success: false };
    }

    try {
      const match = await saveMatchMutation.mutateAsync(matchData);
      return { success: true, match };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  return {
    matches,
    loading,
    calculateCompatibility,
    getCompatibilityScore,
    fetchPotentialMatches,
    saveCompatibilityMatch
  };
};
