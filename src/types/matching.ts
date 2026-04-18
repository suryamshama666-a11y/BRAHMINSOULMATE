/**
 * Matching and profile-related type definitions
 * Provides strong typing for matching algorithms, profiles, and compatibility scoring
 */

import { Database } from './supabase';

/**
 * Profile data from database
 */
import { ProfileRow, MatchRow } from './supabase-extended';
import { UserProfile } from './user';

/**
 * Match with compatibility score and profile
 */
export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'viewed' | 'interested';
  created_at: string;
  updated_at: string;
  match_percentage?: number;
  compatibility_score?: number;
  factors?: CompatibilityFactors;
  user_profile?: UserProfile;
}

/**
 * Compatibility factors breakdown
 */
export interface CompatibilityFactors {
  age: number;
  height: number;
  location: number;
  education: number;
  occupation: number;
  caste: number;
  religion: number;
  gotra: number;
  lifestyle: number;
  values: number;
  horoscope: number;
}

/**
 * Profile with match metadata
 */
export interface ProfileWithMatch extends ProfileRow {
  compatibility_score?: number;
  match_status?: 'pending' | 'accepted' | 'declined';
  is_favorite?: boolean;
  view_count?: number;
}

/**
 * Interest status
 */
export type InterestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

/**
 * Interest record
 */
export interface Interest extends MatchRow {
  sender_id: string;
  receiver_id: string;
  status: InterestStatus;
  created_at: string;
  updated_at: string;
  sender?: ProfileRow;
  receiver?: ProfileRow;
}

/**
 * Connection between two users
 */
export interface Connection {
  user1_id: string;
  user2_id: string;
  status: 'connected' | 'blocked';
  created_at: string;
  user1?: ProfileRow;
  user2?: ProfileRow;
}

/**
 * Favorite profile record
 */
export interface Favorite {
  id: string;
  user_id: string;
  profile_id: string;
  created_at: string;
  profile?: ProfileRow;
}

/**
 * Search filter options
 */
export interface SearchFilters {
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  location?: string;
  state?: string;
  city?: string;
  education?: string;
  occupation?: string;
  caste?: string;
  religion?: string;
  maritalStatus?: string;
  verified?: boolean;
  online?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult extends ProfileRow {
  compatibility_score?: number;
  match_percentage?: number;
  is_favorite?: boolean;
  is_viewed?: boolean;
  is_interested?: boolean;
}

/**
 * Match with compatibility score info
 */
export interface MatchWithScore extends Match {
  compatibility_score: number;
}

/**
 * Matching algorithm result
 */
export interface MatchingResult {
  matches: MatchWithScore[];
  total: number;
  hasMore: boolean;
}

/**
 * Profile comparison data
 */
export interface ProfileComparison {
  profile1: ProfileRow;
  profile2: ProfileRow;
  compatibilityScore: number;
  factors: CompatibilityFactors;
  matchPercentage: number;
}

/**
 * Matching error with context
 */
export class MatchingError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MatchingError';
  }
}

/**
 * Type guard for profile
 */
export function isProfile(obj: unknown): obj is ProfileRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).user_id === 'string'
  );
}

/**
 * Type guard for match
 */
export function isMatch(obj: unknown): obj is MatchRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user1_id' in obj &&
    'user2_id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).user1_id === 'string' &&
    typeof (obj as Record<string, unknown>).user2_id === 'string'
  );
}

/**
 * Type guard for interest
 */
export function isInterest(obj: unknown): obj is Interest {
  return (
    isMatch(obj) &&
    'status' in obj &&
    ['pending', 'accepted', 'declined', 'withdrawn'].includes(
      (obj as any).status as string
    )
  );
}

/**
 * Type guard for search filters
 */
export function isSearchFilters(obj: unknown): obj is SearchFilters {
  return typeof obj === 'object' && obj !== null;
}

/**
 * Type guard for compatibility factors
 */
export function isCompatibilityFactors(obj: unknown): obj is CompatibilityFactors {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'age' in obj &&
    'height' in obj &&
    'location' in obj &&
    typeof (obj as Record<string, unknown>).age === 'number' &&
    typeof (obj as Record<string, unknown>).height === 'number' &&
    typeof (obj as Record<string, unknown>).location === 'number'
  );
}
