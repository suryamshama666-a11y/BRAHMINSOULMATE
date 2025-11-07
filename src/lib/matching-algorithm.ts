import { UserProfile } from '@/types';
import { memoize } from '@/lib/utils';

/**
 * Types for compatibility calculation
 */
interface CompatibilityFactors {
  ageWeight: number;
  educationWeight: number;
  locationWeight: number;
  interestsWeight: number;
  religionWeight: number;
  languageWeight: number;
  astrologicalWeight: number;
}

interface CompatibilityScore {
  totalScore: number;
  factorScores: {
    ageScore: number;
    educationScore: number;
    locationScore: number;
    interestsScore: number;
    religionScore: number;
    languageScore: number;
    astrologicalScore: number;
  };
}

/**
 * Default compatibility factors - these could be adjusted by user preferences
 */
const DEFAULT_COMPATIBILITY_FACTORS: CompatibilityFactors = {
  ageWeight: 0.15,
  educationWeight: 0.15,
  locationWeight: 0.2,
  interestsWeight: 0.15,
  religionWeight: 0.2,
  languageWeight: 0.05,
  astrologicalWeight: 0.1,
};

/**
 * Calculate age compatibility score between two profiles
 * Higher score when ages are within preferred range
 */
const calculateAgeCompatibility = (profile1: UserProfile, profile2: UserProfile): number => {
  // Calculate base age difference score
  const ageDiff = Math.abs(profile1.age - profile2.age);
  
  // Higher score for closer age
  let score = Math.max(0, 1 - ageDiff / 10);
  
  // Check for preference match if available
  if (profile1.preferences?.age_range) {
    const { min, max } = profile1.preferences.age_range;
    score = profile2.age >= min && profile2.age <= max ? score + 0.5 : score - 0.2;
  }
  
  return Math.min(1, Math.max(0, score));
};

/**
 * Calculate education compatibility
 */
const calculateEducationCompatibility = (profile1: UserProfile, profile2: UserProfile): number => {
  if (!profile1.education || !profile2.education) return 0.5;
  
  // Map education levels to numeric values
  const educationLevels = {
    'high_school': 1,
    'bachelors': 2,
    'masters': 3,
    'doctorate': 4,
    'other': 1.5
  };
  
  // Get education level numeric values (default to 1.5 if not found)
  const level1 = educationLevels[profile1.education.level as keyof typeof educationLevels] || 1.5;
  const level2 = educationLevels[profile2.education.level as keyof typeof educationLevels] || 1.5;
  
  // Base score on similar or higher education
  let score = 0.5;
  
  // Similar education level
  if (level1 === level2) {
    score += 0.3;
  }
  // Within one level
  else if (Math.abs(level1 - level2) === 1) {
    score += 0.2;
  }
  
  // Bonus for same field
  if (profile1.education.field && profile2.education.field && 
      profile1.education.field.toLowerCase() === profile2.education.field.toLowerCase()) {
    score += 0.2;
  }
  
  // Check for preference match if available
  if (profile1.preferences?.education_preference && 
      profile1.preferences.education_preference.some(pref => 
        pref.toLowerCase() === profile2.education.level?.toLowerCase())) {
    score += 0.2;
  }
  
  return Math.min(1, score);
};

/**
 * Calculate location compatibility
 */
const calculateLocationCompatibility = (profile1: UserProfile, profile2: UserProfile): number => {
  if (!profile1.location || !profile2.location) return 0.5;
  
  let score = 0;
  
  // Same city is best match
  if (profile1.location.city && profile2.location.city && 
      profile1.location.city.toLowerCase() === profile2.location.city.toLowerCase()) {
    score = 1;
  }
  // Same state is good match
  else if (profile1.location.state && profile2.location.state && 
           profile1.location.state.toLowerCase() === profile2.location.state.toLowerCase()) {
    score = 0.7;
  }
  // Same country is minimum match
  else if (profile1.location.country && profile2.location.country && 
           profile1.location.country.toLowerCase() === profile2.location.country.toLowerCase()) {
    score = 0.4;
  }
  
  // Check for location preference match
  if (profile1.preferences?.location_preference && 
      profile1.preferences.location_preference.some(loc => {
        return loc.toLowerCase() === profile2.location.city?.toLowerCase() ||
               loc.toLowerCase() === profile2.location.state?.toLowerCase() ||
               loc.toLowerCase() === profile2.location.country?.toLowerCase();
      })) {
    score += 0.3;
  }
  
  return Math.min(1, score);
};

/**
 * Calculate interests compatibility
 */
const calculateInterestsCompatibility = (profile1: UserProfile, profile2: UserProfile): number => {
  if (!profile1.interests || !profile2.interests || 
      profile1.interests.length === 0 || profile2.interests.length === 0) {
    return 0.5;
  }
  
  // Convert interests to lowercase for comparison
  const interests1 = profile1.interests.map(i => i.toLowerCase());
  const interests2 = profile2.interests.map(i => i.toLowerCase());
  
  // Count common interests
  const commonInterests = interests1.filter(interest => interests2.includes(interest));
  
  // Calculate score based on proportion of common interests
  const maxPossible = Math.min(interests1.length, interests2.length);
  const score = commonInterests.length / maxPossible;
  
  return score;
};

/**
 * Calculate religion and caste compatibility
 */
const calculateReligionCompatibility = (profile1: UserProfile, profile2: UserProfile): number => {
  if (!profile1.religion || !profile2.religion) return 0.5;
  
  let score = 0;
  
  // Same religion is the base
  if (profile1.religion.toLowerCase() === profile2.religion.toLowerCase()) {
    score = 0.7;
    
    // Check caste match if applicable
    if (profile1.caste && profile2.caste && 
        profile1.caste.toLowerCase() === profile2.caste.toLowerCase()) {
      score += 0.2;
      
      // Check subcaste match if applicable
      if (profile1.subcaste && profile2.subcaste && 
          profile1.subcaste.toLowerCase() === profile2.subcaste.toLowerCase()) {
        score += 0.1;
      }
    }
  } else {
    // Different religion
    score = 0.2;
  }
  
  // Check for caste preference match
  if (profile1.preferences?.caste_preference && 
      profile1.preferences.caste_preference.some(caste => 
        caste.toLowerCase() === profile2.caste?.toLowerCase())) {
    score += 0.2;
  }
  
  return Math.min(1, score);
};

/**
 * Calculate language compatibility
 */
const calculateLanguageCompatibility = (profile1: UserProfile, profile2: UserProfile): number => {
  if (!profile1.languages || !profile2.languages || 
      profile1.languages.length === 0 || profile2.languages.length === 0) {
    return 0.5;
  }
  
  // Convert languages to lowercase for comparison
  const languages1 = profile1.languages.map(l => l.toLowerCase());
  const languages2 = profile2.languages.map(l => l.toLowerCase());
  
  // Count common languages
  const commonLanguages = languages1.filter(lang => languages2.includes(lang));
  
  // Calculate score based on number of common languages
  // One common language is good, more is better
  const score = Math.min(1, commonLanguages.length / 2);
  
  return score;
};

/**
 * Calculate astrological compatibility (if available)
 */
const calculateAstrologicalCompatibility = (profile1: UserProfile, profile2: UserProfile): number => {
  if (!profile1.horoscope || !profile2.horoscope) return 0.5;
  
  let score = 0.5; // Default compatibility
  
  // Check moon sign compatibility (simplified)
  if (profile1.horoscope.moon_sign && profile2.horoscope.moon_sign) {
    // Compatible moon sign pairs (simplified version)
    const compatibleMoonSigns: Record<string, string[]> = {
      'aries': ['leo', 'sagittarius', 'aquarius'],
      'taurus': ['virgo', 'capricorn', 'cancer'],
      'gemini': ['libra', 'aquarius', 'aries'],
      'cancer': ['scorpio', 'pisces', 'taurus'],
      'leo': ['aries', 'sagittarius', 'gemini'],
      'virgo': ['taurus', 'capricorn', 'cancer'],
      'libra': ['gemini', 'aquarius', 'leo'],
      'scorpio': ['cancer', 'pisces', 'virgo'],
      'sagittarius': ['aries', 'leo', 'libra'],
      'capricorn': ['taurus', 'virgo', 'scorpio'],
      'aquarius': ['gemini', 'libra', 'sagittarius'],
      'pisces': ['cancer', 'scorpio', 'capricorn']
    };
    
    const moonSign1 = profile1.horoscope.moon_sign.toLowerCase();
    const moonSign2 = profile2.horoscope.moon_sign.toLowerCase();
    
    // Exact same sign
    if (moonSign1 === moonSign2) {
      score = 0.7;
    }
    // Compatible signs
    else if (compatibleMoonSigns[moonSign1]?.includes(moonSign2)) {
      score = 0.9;
    }
    // Incompatible signs
    else {
      score = 0.3;
    }
  }
  
  // Check manglik status if available
  if (profile1.horoscope.manglik !== undefined && profile2.horoscope.manglik !== undefined) {
    // If both are manglik or both are not manglik, it's compatible
    if (profile1.horoscope.manglik === profile2.horoscope.manglik) {
      score += 0.3;
    }
    // If one is manglik and the other is not, traditional view considers it less compatible
    else {
      score -= 0.2;
    }
  }
  
  return Math.min(1, Math.max(0, score));
};

/**
 * Calculate overall compatibility score between two profiles
 * Returns a detailed compatibility analysis
 */
export const calculateCompatibility = (
  profile1: UserProfile, 
  profile2: UserProfile,
  factors: CompatibilityFactors = DEFAULT_COMPATIBILITY_FACTORS
): CompatibilityScore => {
  // Calculate individual factor scores
  const ageScore = calculateAgeCompatibility(profile1, profile2);
  const educationScore = calculateEducationCompatibility(profile1, profile2);
  const locationScore = calculateLocationCompatibility(profile1, profile2);
  const interestsScore = calculateInterestsCompatibility(profile1, profile2);
  const religionScore = calculateReligionCompatibility(profile1, profile2);
  const languageScore = calculateLanguageCompatibility(profile1, profile2);
  const astrologicalScore = calculateAstrologicalCompatibility(profile1, profile2);
  
  // Calculate weighted total score
  const totalScore = 
    ageScore * factors.ageWeight +
    educationScore * factors.educationWeight +
    locationScore * factors.locationWeight +
    interestsScore * factors.interestsWeight +
    religionScore * factors.religionWeight +
    languageScore * factors.languageWeight +
    astrologicalScore * factors.astrologicalWeight;
  
  // Return detailed score breakdown
  return {
    totalScore,
    factorScores: {
      ageScore,
      educationScore,
      locationScore,
      interestsScore,
      religionScore,
      languageScore,
      astrologicalScore,
    }
  };
};

/**
 * Memoized version of calculateCompatibility for better performance
 * when calculating scores multiple times for the same profiles
 */
export const memoizedCalculateCompatibility = memoize(calculateCompatibility);

/**
 * Find best matches for a profile from a set of candidates
 * Returns sorted array of matches with compatibility scores
 */
export const findBestMatches = (
  profile: UserProfile,
  candidates: UserProfile[],
  count: number = 10,
  factors: CompatibilityFactors = DEFAULT_COMPATIBILITY_FACTORS
): { profile: UserProfile; score: number; compatibility: CompatibilityScore }[] => {
  // Calculate compatibility scores for all candidates
  const scoredCandidates = candidates.map(candidate => {
    const compatibility = memoizedCalculateCompatibility(profile, candidate, factors);
    return {
      profile: candidate,
      score: compatibility.totalScore,
      compatibility
    };
  });
  
  // Sort by score in descending order and return top matches
  return scoredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}; 