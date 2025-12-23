import { describe, it, expect } from 'vitest';

// Simple test for ErrorBoundary existence
describe('ErrorBoundary', () => {
  it('ErrorBoundary module can be imported', async () => {
    const module = await import('../ErrorBoundary');
    expect(module.default).toBeDefined();
  });

  it('ErrorBoundary is a class component', async () => {
    const module = await import('../ErrorBoundary');
    expect(typeof module.default).toBe('function');
  });
});
