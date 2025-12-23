import { describe, it, expect } from 'vitest';

// Simple test for Community page existence
describe('Community Page', () => {
  it('Community module can be imported', async () => {
    const module = await import('../Community');
    expect(module.default).toBeDefined();
  });
});
