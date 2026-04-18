# Type Consolidation Implementation Guide

## Phase 1: Foundation Setup (Week 1)

### Step 1.1: Create Core Type Directory Structure

```bash
mkdir -p src/types/core
mkdir -p src/types/domain
mkdir -p src/types/api
mkdir -p src/types/ui
```

### Step 1.2: Create `src/types/core/common.ts`

This file contains base types used across the application.

```typescript
/**
 * Core Common Types
 * Base types for API responses, errors, and utilities
 */

// Error handling
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class APIError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// API Response wrapper
export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
  count?: number;
  metadata?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// Timestamps
export interface Timestamps {
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Awaitable<T> = T | Promise<T>;
```

### Step 1.3: Create `src/types/core/user.ts`

```typescript
/**
 * Core User Types
 * User, UserProfile, and related types
 */

import { Timestamps } from './common';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface UserProfile extends Timestamps {
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
  location: LocationData | string;
  city?: string;
  state?: string;
  address?: string;
  religion: string;
  caste: string;
  subcaste?: string;
  gotra?: string;
  marital_status?: string;
  date_of_birth?: string;
  height: number;
  education?: ProfileEducation;
  employment?: ProfileEmployment;
  family?: ProfileFamily;
  preferences?: ProfilePreferences;
  horoscope?: ProfileHoroscope;
  subscription_type: string;
  subscription_status?: string;
  subscription_expiry?: string;
  interests: string[];
  languages: string[];
  verified: boolean;
  last_active?: string;
  profile_picture?: string;
  occupation?: string;
  profession?: string;
  role?: string;
  privacy_settings?: ProfilePrivacySettings;
  account_status?: 'active' | 'inactive' | 'suspended';
  profile_completion?: number;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_active?: boolean;
  is_banned?: boolean;
  last_seen_at?: string;
  [key: string]: unknown;
}

export interface LocationData {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
}

export interface ProfileEducation {
  level: string;
  field: string;
  institution: string;
  year_completed?: number;
}

export interface ProfileEmployment {
  profession: string;
  company: string;
  position: string;
  income_range: string;
  work_location?: string;
}

export interface ProfileFamily {
  father_occupation?: string;
  mother_occupation?: string;
  siblings?: number;
  family_type?: string;
  family_values?: string;
  about_family?: string;
  community?: string;
}

export interface ProfilePreferences {
  age_range?: { min: number; max: number };
  height_range?: { min: number; max: number };
  location_preference?: string[];
  education_preference?: string[];
  occupation_preference?: string[];
  caste_preference?: string[];
  marital_status_preference?: string[];
}

export interface ProfileHoroscope {
  birth_time?: string;
  birth_place?: string;
  moon_sign?: string;
  sun_sign?: string;
  nakshatra?: string;
  rashi?: string;
  charan?: string;
  gan?: string;
  nadi?: string;
  devak?: string;
  manglik?: boolean;
  horoscope_image?: string;
  birth_date?: string;
}

export interface ProfilePrivacySettings {
  show_online_status?: boolean;
  show_profile_to?: 'all' | 'matches' | 'none';
  show_photos_to?: 'all' | 'matches' | 'none';
  show_contact_info_to?: 'all' | 'matches' | 'none';
  show_last_active?: boolean;
  show_profile_views?: boolean;
}

// Type guards
export const isUserProfile = (obj: unknown): obj is UserProfile => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'user_id' in obj;
};

export const isUser = (obj: unknown): obj is User => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'email' in obj;
};
```

### Step 1.4: Create `src/types/core/auth.ts`

```typescript
/**
 * Core Authentication Types
 * Auth context, session, and related types
 */

import { User, UserProfile } from './user';
import { UserSubscription } from '../domain/payment';
import { AuthError } from '@supabase/supabase-js';

export interface Session {
  user: User;
  access_token: string;
  expires_at: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, options?: { firstName?: string; lastName?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  upgradeSubscription: (planId: string) => Promise<void>;
  setNameVisibility: (visible: boolean) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  updateLastActive: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}
```

### Step 1.5: Create `src/types/core/context.ts`

```typescript
/**
 * Core Context Types
 * Theme, Chat, and other context types
 */

import { Conversation } from '../domain/messaging';
import { Notification } from '../domain/notification';
import { UserProfile } from './user';

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export interface ChatContextType {
  conversations: Conversation[];
  contacts: {
    id: string;
    name: string;
    profile_image?: string;
    status: 'online' | 'offline';
  }[];
  isLoading: boolean;
  isLoadingContacts: boolean;
  error: Error | null;
  totalUnread: number;
  refreshConversations: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  getOrCreateConversation: (partnerId: string) => Promise<Conversation>;
}
```

### Step 1.6: Update `src/types/index.ts`

Replace the entire file with re-exports from new structure:

```typescript
/**
 * Main Type Exports
 * Re-exports all types from the new consolidated structure
 */

// Core types
export * from './core/common';
export * from './core/user';
export * from './core/auth';
export * from './core/context';

// Domain types
export * from './domain/messaging';
export * from './domain/matching';
export * from './domain/notification';
export * from './domain/payment';
export * from './domain/profile';
export * from './domain/events';
export * from './domain/vdates';
export * from './domain/forum';
export * from './domain/blog';
export * from './domain/horoscope';
export * from './domain/social';
export * from './domain/verification';
export * from './domain/media';
export * from './domain/stories';
export * from './domain/interactions';

// API types
export * from './api/requests';
export * from './api/responses';
export * from './api/filters';

// UI types
export * from './ui/props';

// Database types (auto-generated)
export * from './database';
export * from './supabase';
```

---

## Phase 2: Domain Types (Week 2)

### Step 2.1: Create `src/types/domain/messaging.ts`

```typescript
/**
 * Messaging Domain Types
 * Message, Conversation, and reaction types
 */

import { UserProfile } from '../core/user';
import { Timestamps } from '../core/common';

export interface Message extends Timestamps {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string | null;
  read_at?: string | null;
  status?: 'sent' | 'delivered' | 'read';
}

export interface MessageReaction {
  id: string;
  emoji: string;
  count: number;
  users?: string[];
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  user_ids: string[];
  hasUserReacted?: boolean;
}

export interface EnhancedMessage extends Message {
  reactions?: Record<string, ReactionSummary>;
  is_own?: boolean;
}

export interface MessageWithReactions extends Message {
  reactions?: MessageReaction[];
}

export interface Conversation extends Timestamps {
  id: string;
  // Legacy schema support
  user1_id?: string;
  user2_id?: string;
  // New schema support
  user_id?: string;
  partner_id?: string;
  partner_name?: string;
  partner_avatar?: string | null;
  // Common fields
  last_message_id?: string;
  last_message_content?: string;
  last_message?: string | null;
  last_message_time?: string;
  last_message_at?: string | null;
  unread_count?: number;
  totalUnread?: number;
  partner_profile?: UserProfile;
}

// Type guards
export const isMessage = (obj: unknown): obj is Message => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'sender_id' in obj &&
    'receiver_id' in obj
  );
};

export const isConversation = (obj: unknown): obj is Conversation => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    ('user_id' in obj || 'user1_id' in obj)
  );
};
```

### Step 2.2: Create `src/types/domain/matching.ts`

```typescript
/**
 * Matching Domain Types
 * Match, Interest, Compatibility, and related types
 */

import { UserProfile } from '../core/user';
import { Timestamps } from '../core/common';
import { Database } from '../supabase';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type MatchRow = Database['public']['Tables']['matches']['Row'];

export interface Match extends Timestamps {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  match_percentage?: number;
  user_profile?: UserProfile;
}

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
}

export interface MatchWithScore extends MatchRow {
  compatibility_score: number;
  factors?: CompatibilityFactors;
  profile?: ProfileRow;
}

export interface ProfileWithMatch extends ProfileRow {
  compatibility_score?: number;
  match_status?: 'pending' | 'accepted' | 'declined';
  is_favorite?: boolean;
  view_count?: number;
}

export type InterestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface Interest extends MatchRow {
  sender_id: string;
  receiver_id: string;
  status: InterestStatus;
  sender?: ProfileRow;
  receiver?: ProfileRow;
}

export interface Connection extends Timestamps {
  user1_id: string;
  user2_id: string;
  status: 'connected' | 'blocked';
  user1?: ProfileRow;
  user2?: ProfileRow;
}

export interface Favorite extends Timestamps {
  id: string;
  user_id: string;
  profile_id: string;
  profile?: ProfileRow;
}

export interface SearchResult extends ProfileRow {
  compatibility_score?: number;
  match_percentage?: number;
  is_favorite?: boolean;
  is_viewed?: boolean;
  is_interested?: boolean;
}

export interface MatchingResult {
  matches: MatchWithScore[];
  total: number;
  hasMore: boolean;
}

export interface ProfileComparison {
  profile1: ProfileRow;
  profile2: ProfileRow;
  compatibilityScore: number;
  factors: CompatibilityFactors;
  matchPercentage: number;
}

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

// Type guards
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

export function isInterest(obj: unknown): obj is Interest {
  return (
    isMatch(obj) &&
    'status' in obj &&
    ['pending', 'accepted', 'declined', 'withdrawn'].includes(
      (obj as Record<string, unknown>).status as string
    )
  );
}

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
```

### Step 2.3: Create `src/types/domain/notification.ts`

```typescript
/**
 * Notification Domain Types
 * Notification and preferences types
 */

import { Timestamps } from '../core/common';

export interface Notification extends Timestamps {
  id: string;
  user_id: string;
  type: 'match' | 'message' | 'profile_view' | 'interest' | 'system' | 'new_message' | 'interest_received' | 'interest_accepted' | 'profile_view' | 'subscription_activated';
  title: string;
  message: string;
  read: boolean;
  timestamp?: string;
  action_url?: string | null;
  sender_id?: string | null;
  [key: string]: unknown;
}

export interface NotificationPreferences extends Timestamps {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  new_messages: boolean;
  new_interests: boolean;
  profile_views: boolean;
  marketing_emails: boolean;
  email_enabled?: boolean;
  sms_enabled?: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

// Type guards
export const isNotification = (obj: unknown): obj is Notification => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'type' in obj
  );
};

export const isNotificationPreferences = (obj: unknown): obj is NotificationPreferences => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'email_notifications' in obj
  );
};
```

### Step 2.4: Create `src/types/domain/payment.ts`

```typescript
/**
 * Payment Domain Types
 * Payment, Subscription, and plan types
 */

import { Timestamps } from '../core/common';

export interface SubscriptionPlan extends Timestamps {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  is_popular?: boolean;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

export interface UserSubscription extends Timestamps {
  id: string;
  user_id: string;
  plan_id?: string;
  plan?: string;
  status: SubscriptionStatus;
  start_date?: string;
  end_date?: string;
  auto_renewal?: boolean;
  payment_id?: string;
}

export interface Payment extends Timestamps {
  id: string;
  user_id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  currency: string;
  plan: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}

export interface RazorpayOrderData {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: 'created' | 'paid' | 'attempted';
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface OrderCreationRequest {
  plan_id: string;
  currency: string;
}

export interface OrderCreationResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface ActivityLimits {
  profile_views: number;
  interests_sent: number;
  messages: number;
}

export type PlanLimitsMap = Record<string, ActivityLimits>;

export class PaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

// Type guards
export function isRazorpayPaymentResponse(
  obj: unknown
): obj is RazorpayPaymentResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'razorpay_payment_id' in obj &&
    'razorpay_order_id' in obj &&
    'razorpay_signature' in obj &&
    typeof (obj as Record<string, unknown>).razorpay_payment_id === 'string' &&
    typeof (obj as Record<string, unknown>).razorpay_order_id === 'string' &&
    typeof (obj as Record<string, unknown>).razorpay_signature === 'string'
  );
}

export function isSubscriptionPlan(obj: unknown): obj is SubscriptionPlan {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'price' in obj &&
    'duration' in obj &&
    'features' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).name === 'string' &&
    typeof (obj as Record<string, unknown>).price === 'number' &&
    typeof (obj as Record<string, unknown>).duration === 'number' &&
    Array.isArray((obj as Record<string, unknown>).features)
  );
}
```

---

## Phase 3: API & UI Types (Week 2-3)

### Step 3.1: Create `src/types/api/requests.ts`

```typescript
/**
 * API Request Types
 * Request payloads for API endpoints
 */

import { UserProfile } from '../core/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  agree_terms: boolean;
}

export interface AuthResponse {
  user: { id: string; email: string };
  session: { access_token: string; expires_at: number };
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  agree_terms: boolean;
}

export interface ProfileFormData extends Partial<UserProfile> {
  // Additional fields specific to forms
}
```

### Step 3.2: Create `src/types/api/filters.ts`

```typescript
/**
 * API Filter Types
 * Search and filter parameters
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

export interface AdvancedSearchFilters {
  ageRange: [number, number];
  heightRange: [number, number];
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

export interface ProfileSearchParams {
  gender?: 'male' | 'female';
  min_age?: number;
  max_age?: number;
  city?: string;
  religion?: string;
  limit?: number;
  offset?: number;
}

// Type guards
export function isSearchFilters(obj: unknown): obj is SearchFilters {
  return typeof obj === 'object' && obj !== null;
}
```

### Step 3.3: Create `src/types/ui/props.ts`

```typescript
/**
 * UI Component Prop Types
 * Props for reusable UI components
 */

import { UserProfile } from '../core/user';

export interface ProfileCardProps {
  profile: UserProfile;
  onClick?: (profile: UserProfile) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl';
  ripple?: boolean;
}
```

---

## Phase 4: Service Updates (Week 3)

### Step 4.1: Update Service Imports

For each service file, replace inline type definitions with imports from consolidated types.

**Example: `src/services/api/messages.service.ts`**

```typescript
// OLD
import { Database } from '@/types/supabase';

type MessageRow = Database['public']['Tables']['messages']['Row'];

export interface Message extends MessageRow {
  sender?: unknown;
  receiver?: unknown;
}

// NEW
import { Message } from '@/types/domain/messaging';
import { Database } from '@/types/supabase';

type MessageRow = Database['public']['Tables']['messages']['Row'];

// Message type is now imported from consolidated types
```

### Step 4.2: Update Hook Imports

For each hook file, replace inline type definitions with imports.

**Example: `src/hooks/useMessages.ts`**

```typescript
// OLD
import { Message } from '@/services/api/messages.service';

// NEW
import { Message } from '@/types/domain/messaging';
```

---

## Phase 5: Verification & Testing (Week 4)

### Step 5.1: Run Type Checking

```bash
npm run typecheck
```

Expected output: No errors

### Step 5.2: Run Tests

```bash
npm run test
```

Expected output: All tests pass

### Step 5.3: Check for Circular Dependencies

```bash
npm run check-circular-deps
```

Expected output: No circular dependencies

### Step 5.4: Verify Imports

Search for any remaining imports from old locations:

```bash
grep -r "from '@/types/database'" src/
grep -r "from '@/services/api/.*\.service'" src/hooks/
grep -r "from '@/services/.*Service'" src/
```

Expected output: No matches

---

## Rollback Plan

If issues arise during implementation:

1. **Keep old type files** temporarily with deprecation warnings
2. **Create type aliases** for backward compatibility
3. **Update imports gradually** rather than all at once
4. **Run tests after each file update** to catch issues early

Example deprecation warning:

```typescript
/**
 * @deprecated Use UserProfile from '@/types/core/user' instead
 */
export type DatabaseProfile = UserProfile;
```

---

## Documentation Updates

After consolidation, update:

1. **Type System Documentation** - Document new type hierarchy
2. **Developer Guide** - Update import examples
3. **API Documentation** - Update type references
4. **Contributing Guide** - Add guidelines for new types

---

## Success Criteria

- [ ] All type files created in new structure
- [ ] All duplicate types consolidated
- [ ] All imports updated across codebase
- [ ] TypeScript compilation succeeds
- [ ] All tests pass
- [ ] No circular type dependencies
- [ ] No unused type definitions
- [ ] Type guards added for runtime validation
- [ ] Documentation updated
- [ ] Code review approved

