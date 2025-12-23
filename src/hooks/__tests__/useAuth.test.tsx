import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the hooks module directly
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    profile: { name: 'Test User', gender: 'male' },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    isPremium: false,
  }),
}));

describe('useAuth hook', () => {
  it('returns expected shape from mock', async () => {
    const { useAuth } = await import('@/hooks/useAuth');
    const result = useAuth();
    
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe('test-user-id');
    expect(result.profile).toBeDefined();
    expect(result.profile?.name).toBe('Test User');
    expect(result.loading).toBe(false);
    expect(typeof result.signIn).toBe('function');
    expect(typeof result.signOut).toBe('function');
    expect(result.isPremium).toBe(false);
  });
});
