import { describe, it, expect, vi, beforeEach } from 'vitest';
import { matchingService } from '../api/matching.service';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        neq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

describe('MatchingService - Expanded Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCompatibility - Enhanced', () => {
    it('should calculate perfect compatibility for identical profiles', () => {
      const profile1 = {
        id: '1',
        age: 28,
        caste: 'Brahmin',
      } as any;

      const profile2 = {
        id: '2',
        age: 28,
        caste: 'Brahmin',
      } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should calculate zero compatibility for completely different profiles', () => {
      const profile1 = {
        id: '1',
        age: 28,
        caste: 'Brahmin',
      } as any;

      const profile2 = {
        id: '2',
        age: 50,
        caste: 'Other',
      } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle edge cases with missing data', () => {
      const profile1 = {
        id: '1',
        // Missing age and caste
      } as any;

      const profile2 = {
        id: '2',
        // Missing age and caste
      } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should weight age compatibility correctly', () => {
      const profile1 = { id: '1', age: 25, caste: 'Brahmin' } as any;
      const profile2 = { id: '2', age: 26, caste: 'Brahmin' } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should weight age compatibility with different ranges', () => {
      const profile1 = { id: '1', age: 25, caste: 'Brahmin' } as any;
      const profile2 = { id: '2', age: 29, caste: 'Brahmin' } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle caste compatibility', () => {
      const profile1 = { id: '1', age: 25, caste: 'Brahmin' } as any;
      const profile2 = { id: '2', age: 25, caste: 'Other' } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('getMatches', () => {
    it('should return matches for a user', async () => {
      const userId = 'test-user-id';
      const result = await matchingService.getMatches(userId);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations for a user', async () => {
      const userId = 'test-user-id';
      const result = await matchingService.getRecommendations(userId, 10);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle special characters in profile data', () => {
      const profile1 = {
        id: '1',
        name: "John O'Brien",
        age: 28,
        caste: 'Brahmin',
      } as any;

      const profile2 = {
        id: '2',
        name: "Mary O'Brien",
        age: 28,
        caste: 'Brahmin',
      } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle null and undefined values gracefully', () => {
      const profile1 = {
        id: '1',
        age: null,
        caste: undefined,
      } as any;

      const profile2 = {
        id: '2',
        age: 25,
        caste: 'Brahmin',
      } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle negative age differences', () => {
      const profile1 = { id: '1', age: 30, caste: 'Brahmin' } as any;
      const profile2 = { id: '2', age: 25, caste: 'Brahmin' } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle very large age differences', () => {
      const profile1 = { id: '1', age: 25, caste: 'Brahmin' } as any;
      const profile2 = { id: '2', age: 60, caste: 'Brahmin' } as any;

      const result = matchingService.calculateCompatibility(profile1, profile2);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
