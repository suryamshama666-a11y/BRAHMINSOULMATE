import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithTimeout } from '../fetchWithTimeout';

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully fetch data within timeout', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)
    );

    const result = await fetchWithTimeout('https://api.example.com/data', {}, 5000);
    expect(result.ok).toBe(true);
    const data = await result.json();
    expect(data).toEqual({ data: 'test' });
  });

  it('should timeout if request takes too long', async () => {
    global.fetch = vi.fn((): Promise<Response> =>
      new Promise((resolve) => {
        setTimeout(() => resolve({} as Response), 10000);
      })
    );

    const promise = fetchWithTimeout('https://api.example.com/slow', {}, 100);
    
    // Advance timers to trigger the timeout
    vi.advanceTimersByTime(150);
    
    await expect(promise).rejects.toThrow('Request timeout');
  }, 5000);

  it('should handle fetch errors', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    await expect(
      fetchWithTimeout('https://api.example.com/error', {}, 5000)
    ).rejects.toThrow('Network error');
  });
});
