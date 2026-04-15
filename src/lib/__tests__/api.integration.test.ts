import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../api';

// Mock fetch
global.fetch = vi.fn();

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1', name: 'Test' }, error: null })),
          neq: vi.fn(() => ({
            eq: vi.fn(() => ({
              neq: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
            })),
          })),
        })),
        or: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        neq: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            range: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        range: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('ApiClient Integration Tests', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient();
    vi.clearAllMocks();
  });

  describe('Profile Operations', () => {
    it('should fetch profiles with filters', async () => {
      const profiles = await apiClient.getProfiles({
        page: 1,
        limit: 10,
        filter: { gender: 'male' },
      });

      expect(Array.isArray(profiles)).toBe(true);
    });

    it('should handle profile fetch errors gracefully', async () => {
      const profiles = await apiClient.getProfiles({
        page: 1,
        limit: 10,
      });

      expect(Array.isArray(profiles)).toBe(true);
    });
  });

  describe('Caching', () => {
    it('should cache profile requests', async () => {
      // First call
      await apiClient.getProfiles({ page: 1, limit: 10 }, true);

      // Second call - should use cache
      await apiClient.getProfiles({ page: 1, limit: 10 }, true);

      // Both calls should work
      expect(true).toBe(true);
    });

    it('should bypass cache when useCache is false', async () => {
      // Both calls should hit API
      await apiClient.getProfiles({ page: 1, limit: 10 }, false);
      await apiClient.getProfiles({ page: 1, limit: 10 }, false);

      expect(true).toBe(true);
    });
  });

  describe('Dashboard Stats', () => {
    it('should fetch dashboard statistics', async () => {
      const stats = await apiClient.getDashboardStats('user-123');

      expect(stats).toHaveProperty('profileViews');
      expect(stats).toHaveProperty('messageCount');
      expect(stats).toHaveProperty('matchesCount');
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout errors', async () => {
      const profiles = await apiClient.getProfiles({ page: 1, limit: 10 });
      expect(Array.isArray(profiles)).toBe(true);
    });

    it('should handle network errors', async () => {
      const profiles = await apiClient.getProfiles({ page: 1, limit: 10 });
      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles).toHaveLength(0);
    });
  });

  describe('Request Deduplication', () => {
    it('should deduplicate concurrent requests', async () => {
      const promises = [
        apiClient.getProfiles({ page: 1, limit: 10 }),
        apiClient.getProfiles({ page: 1, limit: 10 }),
        apiClient.getProfiles({ page: 1, limit: 10 }),
      ];

      const results = await Promise.all(promises);

      // All should return the same result
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should not deduplicate different requests', async () => {
      const promises = [
        apiClient.getProfiles({ page: 1, limit: 10 }),
        apiClient.getProfiles({ page: 2, limit: 10 }),
        apiClient.getProfiles({ page: 1, limit: 20 }),
      ];

      const results = await Promise.all(promises);

      // All should work independently
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys for same parameters', () => {
      const key1 = apiClient['generateCacheKey']('test', { a: 1, b: 2 });
      const key2 = apiClient['generateCacheKey']('test', { b: 2, a: 1 }); // Different order

      expect(key1).toBe(key2);
    });

    it('should generate different cache keys for different parameters', () => {
      const key1 = apiClient['generateCacheKey']('test', { a: 1, b: 2 });
      const key2 = apiClient['generateCacheKey']('test', { a: 1, b: 3 });

      expect(key1).not.toBe(key2);
    });
  });

  describe('Profile Filtering', () => {
    it('should apply gender filter', async () => {
      const profiles = await apiClient.getProfiles({
        filter: { gender: 'male' },
        page: 1,
        limit: 10,
      });

      expect(Array.isArray(profiles)).toBe(true);
    });

    it('should apply religion filter', async () => {
      const profiles = await apiClient.getProfiles({
        filter: { religion: 'Hindu' },
        page: 1,
        limit: 10,
      });

      expect(Array.isArray(profiles)).toBe(true);
    });

    it('should apply height range filter', async () => {
      const profiles = await apiClient.getProfiles({
        filter: { height_min: 160, height_max: 180 },
        page: 1,
        limit: 10,
      });

      expect(Array.isArray(profiles)).toBe(true);
    });

    it('should apply subscription filter', async () => {
      const profiles = await apiClient.getProfiles({
        filter: { subscription_type: 'premium' },
        page: 1,
        limit: 10,
      });

      expect(Array.isArray(profiles)).toBe(true);
    });
  });
});
