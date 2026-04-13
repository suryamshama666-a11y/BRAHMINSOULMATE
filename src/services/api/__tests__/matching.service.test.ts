import { describe, it, expect, vi } from 'vitest';
import { matchingService } from '../matching.service';

describe('MatchingService Algorithm', () => {
  const mockUser: any = {
    id: 'user1',
    user_id: 'user1',
    first_name: 'Rahul',
    gender: 'male',
    age: 28,
    gotra: 'Bharadwaj',
    location_city: 'Mumbai',
    education_level: 'Masters',
    occupation: 'Engineer'
  };

  it('should return 0% compatibility for Same Gotramarriage (Sagotra Veto)', () => {
    const target: any = {
      id: 'target1',
      first_name: 'Sneha',
      gender: 'female',
      age: 25,
      gotra: 'Bharadwaj', // SAME GOTRA
      location_city: 'Mumbai'
    };

    const score = (matchingService as any).calculateCompatibility(mockUser, target);
    expect(score).toBe(0);
  });

  it('should return 100% for an exact traditional and lifestyle match', () => {
    const target: any = {
      id: 'target2',
      first_name: 'Ananya',
      gender: 'female',
      age: 26, // Close age
      gotra: 'Kashyap', // DIFFERENT GOTRA
      location_city: 'Mumbai', // SAME CITY
      education_level: 'Masters', // SAME EDUCATION
      occupation: 'Engineer' // SAME OCCUPATION
    };

    const score = (matchingService as any).calculateCompatibility(mockUser, target);
    expect(score).toBeGreaterThanOrEqual(95);
  });

  it('should calculate lower score for large age gap or different location', () => {
    const target: any = {
      id: 'target3',
      gender: 'female',
      age: 45, // LARGE AGE GAP
      gotra: 'Vashistha',
      location_city: 'New York' // DIFFERENT LOCATION
    };

    const score = (matchingService as any).calculateCompatibility(mockUser, target);
    expect(score).toBeLessThan(50);
  });
});
