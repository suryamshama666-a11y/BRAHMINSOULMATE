import { describe, it, expect } from 'vitest';

// Simple test for ProtectedRoute existence
describe('ProtectedRoute', () => {
  it('ProtectedRoute module can be imported', async () => {
    const module = await import('../ProtectedRoute');
    expect(module.default).toBeDefined();
  });
});
