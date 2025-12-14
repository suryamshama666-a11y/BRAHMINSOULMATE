import { supabase } from '@/lib/supabase';

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
    const factors: CompatibilityFactors = {
      age: this.calculateAgeScore(user, candidate),
      height: this.calculateHeightScore(user, candidate),
      location: this.calculateLocationScore(user, candidate),
      education: this.calculateEducationScore(user, candidate),
      occupation: this.calculateOccupationScore(user, candidate),
      gotra: this.calculateGotraScore(user, candidate),
      horoscope: this.calculateHoroscopeScore(user, candidate)
    };

    const score = (
      factors.age * 0.20 +
      factors.height * 0.10 +
      factors.location * 0.15 +
      factors.education * 0.15 +
      factors.occupation * 0.10 +
      factors.gotra * 0.20 +
      factors.horoscope * 0.10
    );

    return { score: Math.round(score * 100), factors };
  }

  private calculateAgeScore(user: any, candidate: any): number {
    if (!user.age || !candidate.age) return 0.5;
    
    const ageDiff = Math.abs(user.age - candidate.age);
    if (ageDiff <= 2) return 1.0;
    if (ageDiff <= 5) return 0.8;
    if (ageDiff <= 8) return 0.6;
    if (ageDiff <= 10) return 0.4;
    return 0.2;
  }

  private calculateHeightScore(user: any, candidate: any): number {
    if (!user.height || !candidate.height) return 0.5;
    
    const heightDiff = Math.abs(user.height - candidate.height);
    if (heightDiff <= 5) return 1.0;
    if (heightDiff <= 10) return 0.8;
    if (heightDiff <= 15) return 0.6;
    return 0.4;
  }

  private calculateLocationScore(user: any, candidate: any): number {
    if (!user.city || !candidate.city) return 0.5;
    
    if (user.city === candidate.city) return 1.0;
    if (user.state === candidate.state) return 0.7;
    if (user.country === candidate.country) return 0.4;
    return 0.2;
  }

  private calculateEducationScore(user: any, candidate: any): number {
    if (!user.education || !candidate.education) return 0.5;
    
    const educationLevels = ['High School', 'Diploma', 'Bachelor', 'Master', 'Doctorate'];
    const userLevel = educationLevels.indexOf(user.education);
    const candidateLevel = educationLevels.indexOf(candidate.education);
    
    if (userLevel === -1 || candidateLevel === -1) return 0.5;
    
    const diff = Math.abs(userLevel - candidateLevel);
    if (diff === 0) return 1.0;
    if (diff === 1) return 0.8;
    if (diff === 2) return 0.6;
    return 0.4;
  }

  private calculateOccupationScore(user: any, candidate: any): number {
    if (!user.occupation || !candidate.occupation) return 0.5;
    
    // Simple matching - can be enhanced with occupation categories
    if (user.occupation === candidate.occupation) return 1.0;
    return 0.5;
  }

  private calculateGotraScore(user: any, candidate: any): number {
    if (!user.gotra || !candidate.gotra) return 0.5;
    
    // Same gotra is not compatible in traditional Hindu marriages
    if (user.gotra === candidate.gotra) return 0.0;
    return 1.0;
  }

  private calculateHoroscopeScore(user: any, candidate: any): number {
    if (!user.moon_sign || !candidate.moon_sign) return 0.5;
    
    // Simplified horoscope compatibility
    const compatibleSigns: Record<string, string[]> = {
      'Aries': ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
      'Taurus': ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
      'Gemini': ['Libra', 'Aquarius', 'Aries', 'Leo'],
      'Cancer': ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
      'Leo': ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
      'Virgo': ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
      'Libra': ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
      'Scorpio': ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
      'Sagittarius': ['Aries', 'Leo', 'Libra', 'Aquarius'],
      'Capricorn': ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
      'Aquarius': ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
      'Pisces': ['Cancer', 'Scorpio', 'Taurus', 'Capricorn']
    };

    const userSign = user.moon_sign;
    const candidateSign = candidate.moon_sign;
    
    if (compatibleSigns[userSign]?.includes(candidateSign)) return 1.0;
    if (userSign === candidateSign) return 0.7;
    return 0.5;
  }

  // Get matches for a user
  async getMatches(userId: string, limit: number = 20): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        profile:user2_id (
          user_id,
          full_name,
          age,
          height,
          city,
          state,
          education,
          occupation,
          photos,
          profile_picture
        )
      `)
      .eq('user1_id', userId)
      .order('compatibility_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Calculate and store matches for a user
  async calculateMatches(userId: string): Promise<void> {
    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) throw userError;

    // Get potential matches (opposite gender, not same user)
    const { data: candidates, error: candidatesError } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', userId)
      .neq('gender', userProfile.gender);

    if (candidatesError) throw candidatesError;

    // Calculate compatibility for each candidate
    const matches = candidates.map(candidate => {
      const { score } = this.calculateCompatibility(userProfile, candidate);
      return {
        user1_id: userId,
        user2_id: candidate.user_id,
        compatibility_score: score,
        status: 'pending' as const
      };
    });

    // Filter matches with score > 50
    const goodMatches = matches.filter(m => m.compatibility_score > 50);

    // Upsert matches
    if (goodMatches.length > 0) {
      const { error: insertError } = await supabase
        .from('matches')
        .upsert(goodMatches, { 
          onConflict: 'user1_id,user2_id',
          ignoreDuplicates: false 
        });

      if (insertError) throw insertError;
    }
  }

  // Get match score between two users
  async getMatchScore(user1Id: string, user2Id: string): Promise<number> {
    const { data, error } = await supabase
      .from('matches')
      .select('compatibility_score')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
      .single();

    if (error) {
      // If no match exists, calculate it
      const { data: user1 } = await supabase.from('profiles').select('*').eq('user_id', user1Id).single();
      const { data: user2 } = await supabase.from('profiles').select('*').eq('user_id', user2Id).single();
      
      if (user1 && user2) {
        const { score } = this.calculateCompatibility(user1, user2);
        return score;
      }
      return 0;
    }

    return data.compatibility_score;
  }

  // Get recommended matches
  async getRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    const matches = await this.getMatches(userId, limit);
    return matches.map(m => m.profile).filter(Boolean);
  }
}

export const matchingService = new MatchingService();
