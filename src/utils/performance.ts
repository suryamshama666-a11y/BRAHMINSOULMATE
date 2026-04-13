/**
 * Advanced caching utilities for performance optimization
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
  strategy?: 'lru' | 'fifo' | 'lfu'; // Cache eviction strategy
}

export class Cache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessCounts = new Map<string, number>();
  private readonly options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      strategy: options.strategy || 'lru',
    };
  }

  set(key: string, value: T): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.options.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      accessCount: 0,
    };

    this.cache.set(key, entry);
    this.accessCounts.set(key, 0);
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.delete(key);
      return undefined;
    }

    // Update access metrics
    entry.timestamp = Date.now();
    entry.accessCount = (this.accessCounts.get(key) || 0) + 1;
    this.accessCounts.set(key, entry.accessCount);

    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    this.accessCounts.delete(key);
    return existed;
  }

  clear(): void {
    this.cache.clear();
    this.accessCounts.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys()).filter(key => !this.isExpired(this.cache.get(key)!));
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.options.ttl;
  }

  private evictOldest(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.options.strategy) {
      case 'lru':
        keyToEvict = this.getLRUKey();
        break;
      case 'fifo':
        keyToEvict = this.getFIFOKey();
        break;
      case 'lfu':
        keyToEvict = this.getLFUKey();
        break;
      default:
        keyToEvict = this.getLRUKey();
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
    }
  }

  private getLRUKey(): string {
    let oldestKey = '';
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private getFIFOKey(): string {
    // Get the first key (oldest insertion)
    return this.cache.keys().next().value || '';
  }

  private getLFUKey(): string {
    let leastUsedKey = '';
    let leastAccessCount = Infinity;

    for (const [key, count] of this.accessCounts) {
      if (count < leastAccessCount) {
        leastAccessCount = count;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  // Get cache statistics
  getStats(): CacheStats {
    const validEntries = Array.from(this.cache.values()).filter(entry => !this.isExpired(entry));
    
    return {
      size: validEntries.length,
      hitRate: this.calculateHitRate(),
      oldestEntry: this.getOldestEntryAge(),
      averageAccessCount: this.getAverageAccessCount(),
    };
  }

  private calculateHitRate(): number {
    // This would need to be implemented with proper hit/miss tracking
    return 0.8; // Placeholder
  }

  private getOldestEntryAge(): number {
    if (this.cache.size === 0) return 0;
    
    const oldestTimestamp = Math.min(...Array.from(this.cache.values()).map(entry => entry.timestamp));
    return Date.now() - oldestTimestamp;
  }

  private getAverageAccessCount(): number {
    if (this.accessCounts.size === 0) return 0;
    
    const totalAccesses = Array.from(this.accessCounts.values()).reduce((sum, count) => sum + count, 0);
    return totalAccesses / this.accessCounts.size;
  }
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
}

interface CacheStats {
  size: number;
  hitRate: number;
  oldestEntry: number;
  averageAccessCount: number;
}

/**
 * Specialized cache for API responses
 */
export class APICache extends Cache<Response> {
  constructor(options: CacheOptions = {}) {
    super({
      ttl: options.ttl || 60 * 1000, // 1 minute default for API calls
      maxSize: options.maxSize || 50,
      strategy: options.strategy || 'lru',
    });
  }

  async fetchWithCache(url: string, options?: RequestInit): Promise<Response> {
    const cacheKey = this.generateCacheKey(url, options);
    
    // Check cache first
    const cachedResponse = this.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse.clone();
    }

    // Fetch from network
    const response = await fetch(url, options);
    
    // Cache successful responses
    if (response.ok) {
      this.set(cacheKey, response.clone());
    }

    return response;
  }

  private generateCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body || '';
    return `${method}:${url}:${JSON.stringify(body)}`;
  }
}

/**
 * Component state cache for React applications
 */
export class ComponentCache<T = any> extends Cache<T> {
  private subscribers = new Map<string, Set<(value: T | undefined) => void>>();

  constructor(options: CacheOptions = {}) {
    super({
      ttl: options.ttl || 10 * 60 * 1000, // 10 minutes default for component state
      maxSize: options.maxSize || 200,
      strategy: options.strategy || 'lru',
    });
  }

  set(key: string, value: T): void {
    super.set(key, value);
    this.notifySubscribers(key, value);
  }

  delete(key: string): boolean {
    const existed = super.delete(key);
    if (existed) {
      this.notifySubscribers(key, undefined);
    }
    return existed;
  }

  subscribe(key: string, callback: (value: T | undefined) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  private notifySubscribers(key: string, value: T | undefined): void {
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(value));
    }
  }
}

/**
 * Utility functions for performance optimization
 */

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit the rate at which a function can fire
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoization function for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function memoizedFunction(...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  } as T;
}

/**
 * Performance measurement utility
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`${name} took ${duration.toFixed(2)}ms`);
  
  return { result, duration };
}

/**
 * Virtual scrolling utilities for large lists
 */
export class VirtualScroll {
  private itemHeight: number;
  private containerHeight: number;
  private scrollTop: number = 0;
  private buffer: number = 5;

  constructor(itemHeight: number, containerHeight: number) {
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
  }

  getVisibleRange(totalItems: number): { start: number; end: number } {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    
    const start = Math.max(0, startIndex - this.buffer);
    const end = Math.min(totalItems, startIndex + visibleCount + this.buffer);
    
    return { start, end };
  }

  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight;
  }

  updateScroll(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }
}

/**
 * Web Worker utilities for heavy computations
 */
export function createWorker(script: string): Worker {
  const blob = new Blob([script], { type: 'application/javascript' });
  const worker = new Worker(URL.createObjectURL(blob));
  return worker;
}

/**
 * Image optimization utilities
 */
export class ImageOptimizer {
  static async compressImage(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'webp' | 'png';
    } = {}
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Calculate dimensions
          let { width, height } = img;
          const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = 'jpeg' } = options;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            `image/${format}`,
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  static generateSrcSet(originalUrl: string, widths: number[] = [320, 640, 1024, 1920]): string {
    return widths
      .map(width => `${originalUrl}?w=${width} ${width}w`)
      .join(', ');
  }
}

// Export default cache instances
export const apiCache = new APICache();
export const componentCache = new ComponentCache();
export const profileCache = new Cache({ ttl: 15 * 60 * 1000, maxSize: 100 }); // 15 minutes for profiles
