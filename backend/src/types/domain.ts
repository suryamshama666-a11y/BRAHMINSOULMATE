/**
 * Domain-specific type definitions
 * Provides strong typing for business logic and data models
 */

/**
 * Horoscope details for a user
 */
export interface HoroscopeDetails {
  user_id: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Horoscope data with astrological information
 */
export interface HoroscopeData {
  rashi?: string;
  nakshatra?: string;
  manglik_status?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Profile data for matching and display
 */
export interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  marital_status?: string;
  religion?: string;
  caste?: string;
  subcaste?: string;
  gotra?: string;
  mother_tongue?: string;
  languages_known?: string[];
  education_level?: string;
  education_details?: string;
  occupation?: string;
  company_name?: string;
  annual_income?: number;
  family_type?: string;
  siblings?: number;
  family_location?: string;
  rashi?: string;
  nakshatra?: string;
  manglik?: boolean;
  about_me?: string;
  partner_preferences?: string;
  hobbies?: string[];
  profile_visibility?: string;
  verified?: boolean;
  subscription_type?: string;
  profile_picture_url?: string;
  gallery_images?: string[];
  created_at?: string;
  updated_at?: string;
  last_active?: string;
  profile_completion?: number;
  verification_status?: string;
  community?: string;
  // Private fields (only for authenticated user viewing own profile)
  user_id?: string;
  email?: string;
  phone?: string;
  bio?: string;
  interests?: string[];
  notification_preferences?: Record<string, boolean>;
  account_status?: string;
}

/**
 * Profile for matching calculations
 */
export interface MatchProfile {
  id: string;
  age?: number;
  height?: number;
  city?: string;
  state?: string;
  country?: string;
  education_level?: string;
  gotra?: string;
  rashi?: string;
  horoscope?: HoroscopeData;
  gender?: string;
  manglik_status?: string;
}

/**
 * Circuit breaker status information
 */
export interface CircuitBreakerStatus {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailureTime: number;
  timeSinceLastFailure: number;
  isHealthy: boolean;
}

/**
 * Log entry for structured logging
 */
export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, unknown>;
  correlationId?: string;
}

/**
 * Soft-deletable record interface
 */
export interface SoftDeletable {
  deleted_at?: string | null;
}

/**
 * Payment plan configuration
 */
export interface PaymentPlan {
  price: number;
  duration: number;
  name: string;
}

/**
 * Payment record
 */
export interface Payment {
  id: string;
  user_id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  currency: string;
  plan: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

/**
 * Subscription status
 */
export interface SubscriptionStatus {
  subscription_type?: string;
  subscription_start?: string;
  subscription_end?: string;
  subscription_status?: string;
}

/**
 * Sanitized object (all values are safe strings or primitives)
 */
export type SanitizedValue = string | number | boolean | null | SanitizedObject | SanitizedValue[];

export interface SanitizedObject {
  [key: string]: SanitizedValue;
}
