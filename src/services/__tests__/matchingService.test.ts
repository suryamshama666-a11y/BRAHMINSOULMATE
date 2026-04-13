import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatchingService } from '../matchingService';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        neq: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

describe('MatchingService', () => {
  let matchingService: MatchingService;

  beforeEach(() => {
    matchingService = new MatchingService();
    vi.clearAllMocks();
  });

  describe('calculateCompatibility', () => {
    it('should calculate compatibility score between two profiles', () => {
      const profile1 = {
        id: '1',
        religion: 'Hindu',
        caste: 'Brahmin',
        subcaste: 'Iyer',
        education: { degree: 'Masters' },
        location: { city: 'Mumbai' },
        age: 28,
        interests: ['reading', 'music'],
      };

      const profile2 = {
        id: '2',
        religion: 'Hindu',
        caste: 'Brahmin',
        subcaste: 'Iyer',
        education: { degree: 'Masters' },
        location: { city: 'Mumbai' },
        age: 26,
        interests: ['reading', 'travel'],
      };

      const score = matchingService.calculateCompatibility(profile1 as any, profile2 as any);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return lower score for incompatible profiles', () => {
      const profile1 = {
        id: '1',
        religion: 'Hindu',
        caste: 'Brahmin',
        subcaste: 'Iyer',
        education: { degree: 'Masters' },
        location: { city: 'Mumbai' },
        age: 28,
        interests: ['reading'],
      };

      const profile2 = {
        id: '2',
        religion: 'Hindu',
        caste: 'Different',
        subcaste: 'Different',
        education: { degree: 'Bachelors' },
        location: { city: 'Delhi' },
        age: 40,
        interests: ['sports'],
      };

      const score = matchingService.calculateCompatibility(profile1 as any, profile2 as any);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThan(100);
    });
  });

  describe('getMatches', () => {
    it('should return matches for a user', async () => {
      const userId = 'test-user-id';
      const matches = await matchingService.getMatches(userId);
      expect(Array.isArray(matches)).toBe(true);
    });
  });
});
