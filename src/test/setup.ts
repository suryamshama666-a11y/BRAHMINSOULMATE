import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables before any modules are imported
vi.mock('import.meta.env', () => ({
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  VITE_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_API_BASE_URL: 'http://localhost:3001',
  VITE_API_URL: 'http://localhost:3001/api',
}));

// Set import.meta.env mock values
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    VITE_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_API_BASE_URL: 'http://localhost:3001',
    VITE_API_URL: 'http://localhost:3001/api',
    DEV: true,
    PROD: false,
    MODE: 'test',
  },
  writable: true,
});

// You can extend here with any global mocks if needed (e.g., matchMedia)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

