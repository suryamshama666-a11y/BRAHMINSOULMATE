/**
 * API Services Index
 * Central export point for all API services
 */

export * from './base';
export { default as AuthService } from './auth.service';
export { default as ProfilesService } from './profiles.service';
export { default as StorageService } from './storage.service';
export { default as SearchService } from './search.service';

// Re-export types
export type { UserProfile } from '@/types';
export type { LoginCredentials, RegisterData, AuthResponse } from './auth.service';
export type { SearchFilters, SearchResult } from './search.service';
