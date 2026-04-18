/**
 * Extended Supabase type definitions
 * Provides strongly-typed database row interfaces
 */

import { UserProfile } from './user';

/**
 * Database row types - exactly as stored in Supabase
 */

export interface ProfileRow {
  id: string;
  user_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  age: number;
  gender: string;
  images: string[];
  bio: string;
  phone?: string;
  phone_number?: string;
  email?: string;
  location?: string | Record<string, unknown>;
  city?: string;
  location_city?: string;
  state?: string;
  location_state?: string;
  address?: string;
  religion: string;
  caste: string;
  subcaste?: string;
  gotra?: string;
  marital_status?: string;
  date_of_birth?: string;
  height: number;
  education?: string | Record<string, unknown>;
  education_level?: string;
  employment?: string | Record<string, unknown>;
  family?: string | Record<string, unknown>;
  preferences?: string | Record<string, unknown>;
  horoscope?: string | Record<string, unknown>;
  subscription_type: string;
  subscription_status?: string;
  subscription_expiry?: string;
  interests: string[];
  languages: string[];
  verified: boolean;
  created_at: string;
  updated_at?: string;
  last_active?: string;
  last_seen_at?: string;
  profile_picture?: string;
  occupation?: string;
  profession?: string;
  role?: string;
  privacy_settings?: string | Record<string, unknown>;
  account_status?: 'active' | 'inactive' | 'suspended';
  profile_completion?: number;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_active?: boolean;
  is_banned?: boolean;
  deleted_at?: string;
}

export interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string | null;
  created_at: string;
  read_at?: string | null;
  status?: 'sent' | 'delivered' | 'read';
  updated_at?: string;
}

export interface MatchRow {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  status: 'pending' | 'viewed' | 'interested' | 'accepted' | 'declined' | 'withdrawn' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface InterestRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface ProfileViewRow {
  id: string;
  viewer_id: string;
  viewed_profile_id: string;
  created_at: string;
}

export interface ForumPostRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  comments_count?: number;
}

export interface ForumCommentRow {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: 'match' | 'message' | 'profile_view' | 'interest' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp?: string;
  action_url?: string | null;
  sender_id?: string | null;
  created_at: string;
}

export interface VDateRow {
  id: string;
  user_id_1: string;
  user_id_2: string;
  scheduled_date: string;
  scheduled_time: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  feedback_1?: string | Record<string, unknown>;
  feedback_2?: string | Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SavedSearchRow {
  id: string;
  user_id: string;
  search_name: string;
  filters: Record<string, unknown>;
  created_at: string;
  last_used: string;
}

export interface AnalyticsEventRow {
  id: string;
  user_id?: string;
  event_name: string;
  properties?: Record<string, unknown>;
  page_path: string;
  session_id: string;
  user_agent: string;
  created_at: string;
}

export interface UserActivityRow {
  id: string;
  user_id: string;
  action: string;
  date: string;
  count: number;
  updated_at?: string;
}

export interface SuccessStoryRow {
  id: string;
  user_id_1: string;
  user_id_2: string;
  user1_id?: string;
  user2_id?: string;
  title: string;
  story: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  updated_at?: string;
}

/**
 * Type guards for runtime type checking
 */

export function isProfileRow(obj: unknown): obj is ProfileRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'name' in obj &&
    'age' in obj &&
    'gender' in obj
  );
}

export function isMessageRow(obj: unknown): obj is MessageRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'sender_id' in obj &&
    'receiver_id' in obj &&
    'content' in obj
  );
}

export function isMatchRow(obj: unknown): obj is MatchRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user1_id' in obj &&
    'user2_id' in obj &&
    'compatibility_score' in obj
  );
}

export function isInterestRow(obj: unknown): obj is InterestRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'sender_id' in obj &&
    'receiver_id' in obj
  );
}

export function isProfileViewRow(obj: unknown): obj is ProfileViewRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'viewer_id' in obj &&
    'viewed_profile_id' in obj
  );
}

export function isNotificationRow(obj: unknown): obj is NotificationRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'type' in obj &&
    'message' in obj
  );
}

export function isVDateRow(obj: unknown): obj is VDateRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id_1' in obj &&
    'user_id_2' in obj &&
    'scheduled_date' in obj
  );
}

export function isSavedSearchRow(obj: unknown): obj is SavedSearchRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'search_name' in obj &&
    'filters' in obj
  );
}

export function isAnalyticsEventRow(obj: unknown): obj is AnalyticsEventRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'event_name' in obj &&
    'session_id' in obj
  );
}

export function isSuccessStoryRow(obj: unknown): obj is SuccessStoryRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    ('user_id_1' in obj || 'user1_id' in obj) &&
    ('user_id_2' in obj || 'user2_id' in obj) &&
    'title' in obj &&
    'story' in obj
  );
}
