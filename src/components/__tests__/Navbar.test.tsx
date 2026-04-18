import { describe, it, expect } from 'vitest';

// Simple test for Navbar existence
describe('Navbar', () => {
  it('Navbar module can be imported', async () => {
    const module = await import('../Navbar');
    expect(module.default).toBeDefined();
  });
});
