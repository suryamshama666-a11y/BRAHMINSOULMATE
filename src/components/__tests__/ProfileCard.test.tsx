import { } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Simple test for ProfileCard existence
describe('ProfileCard', () => {
  it('ProfileCard module can be imported', async () => {
    const module = await import('../ProfileCard');
    expect(module.default).toBeDefined();
  });
});
