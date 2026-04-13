import { describe, it, expect } from 'vitest';
import { 
  calculateCompatibility, 
  findBestMatches 
} from '../matching-algorithm';
import { UserProfile } from '@/types';

const mockProfile1: UserProfile = {
  id: '1',
  user_id: 'user1',
  name: 'Rahul Sharma',
  age: 28,
  gender: 'male',
  images: [],
  bio: 'A software engineer looking for a partner.',
  location: {
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India'
  },
  religion: 'Hindu',
  caste: 'Brahmin',
  subcaste: 'Saraswat',
  marital_status: 'never_married',
  height: 175,
  education: {
    level: 'masters',
    field: 'Computer Science',
    institution: 'IIT Bombay'
  },
  employment: {
    profession: 'Software Engineer',
    company: 'Tech Corp',
    position: 'Senior Developer',
    income_range: '20-30 LPA'
  },
  family: {
    father_occupation: 'Retired',
    mother_occupation: 'Homemaker',
    siblings: 1,
    family_type: 'nuclear',
    family_values: 'Moderate',
    about_family: 'Simple family'
  },
  preferences: {
    age_range: { min: 24, max: 29 },
    height_range: { min: 155, max: 170 },
    location_preference: ['Mumbai', 'Pune'],
    education_preference: ['masters', 'bachelors'],
    occupation_preference: ['Software Engineer', 'Doctor'],
    caste_preference: ['Brahmin']
  },
  horoscope: {
    birth_time: '10:00 AM',
    birth_place: 'Mumbai',
    moon_sign: 'Aries',
    sun_sign: 'Leo',
    nakshatra: 'Ashwini',
    manglik: false
  },
  subscription_type: 'free',
  interests: ['Reading', 'Travel', 'Coding'],
  languages: ['English', 'Hindi', 'Marathi'],
  verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_active: new Date().toISOString()
};

const mockProfile2: UserProfile = {
  id: '2',
  user_id: 'user2',
  name: 'Anjali Gupta',
  age: 26,
  gender: 'female',
  images: [],
  bio: 'A doctor passionate about helping people.',
  location: {
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India'
  },
  religion: 'Hindu',
  caste: 'Brahmin',
  subcaste: 'Saraswat',
  marital_status: 'never_married',
  height: 165,
  education: {
    level: 'masters',
    field: 'Medicine',
    institution: 'KEM Hospital'
  },
  employment: {
    profession: 'Doctor',
    company: 'City Hospital',
    position: 'Resident',
    income_range: '15-25 LPA'
  },
  family: {
    father_occupation: 'Doctor',
    mother_occupation: 'Doctor',
    siblings: 2,
    family_type: 'nuclear',
    family_values: 'Moderate',
    about_family: 'Medical background'
  },
  preferences: {
    age_range: { min: 26, max: 32 },
    height_range: { min: 170, max: 185 },
    location_preference: ['Mumbai'],
    education_preference: ['masters', 'doctorate'],
    occupation_preference: ['Doctor', 'Engineer'],
    caste_preference: ['Brahmin']
  },
  horoscope: {
    birth_time: '08:30 AM',
    birth_place: 'Mumbai',
    moon_sign: 'Leo',
    sun_sign: 'Virgo',
    nakshatra: 'Magha',
    manglik: false
  },
  subscription_type: 'premium',
  interests: ['Reading', 'Travel', 'Yoga'],
  languages: ['English', 'Hindi', 'Gujarati'],
  verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_active: new Date().toISOString()
};

describe('Matching Algorithm', () => {
  describe('overall compatibility', () => {
    it('should calculate a reasonable total score between compatible profiles', () => {
      const score = calculateCompatibility(mockProfile1, mockProfile2);
      
      expect(score.totalScore).toBeGreaterThan(0.7);
      expect(score.totalScore).toBeLessThanOrEqual(1.0);
    });

    it('should calculate a lower total score for incompatible profiles', () => {
      const incompatibleProfile: UserProfile = {
        ...mockProfile2,
        age: 45,
        location: { city: 'New York', state: 'NY', country: 'USA' },
        religion: 'Christian',
        interests: ['Gardening'],
        languages: ['French'],
        horoscope: {
          ...mockProfile2.horoscope,
          moon_sign: 'Scorpio',
          manglik: true
        }
      };
      
      const score = calculateCompatibility(mockProfile1, incompatibleProfile);
      expect(score.totalScore).toBeLessThan(0.5);
    });
  });

  describe('factor scores', () => {
    it('should have a high age score for ages within preference', () => {
      const score = calculateCompatibility(mockProfile1, mockProfile2);
      expect(score.factorScores.ageScore).toBeGreaterThanOrEqual(0.8);
    });

    it('should have a max location score for same city', () => {
      const score = calculateCompatibility(mockProfile1, mockProfile2);
      expect(score.factorScores.locationScore).toBe(1.0);
    });

    it('should have a high religion score for same religion and caste', () => {
      const score = calculateCompatibility(mockProfile1, mockProfile2);
      expect(score.factorScores.religionScore).toBeGreaterThanOrEqual(0.9);
    });

    it('should have a high interest score for shared interests', () => {
      const score = calculateCompatibility(mockProfile1, mockProfile2);
      // 'Reading' and 'Travel' are common
      expect(score.factorScores.interestsScore).toBeGreaterThan(0.6);
    });

    it('should have a high astrological score for compatible moon signs and same manglik status', () => {
      const score = calculateCompatibility(mockProfile1, mockProfile2);
      // Aries and Leo are compatible moon signs in the simplified logic
      expect(score.factorScores.astrologicalScore).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe('findBestMatches', () => {
    it('should return candidates sorted by compatibility score', () => {
      const candidates = [
        { ...mockProfile2, id: '2', name: 'Highly Compatible' },
        { 
          ...mockProfile2, 
          id: '3', 
          name: 'Less Compatible',
          age: 40,
          location: { city: 'Delhi', state: 'Delhi', country: 'India' }
        }
      ];
      
      const matches = findBestMatches(mockProfile1, candidates);
      
      expect(matches.length).toBe(2);
      expect(matches[0].profile.name).toBe('Highly Compatible');
      expect(matches[1].profile.name).toBe('Less Compatible');
      expect(matches[0].score).toBeGreaterThan(matches[1].score);
    });
  });
});
