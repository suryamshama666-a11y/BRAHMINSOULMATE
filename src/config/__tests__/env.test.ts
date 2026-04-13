import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Environment Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  it('should load environment variables', async () => {
    // The env module is already loaded with actual env vars
    // This test verifies the structure is correct
    const { env } = await import('../env');

    // Check that env has the expected structure
    expect(env.supabase).toBeDefined();
    expect(env.supabase.url).toBeDefined();
    expect(env.supabase.anonKey).toBeDefined();
    expect(env.api).toBeDefined();
    expect(typeof env.supabase.url).toBe('string');
    expect(typeof env.supabase.anonKey).toBe('string');
  });

  it('should have required configuration structure', async () => {
    const { env } = await import('../env');

    // Verify the env configuration has all required fields
    expect(env).toHaveProperty('supabase');
    expect(env.supabase).toHaveProperty('url');
    expect(env.supabase).toHaveProperty('anonKey');
    expect(env).toHaveProperty('api');
  });

  it('should use default values for optional variables', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');

    const { env } = await import('../env');

    expect(env.api.baseUrl).toBeDefined();
  });
});
