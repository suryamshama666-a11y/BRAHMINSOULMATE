import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Cache,
  APICache,
  ComponentCache,
  debounce,
  throttle,
  memoize,
  measurePerformance,
  VirtualScroll,
  ImageOptimizer,
  apiCache,
  componentCache,
  profileCache,
} from '../performance';

describe('Performance Optimization Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Cache', () => {
    let cache: Cache<string>;

    beforeEach(() => {
      cache = new Cache<string>({ ttl: 1000, maxSize: 3, strategy: 'lru' });
    });

    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should delete values', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.delete('key1')).toBe(false);
    });

    it('should clear all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });

    it('should expire values after TTL', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      
      vi.advanceTimersByTime(1500);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should evict oldest entries when cache is full (LRU)', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Access key1 to make it more recently used
      cache.get('key1');
      
      // Add new entry, should evict key2 (least recently used)
      cache.set('key4', 'value4');
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);
    });

    it('should evict oldest entries when cache is full (FIFO)', () => {
      const fifoCache = new Cache<string>({ ttl: 1000, maxSize: 3, strategy: 'fifo' });
      
      fifoCache.set('key1', 'value1');
      fifoCache.set('key2', 'value2');
      fifoCache.set('key3', 'value3');
      
      // Access key1 (should not affect FIFO eviction)
      fifoCache.get('key1');
      
      // Add new entry, should evict key1 (first in)
      fifoCache.set('key4', 'value4');
      
      expect(fifoCache.has('key1')).toBe(false);
      expect(fifoCache.has('key2')).toBe(true);
      expect(fifoCache.has('key3')).toBe(true);
      expect(fifoCache.has('key4')).toBe(true);
    });

    it('should evict least frequently used entries (LFU)', () => {
      const lfuCache = new Cache<string>({ ttl: 1000, maxSize: 3, strategy: 'lfu' });
      
      lfuCache.set('key1', 'value1');
      lfuCache.set('key2', 'value2');
      lfuCache.set('key3', 'value3');
      
      // Access key1 multiple times to increase its frequency
      lfuCache.get('key1');
      lfuCache.get('key1');
      lfuCache.get('key2');
      
      // Add new entry, should evict key3 (least frequently used)
      lfuCache.set('key4', 'value4');
      
      expect(lfuCache.has('key1')).toBe(true);
      expect(lfuCache.has('key2')).toBe(true);
      expect(lfuCache.has('key3')).toBe(false);
      expect(lfuCache.has('key4')).toBe(true);
    });

    it('should return cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.oldestEntry).toBeGreaterThanOrEqual(0);
      expect(stats.averageAccessCount).toBeGreaterThanOrEqual(0);
    });

    it('should return all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const keys = cache.keys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });
  });

  describe('APICache', () => {
    let apiCache: APICache;

    beforeEach(() => {
      apiCache = new APICache({ ttl: 60000, maxSize: 50 });
      global.fetch = vi.fn();
    });

    it('should cache successful API responses', async () => {
      const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const response1 = await apiCache.fetchWithCache('https://api.example.com/data');
      const response2 = await apiCache.fetchWithCache('https://api.example.com/data');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(response1.ok).toBe(true);
      expect(response2.ok).toBe(true);
    });

    it('should not cache failed responses', async () => {
      const mockResponse = new Response('Error', { status: 500 });
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await apiCache.fetchWithCache('https://api.example.com/error');
      await apiCache.fetchWithCache('https://api.example.com/error');

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiCache.fetchWithCache('https://api.example.com/error'))
        .rejects.toThrow('Network error');
    });
  });

  describe('ComponentCache', () => {
    let componentCache: ComponentCache<string>;

    beforeEach(() => {
      componentCache = new ComponentCache<string>({ ttl: 600000, maxSize: 200 });
    });

    it('should notify subscribers when value changes', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = componentCache.subscribe('key1', callback1);
      const unsubscribe2 = componentCache.subscribe('key1', callback2);

      componentCache.set('key1', 'new value');

      expect(callback1).toHaveBeenCalledWith('new value');
      expect(callback2).toHaveBeenCalledWith('new value');

      unsubscribe1();

      componentCache.set('key1', 'another value');

      expect(callback1).not.toHaveBeenCalledWith('another value');
      expect(callback2).toHaveBeenCalledWith('another value');

      unsubscribe2();
    });

    it('should notify subscribers when value is deleted', () => {
      const callback = vi.fn();

      componentCache.set('key1', 'value1');
      componentCache.subscribe('key1', callback);
      componentCache.delete('key1');

      expect(callback).toHaveBeenCalledWith(undefined);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should reset debounce timer on each call', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('first');
      vi.advanceTimersByTime(200);
      debouncedFn('second');
      vi.advanceTimersByTime(200);
      debouncedFn('third');
      vi.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 300);

      throttledFn('first');
      throttledFn('second');
      throttledFn('third');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      vi.advanceTimersByTime(300);

      throttledFn('fourth');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('fourth');
    });

    it('should not execute during throttle period', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 300);

      throttledFn('first');
      vi.advanceTimersByTime(100);
      throttledFn('second');
      vi.advanceTimersByTime(100);
      throttledFn('third');
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');
    });
  });

  describe('memoize', () => {
    it('should memoize function results', () => {
      const mockFn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(mockFn);

      expect(memoizedFn(5)).toBe(10);
      expect(memoizedFn(5)).toBe(10);
      expect(memoizedFn(10)).toBe(20);

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith(5);
      expect(mockFn).toHaveBeenCalledWith(10);
    });

    it('should use custom key generator', () => {
      const mockFn = vi.fn((obj: { id: number; name: string }) => obj.id);
      const memoizedFn = memoize(mockFn, (obj) => obj.id.toString());

      expect(memoizedFn({ id: 1, name: 'first' })).toBe(1);
      expect(memoizedFn({ id: 1, name: 'second' })).toBe(1);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle complex objects as keys', () => {
      const mockFn = vi.fn((obj: any) => JSON.stringify(obj));
      const memoizedFn = memoize(mockFn);

      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2 };

      expect(memoizedFn(obj1)).toBe('{"a":1,"b":2}');
      expect(memoizedFn(obj2)).toBe('{"a":1,"b":2}');

      expect(mockFn).toHaveBeenCalledTimes(2); // Different object references
    });
  });

  describe('measurePerformance', () => {
    it('should measure function execution time', () => {
      const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

      const expensiveFunction = () => {
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
          sum += i;
        }
        return sum;
      };

      const { result, duration } = measurePerformance('expensiveFunction', expensiveFunction);

      expect(typeof result).toBe('number');
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThan(0);
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('expensiveFunction took'));

      mockConsoleLog.mockRestore();
    });
  });

  describe('VirtualScroll', () => {
    let virtualScroll: VirtualScroll;

    beforeEach(() => {
      virtualScroll = new VirtualScroll(50, 300); // 50px item height, 300px container height
    });

    it('should calculate visible range', () => {
      virtualScroll.updateScroll(0); // Scroll to top
      const range = virtualScroll.getVisibleRange(100); // 100 total items

      expect(range.start).toBe(0);
      expect(range.end).toBe(12); // 6 visible + 5 buffer
    });

    it('should handle scroll position', () => {
      virtualScroll.updateScroll(500); // Scroll down 500px
      const range = virtualScroll.getVisibleRange(100);

      expect(range.start).toBe(5); // 500/50 - 5 buffer
      expect(range.end).toBe(17); // 5 + 12 visible
    });

    it('should handle end of list', () => {
      virtualScroll.updateScroll(4500); // Near end of 100 items (5000px total)
      const range = virtualScroll.getVisibleRange(100);

      expect(range.end).toBe(100); // Should not exceed total items
    });

    it('should calculate total height', () => {
      const totalHeight = virtualScroll.getTotalHeight(100);
      expect(totalHeight).toBe(5000); // 100 items * 50px each
    });
  });

  describe('ImageOptimizer', () => {
    it('should generate srcSet for responsive images', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const srcSet = ImageOptimizer.generateSrcSet(originalUrl, [320, 640, 1024]);

      expect(srcSet).toBe('https://example.com/image.jpg?w=320 320w, https://example.com/image.jpg?w=640 640w, https://example.com/image.jpg?w=1024 1024w');
    });

    it('should use default widths if not provided', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const srcSet = ImageOptimizer.generateSrcSet(originalUrl);

      expect(srcSet).toContain('320w');
      expect(srcSet).toContain('640w');
      expect(srcSet).toContain('1024w');
      expect(srcSet).toContain('1920w');
    });
  });

  describe('Default Cache Instances', () => {
    it('should export default cache instances', () => {
      expect(apiCache).toBeInstanceOf(APICache);
      expect(componentCache).toBeInstanceOf(ComponentCache);
      expect(profileCache).toBeInstanceOf(Cache);
    });

    it('should have appropriate default configurations', () => {
      // Test that default caches work
      apiCache.set('test', new Response());
      expect(apiCache.has('test')).toBe(true);

      componentCache.set('test', 'value');
      expect(componentCache.has('test')).toBe(true);

      profileCache.set('test', 'value');
      expect(profileCache.has('test')).toBe(true);
    });
  });
});
