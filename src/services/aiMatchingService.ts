import { getSupabase } from '@/lib/getSupabase';
import { analyticsService } from './analyticsService';
import { toast } from 'sonner';
import { Profile } from '@/types/profile';

interface MatchScore {
  profileId: string;
  score: number;
  breakdown: {
    compatibility: number;
    preferences: number;
    activity: number;
    premium: number;
    location: number;
    interests: number;
    family: number;
    horoscope: number;
  };
  reasons: string[];
}

interface UserBehavior {
  profileViews: string[];
  interests: string[];
  messages: string[];
  searches: any[];
  preferences: any;
}

interface MLFeatures {
  age_difference: number;
  height_compatibility: number;
  education_match: number;
  income_compatibility: number;
  location_distance: number;
  interest_overlap: number;
  family_compatibility: number;
  horoscope_match: number;
  activity_score: number;
  premium_boost: number;
  behavioral_score: number;
}

class AIMatchingService {
  private supabase = getSupabase();
  private modelWeights = {
    compatibility: 0.25,    // Basic compatibility (age, height, etc.)
    preferences: 0.20,      // User preferences match
    activity: 0.15,         // User activity and engagement
    premium: 0.10,          // Premium subscription boost
    location: 0.10,         // Location proximity
    interests: 0.08,        // Common interests
    family: 0.07,           // Family background compatibility
    horoscope: 0.05         // Astrological compatibility
  };

  // Main AI matching function
  async getAIMatches(userId: string, limit: number = 20): Promise<MatchScore[]> {
    try {
      // Get user profile and preferences
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get user behavior data
      const userBehavior = await this.getUserBehavior(userId);

      // Get potential matches
      const candidates = await this.getCandidateProfiles(userProfile);

      // Calculate match scores using AI algorithm
      const matchScores = await Promise.all(
        candidates.map(candidate => this.calculateMatchScore(userProfile, candidate, userBehavior))
      );

      // Sort by score and return top matches
      const sortedMatches = matchScores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Track AI matching usage
      analyticsService.trackFeatureUsage('ai_matching', {
        user_id: userId,
        candidates_evaluated: candidates.length,
        top_score: sortedMatches[0]?.score || 0,
        matches_returned: sortedMatches.length
      });

      return sortedMatches;
    } catch (error) {
      console.error('AI matching error:', error);
      analyticsService.trackError('ai_matching_error', error.message);
      toast.error('Failed to get AI matches');
      return [];
    }
  }

  // Get user profile with all relevant data
  private async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Get candidate profiles for matching
  private async getCandidateProfiles(userProfile: Profile): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .neq('user_id', userProfile.user_id)
        .eq('gender', userProfile.gender === 'male' ? 'female' : 'male')
        .eq('religion', userProfile.religion)
        .order('last_active', { ascending: false })
        .limit(100); // Get top 100 active candidates

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
  }

  // Get user behavior data for personalization
  private async getUserBehavior(userId: string): Promise<UserBehavior> {
    try {
      // Get profile views
      const { data: views } = await this.supabase
        .from('profile_views')
        .select('viewed_profile_id')
        .eq('viewer_id', userId)
        .limit(50);

      // Get interests sent
      const { data: interests } = await this.supabase
        .from('matches')
        .select('match_id')
        .eq('user_id', userId)
        .limit(50);

      // Get message history
      const { data: messages } = await this.supabase
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', userId)
        .limit(50);

      return {
        profileViews: views?.map(v => v.viewed_profile_id) || [],
        interests: interests?.map(i => i.match_id) || [],
        messages: messages?.map(m => m.receiver_id) || [],
        searches: [], // Would be populated from search history
        preferences: {} // Would be populated from user preferences
      };
    } catch (error) {
      console.error('Error fetching user behavior:', error);
      return {
        profileViews: [],
        interests: [],
        messages: [],
        searches: [],
        preferences: {}
      };
    }
  }

  // Core AI matching algorithm
  private async calculateMatchScore(
    userProfile: Profile, 
    candidate: Profile, 
    userBehavior: UserBehavior
  ): Promise<MatchScore> {
    // Extract ML features
    const features = this.extractFeatures(userProfile, candidate);
    
    // Calculate individual scores
    const compatibilityScore = this.calculateCompatibilityScore(features);
    const preferencesScore = this.calculatePreferencesScore(userProfile, candidate);
    const activityScore = this.calculateActivityScore(candidate);
    const premiumScore = this.calculatePremiumScore(candidate);
    const locationScore = this.calculateLocationScore(userProfile, candidate);
    const interestsScore = this.calculateInterestsScore(userProfile, candidate);
    const familyScore = this.calculateFamilyScore(userProfile, candidate);
    const horoscopeScore = this.calculateHoroscopeScore(userProfile, candidate);

    // Apply behavioral learning
    const behavioralScore = this.calculateBehavioralScore(candidate.id, userBehavior);

    // Calculate weighted final score
    const finalScore = (
      compatibilityScore * this.modelWeights.compatibility +
      preferencesScore * this.modelWeights.preferences +
      activityScore * this.modelWeights.activity +
      premiumScore * this.modelWeights.premium +
      locationScore * this.modelWeights.location +
      interestsScore * this.modelWeights.interests +
      familyScore * this.modelWeights.family +
      horoscopeScore * this.modelWeights.horoscope
    ) * (1 + behavioralScore * 0.1); // Behavioral boost up to 10%

    // Generate match reasons
    const reasons = this.generateMatchReasons(userProfile, candidate, {
      compatibility: compatibilityScore,
      preferences: preferencesScore,
      activity: activityScore,
      premium: premiumScore,
      location: locationScore,
      interests: interestsScore,
      family: familyScore,
      horoscope: horoscopeScore
    });

    return {
      profileId: candidate.id,
      score: Math.round(finalScore * 100) / 100,
      breakdown: {
        compatibility: compatibilityScore,
        preferences: preferencesScore,
        activity: activityScore,
        premium: premiumScore,
        location: locationScore,
        interests: interestsScore,
        family: familyScore,
        horoscope: horoscopeScore
      },
      reasons
    };
  }

  // Extract ML features from profiles
  private extractFeatures(userProfile: Profile, candidate: Profile): MLFeatures {
    return {
      age_difference: Math.abs(userProfile.age - candidate.age),
      height_compatibility: this.calculateHeightCompatibility(userProfile, candidate),
      education_match: this.calculateEducationMatch(userProfile, candidate),
      income_compatibility: this.calculateIncomeCompatibility(userProfile, candidate),
      location_distance: this.calculateLocationDistance(userProfile, candidate),
      interest_overlap: this.calculateInterestOverlap(userProfile, candidate),
      family_compatibility: this.calculateFamilyCompatibility(userProfile, candidate),
      horoscope_match: this.calculateHoroscopeCompatibility(userProfile, candidate),
      activity_score: this.calculateActivityFromProfile(candidate),
      premium_boost: candidate.subscription_type === 'premium' ? 1 : 0,
      behavioral_score: 0 // Calculated separately
    };
  }

  // Individual scoring functions
  private calculateCompatibilityScore(features: MLFeatures): number {
    let score = 1.0;

    // Age compatibility (ideal range: 0-5 years)
    if (features.age_difference <= 3) score *= 1.0;
    else if (features.age_difference <= 5) score *= 0.9;
    else if (features.age_difference <= 8) score *= 0.7;
    else score *= 0.5;

    // Height compatibility
    score *= features.height_compatibility;

    // Education match
    score *= features.education_match;

    // Income compatibility
    score *= features.income_compatibility;

    return Math.max(0, Math.min(1, score));
  }

  private calculatePreferencesScore(userProfile: Profile, candidate: Profile): number {
    const preferences = userProfile.preferences || {};
    let score = 1.0;

    // Age preference
    if (preferences.age_min && preferences.age_max) {
      if (candidate.age >= preferences.age_min && candidate.age <= preferences.age_max) {
        score *= 1.0;
      } else {
        score *= 0.6;
      }
    }

    // Height preference
    if (preferences.height_min && preferences.height_max) {
      if (candidate.height >= preferences.height_min && candidate.height <= preferences.height_max) {
        score *= 1.0;
      } else {
        score *= 0.7;
      }
    }

    // Caste preference
    if (preferences.caste && preferences.caste.length > 0) {
      if (preferences.caste.includes(candidate.caste)) {
        score *= 1.0;
      } else {
        score *= 0.5;
      }
    }

    // Marital status preference
    if (preferences.marital_status && preferences.marital_status.length > 0) {
      if (preferences.marital_status.includes(candidate.marital_status)) {
        score *= 1.0;
      } else {
        score *= 0.6;
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateActivityScore(candidate: Profile): number {
    const lastActive = new Date(candidate.last_active);
    const now = new Date();
    const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceActive <= 1) return 1.0;
    if (daysSinceActive <= 3) return 0.9;
    if (daysSinceActive <= 7) return 0.8;
    if (daysSinceActive <= 14) return 0.6;
    if (daysSinceActive <= 30) return 0.4;
    return 0.2;
  }

  private calculatePremiumScore(candidate: Profile): number {
    return candidate.subscription_type === 'premium' ? 1.0 : 0.7;
  }

  private calculateLocationScore(userProfile: Profile, candidate: Profile): number {
    // Simplified location scoring - in real implementation, use actual coordinates
    const userLocation = userProfile.location || {};
    const candidateLocation = candidate.location || {};

    if (!userLocation.city || !candidateLocation.city) return 0.5;

    if (userLocation.city === candidateLocation.city) return 1.0;
    if (userLocation.state === candidateLocation.state) return 0.8;
    if (userLocation.country === candidateLocation.country) return 0.6;
    return 0.3;
  }

  private calculateInterestsScore(userProfile: Profile, candidate: Profile): number {
    const userInterests = userProfile.interests || [];
    const candidateInterests = candidate.interests || [];

    if (userInterests.length === 0 || candidateInterests.length === 0) return 0.5;

    const commonInterests = userInterests.filter(interest => 
      candidateInterests.includes(interest)
    );

    const overlapRatio = commonInterests.length / Math.max(userInterests.length, candidateInterests.length);
    return Math.max(0.2, overlapRatio);
  }

  private calculateFamilyScore(userProfile: Profile, candidate: Profile): number {
    const userFamily = userProfile.family || {};
    const candidateFamily = candidate.family || {};

    let score = 0.5; // Base score

    // Family type compatibility
    if (userFamily.type && candidateFamily.type) {
      if (userFamily.type === candidateFamily.type) score += 0.2;
    }

    // Family values compatibility
    if (userFamily.values && candidateFamily.values) {
      const commonValues = userFamily.values.filter(value => 
        candidateFamily.values.includes(value)
      );
      score += (commonValues.length / Math.max(userFamily.values.length, candidateFamily.values.length)) * 0.3;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateHoroscopeScore(userProfile: Profile, candidate: Profile): number {
    const userHoroscope = userProfile.horoscope || {};
    const candidateHoroscope = candidate.horoscope || {};

    if (!userHoroscope.sign || !candidateHoroscope.sign) return 0.5;

    // Simplified horoscope compatibility - in real implementation, use proper Vedic astrology
    const compatibleSigns = {
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

    const userSign = userHoroscope.sign;
    const candidateSign = candidateHoroscope.sign;

    if (compatibleSigns[userSign]?.includes(candidateSign)) return 0.9;
    if (userSign === candidateSign) return 0.7;
    return 0.4;
  }

  private calculateBehavioralScore(candidateId: string, userBehavior: UserBehavior): number {
    let score = 0;

    // Boost if user has viewed this profile before
    if (userBehavior.profileViews.includes(candidateId)) score += 0.3;

    // Boost if user has sent interest to similar profiles
    if (userBehavior.interests.length > 0) score += 0.2;

    // Boost if user has messaged similar profiles
    if (userBehavior.messages.length > 0) score += 0.2;

    return Math.max(0, Math.min(1, score));
  }

  // Helper functions for feature extraction
  private calculateHeightCompatibility(userProfile: Profile, candidate: Profile): number {
    const heightDiff = Math.abs(userProfile.height - candidate.height);
    if (heightDiff <= 5) return 1.0;
    if (heightDiff <= 10) return 0.9;
    if (heightDiff <= 15) return 0.7;
    return 0.5;
  }

  private calculateEducationMatch(userProfile: Profile, candidate: Profile): number {
    const userEdu = userProfile.education?.level || '';
    const candidateEdu = candidate.education?.level || '';

    if (!userEdu || !candidateEdu) return 0.5;

    const educationLevels = {
      'high_school': 1,
      'diploma': 2,
      'bachelors': 3,
      'masters': 4,
      'phd': 5
    };

    const userLevel = educationLevels[userEdu] || 0;
    const candidateLevel = educationLevels[candidateEdu] || 0;

    const levelDiff = Math.abs(userLevel - candidateLevel);
    if (levelDiff === 0) return 1.0;
    if (levelDiff === 1) return 0.8;
    if (levelDiff === 2) return 0.6;
    return 0.4;
  }

  private calculateIncomeCompatibility(userProfile: Profile, candidate: Profile): number {
    const userIncome = userProfile.annual_income || 0;
    const candidateIncome = candidate.annual_income || 0;

    if (userIncome === 0 || candidateIncome === 0) return 0.5;

    const ratio = Math.min(userIncome, candidateIncome) / Math.max(userIncome, candidateIncome);
    return Math.max(0.3, ratio);
  }

  private calculateLocationDistance(userProfile: Profile, candidate: Profile): number {
    // Simplified - in real implementation, use actual coordinates and distance calculation
    return this.calculateLocationScore(userProfile, candidate);
  }

  private calculateInterestOverlap(userProfile: Profile, candidate: Profile): number {
    return this.calculateInterestsScore(userProfile, candidate);
  }

  private calculateFamilyCompatibility(userProfile: Profile, candidate: Profile): number {
    return this.calculateFamilyScore(userProfile, candidate);
  }

  private calculateHoroscopeCompatibility(userProfile: Profile, candidate: Profile): number {
    return this.calculateHoroscopeScore(userProfile, candidate);
  }

  private calculateActivityFromProfile(candidate: Profile): number {
    return this.calculateActivityScore(candidate);
  }

  // Generate human-readable match reasons
  private generateMatchReasons(userProfile: Profile, candidate: Profile, scores: any): string[] {
    const reasons: string[] = [];

    if (scores.compatibility > 0.8) {
      reasons.push(`Excellent compatibility match (${Math.round(scores.compatibility * 100)}%)`);
    }

    if (scores.preferences > 0.8) {
      reasons.push('Matches your preferences perfectly');
    }

    if (scores.location > 0.8) {
      reasons.push('Lives in your preferred location');
    }

    if (scores.interests > 0.7) {
      reasons.push('Shares many common interests');
    }

    if (scores.family > 0.7) {
      reasons.push('Compatible family background');
    }

    if (scores.horoscope > 0.8) {
      reasons.push('Excellent astrological compatibility');
    }

    if (scores.activity > 0.8) {
      reasons.push('Recently active on the platform');
    }

    if (scores.premium > 0.9) {
      reasons.push('Premium member - serious about finding a match');
    }

    // Age-specific reasons
    const ageDiff = Math.abs(userProfile.age - candidate.age);
    if (ageDiff <= 2) {
      reasons.push('Perfect age match');
    } else if (ageDiff <= 5) {
      reasons.push('Great age compatibility');
    }

    // Education-specific reasons
    if (userProfile.education?.level === candidate.education?.level) {
      reasons.push('Same education level');
    }

    // Caste-specific reasons
    if (userProfile.caste === candidate.caste) {
      reasons.push('Same caste background');
    }

    return reasons.slice(0, 3); // Return top 3 reasons
  }

  // Update model weights based on user feedback
  async updateModelWeights(userId: string, feedback: any) {
    try {
      // This would implement reinforcement learning to improve matching over time
      // For now, we'll just log the feedback
      analyticsService.track('ai_model_feedback', {
        user_id: userId,
        feedback,
        timestamp: new Date().toISOString()
      });

      // In a real implementation, this would:
      // 1. Store feedback in a training dataset
      // 2. Retrain the model periodically
      // 3. Update weights based on successful matches
      
    } catch (error) {
      console.error('Error updating model weights:', error);
    }
  }

  // Get match explanation for a specific profile
  async getMatchExplanation(userId: string, candidateId: string): Promise<any> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const candidateProfile = await this.getUserProfile(candidateId);
      const userBehavior = await this.getUserBehavior(userId);

      if (!userProfile || !candidateProfile) {
        throw new Error('Profile not found');
      }

      const matchScore = await this.calculateMatchScore(userProfile, candidateProfile, userBehavior);

      return {
        score: matchScore.score,
        breakdown: matchScore.breakdown,
        reasons: matchScore.reasons,
        recommendations: this.generateRecommendations(userProfile, candidateProfile, matchScore)
      };
    } catch (error) {
      console.error('Error getting match explanation:', error);
      return null;
    }
  }

  // Generate recommendations for improving matches
  private generateRecommendations(userProfile: Profile, candidate: Profile, matchScore: MatchScore): string[] {
    const recommendations: string[] = [];

    if (matchScore.breakdown.preferences < 0.7) {
      recommendations.push('Consider updating your preferences to find better matches');
    }

    if (matchScore.breakdown.interests < 0.5) {
      recommendations.push('Add more interests to your profile to find compatible matches');
    }

    if (matchScore.breakdown.activity < 0.6) {
      recommendations.push('Stay active on the platform to improve your match visibility');
    }

    if (matchScore.breakdown.premium < 0.8 && userProfile.subscription_type === 'free') {
      recommendations.push('Consider upgrading to premium for better match quality');
    }

    return recommendations;
  }
}

// Create and export singleton instance
export const aiMatchingService = new AIMatchingService();

// React hook for AI matching
export const useAIMatching = () => {
  return {
    getAIMatches: aiMatchingService.getAIMatches.bind(aiMatchingService),
    getMatchExplanation: aiMatchingService.getMatchExplanation.bind(aiMatchingService),
    updateModelWeights: aiMatchingService.updateModelWeights.bind(aiMatchingService)
  };
};

export default aiMatchingService;