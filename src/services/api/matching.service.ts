import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  status: 'pending' | 'viewed' | 'interested';
  created_at: string;
  updated_at: string;
  profile?: any;
}

export interface CompatibilityFactors {
  age: number;
  height: number;
  location: number;
  education: number;
  occupation: number;
  gotra: number;
  horoscope: number;
}

class MatchingService {
  // Calculate compatibility score between two users
  calculateCompatibility(user: any, candidate: any): { score: number; factors: CompatibilityFactors } {
    // TRADITIONAL SAGOTRA VETO: Strict requirement in Brahmin marriages
    if (user.gotra && candidate.gotra && user.gotra === candidate.gotra) {
      return { 
        score: 0, 
        factors: { age: 0, height: 0, location: 0, education: 0, occupation: 0, gotra: 0, horoscope: 0 } 
      };
    }

    const factors: CompatibilityFactors = {
      age: this.calculateAgeScore(user, candidate),
      height: this.calculateHeightScore(user, candidate),
      location: this.calculateLocationScore(user, candidate),
      education: this.calculateEducationScore(user, candidate),
      occupation: this.calculateOccupationScore(user, candidate),
      gotra: 1.0, // Different gotras are compatible
      horoscope: this.calculateHoroscopeScore(user, candidate)
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

  private calculateAgeScore(user: any, candidate: any): number {
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

  private calculateHeightScore(user: any, candidate: any): number {
    if (!user.height || !candidate.height) return 0.5;
    
    const heightDiff = Math.abs(user.height - candidate.height);
    if (heightDiff <= 5) return 1.0;
    if (heightDiff <= 10) return 0.8;
    return 0.4;
  }

  private calculateLocationScore(user: any, candidate: any): number {
    if (user.city === candidate.city) return 1.0;
    if (user.state === candidate.state) return 0.7;
    return 0.2;
  }

  private calculateEducationScore(user: any, candidate: any): number {
    if (!user.education_level || !candidate.education_level) return 0.5;
    if (user.education_level === candidate.education_level) return 1.0;
    return 0.5;
  }

  private calculateOccupationScore(user: any, candidate: any): number {
    if (user.occupation === candidate.occupation) return 1.0;
    return 0.5;
  }

  private calculateGotraScore(user: any, candidate: any): number {
    if (user.gotra === candidate.gotra) return 0.0;
    return 1.0;
  }

  private calculateHoroscopeScore(user: any, candidate: any): number {
    if (!user.rashi || !candidate.rashi) return 0.5;
    
    // Simplified compatibility based on Rashi
    if (user.rashi === candidate.rashi) return 1.0;
    return 0.5;
  }

  // Get matches for a user
  async getMatches(userId: string, limit: number = 20): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        profile:profiles!matches_user2_id_fkey(*)
      `)
      .eq('user1_id', userId)
      .order('compatibility_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as any[];
  }

  // Calculate and store matches for a user - PRODUCTION OPTIMIZED
  async calculateMatches(userId: string): Promise<void> {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!userProfile) return;

    // PRODUCTION SCALABILITY: Limit candidates to recent/relevant ones
    const { data: candidates } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', userId)
      .neq('gender', userProfile.gender)
      .order('last_active', { ascending: false })
      .limit(100); // Only process top 100 most active potential matches

    if (!candidates) return;

    const matches = candidates
      .map(candidate => {
        const { score } = this.calculateCompatibility(userProfile, candidate);
        return {
          user1_id: userId,
          user2_id: candidate.user_id,
          compatibility_score: score,
          status: 'pending' as const
        };
      })
      .filter(m => m.compatibility_score > 60); // Higher threshold for quality

    if (matches.length > 0) {
      await supabase.from('matches').upsert(matches, {
        onConflict: 'user1_id,user2_id'
      });
    }
  }

  // Get match score between two users
  async getMatchScore(user1Id: string, user2Id: string): Promise<number> {
    const { data } = await supabase
      .from('matches')
      .select('compatibility_score')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
      .single();

    return data?.compatibility_score || 0;
  }

  // Get recommended matches
  async getRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    const matches = await this.getMatches(userId, limit);
    return matches.map(m => m.profile).filter(Boolean);
  }
}

export const matchingService = new MatchingService();
