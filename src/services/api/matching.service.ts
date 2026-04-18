import { supabase, apiCall, APIResponse } from './base';
import { UserProfile, Match, CompatibilityFactors, ProfileRow, isProfileRow } from '@/types';
import { mapToUserProfile } from '@/utils/profileUtils';

class MatchingService {
  // Calculate compatibility score between two users
  calculateCompatibility(user: ProfileRow, candidate: ProfileRow): { score: number; factors: CompatibilityFactors } {
    // TRADITIONAL SAGOTRA VETO: Strict requirement in Brahmin marriages
    if (user.gotra && candidate.gotra && user.gotra === candidate.gotra) {
      return { 
        score: 0, 
        factors: { age: 0, height: 0, location: 0, education: 0, occupation: 0, gotra: 0, horoscope: 0, values: 0, lifestyle: 0, caste: 0, religion: 0 } 
      };
    }

    const factors: CompatibilityFactors = {
      age: this.calculateAgeScore(user, candidate),
      height: this.calculateHeightScore(user, candidate),
      location: this.calculateLocationScore(user, candidate),
      education: this.calculateEducationScore(user, candidate),
      occupation: this.calculateOccupationScore(user, candidate),
      gotra: 1.0, // Different gotras are compatible
      horoscope: this.calculateHoroscopeScore(user, candidate),
      caste: 1.0,
      religion: 1.0,
      lifestyle: 1.0,
      values: 1.0
    };

    const weightedScore = (
      factors.age * 0.20 +
      factors.height * 0.10 +
      factors.location * 0.15 +
      factors.education * 0.15 +
      factors.occupation * 0.10 +
      factors.gotra * 0.20 +
      factors.horoscope * 0.10
    );

    return { score: Math.round(weightedScore * 100), factors };
  }

  private calculateAgeScore(user: ProfileRow, candidate: ProfileRow): number {
    if (!user.date_of_birth || !candidate.date_of_birth) return 0.5;
    
    const userAge = this.calculateAge(user.date_of_birth);
    const candidateAge = this.calculateAge(candidate.date_of_birth);
    const ageDiff = Math.abs(userAge - candidateAge);

    if (ageDiff <= 2) return 1.0;
    if (ageDiff <= 5) return 0.8;
    if (ageDiff <= 8) return 0.6;
    return 0.2;
  }

  private calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  private calculateHeightScore(user: ProfileRow, candidate: ProfileRow): number {
    const mappedUser: any = user;
    const mappedCandidate: any = candidate;
    
    if (!mappedUser.height || !mappedCandidate.height) return 0.5;
    
    const heightDiff = Math.abs(mappedUser.height - mappedCandidate.height);
    if (heightDiff <= 5) return 1.0;
    if (heightDiff <= 10) return 0.8;
    return 0.4;
  }

  private calculateLocationScore(user: ProfileRow, candidate: ProfileRow): number {
    const mappedUser: any = user;
    const mappedCandidate: any = candidate;
    if (mappedUser.city && mappedCandidate.city && mappedUser.city === mappedCandidate.city) return 1.0;
    if (mappedUser.state && mappedCandidate.state && mappedUser.state === mappedCandidate.state) return 0.7;
    return 0.2;
  }

  private calculateEducationScore(user: ProfileRow, candidate: ProfileRow): number {
    if (!user.education_level || !candidate.education_level) return 0.5;
    if (user.education_level === candidate.education_level) return 1.0;
    return 0.5;
  }

  private calculateOccupationScore(user: ProfileRow, candidate: ProfileRow): number {
    if (user.occupation === candidate.occupation) return 1.0;
    return 0.5;
  }

  private calculateGotraScore(user: ProfileRow, candidate: ProfileRow): number {
    if (user.gotra === candidate.gotra) return 0.0;
    return 1.0;
  }

  private calculateHoroscopeScore(user: ProfileRow, candidate: ProfileRow): number {
    const userRashi = this.extractRashi(user.horoscope);
    const candidateRashi = this.extractRashi(candidate.horoscope);
    
    if (!userRashi || !candidateRashi) return 0.5;
    
    // Simplified compatibility based on Rashi
    if (userRashi === candidateRashi) return 1.0;
    return 0.5;
  }

  private extractRashi(horoscope: string | Record<string, unknown> | undefined): string | null {
    if (!horoscope) return null;
    
    if (typeof horoscope === 'string') {
      try {
        const parsed = JSON.parse(horoscope) as Record<string, unknown>;
        return typeof parsed.rashi === 'string' ? parsed.rashi : null;
      } catch {
        return null;
      }
    }
    
    if (typeof horoscope === 'object' && horoscope !== null && 'rashi' in horoscope) {
      return typeof horoscope.rashi === 'string' ? (horoscope.rashi as string) : null;
    }
    
    return null;
  }

  // Get matches for a user
  async getMatches(userId: string, limit: number = 20): Promise<APIResponse<Match[]>> {
    return apiCall(async () => {
      const { data, error } = await (supabase as any)
        .from('matches')
        .select(`
          *,
          profile:profiles!matches_user2_id_fkey(*)
        `)
        .eq('user1_id', userId)
        .order('compatibility_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      const matches = (data || []).map((match: any) => ({
        ...match,
        user_profile: match.profile ? mapToUserProfile(match.profile) : undefined
      }));

      return { data: matches as Match[], error: null };
    });
  }

  // Calculate and store matches for a user
  async calculateMatches(userId: string): Promise<APIResponse<void>> {
    return apiCall(async () => {
      const { data: userProfile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      if (!userProfile) return { data: null, error: null };

      const { data: candidates, error: candidateError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .neq('user_id', userId)
        .neq('gender', (userProfile as any).gender)
        .order('last_active', { ascending: false })
        .limit(100);

      if (candidateError) throw candidateError;
      if (!candidates) return { data: null, error: null };

      const matches = candidates
        .map((candidate: any) => {
          const { score } = this.calculateCompatibility(userProfile as any, candidate as any);
          return {
            user1_id: userId,
            user2_id: candidate.user_id,
            compatibility_score: score,
            status: 'pending' as const
          };
        })
        .filter((m: any) => m.compatibility_score > 60);

      if (matches.length > 0) {
        const { error: upsertError } = await (supabase as any).from('matches').upsert(matches, {
          onConflict: 'user1_id,user2_id'
        });
        if (upsertError) throw upsertError;
      }

      return { data: undefined, error: null };
    });
  }

  // Get match score between two users
  async getMatchScore(user1Id: string, user2Id: string): Promise<APIResponse<number>> {
    return apiCall(async () => {
      const { data, error } = await (supabase as any)
        .from('matches')
        .select('compatibility_score')
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data?.compatibility_score || 0, error: null };
    });
  }

  // Get recommended matches
  async getRecommendations(userId: string, limit: number = 10): Promise<APIResponse<UserProfile[]>> {
    return apiCall(async () => {
      const result = await this.getMatches(userId, limit);
      if (result.error) throw result.error;
      
      const profiles = (result.data || [])
        .map(m => m.user_profile)
        .filter((profile): profile is UserProfile => profile !== undefined);
        
      return { data: profiles, error: null };
    });
  }
}

export const matchingService = new MatchingService();
export { MatchingService };
