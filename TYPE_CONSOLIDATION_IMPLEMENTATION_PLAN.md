# Type Consolidation Implementation Plan

## Overview
This document outlines the step-by-step implementation strategy to consolidate 50+ duplicate type definitions into a centralized, well-organized type system.

---

## Phase 1: Create New Type Structure

### Step 1.1: Create Directory Structure
```bash
src/types/
├── index.ts (main export file)
├── entities/
│   ├── index.ts
│   ├── profile.ts (UserProfile, ProfileLocation, ProfileEducation, etc.)
│   ├── message.ts (Message, MessageReaction, Conversation)
│   ├── notification.ts (Notification, NotificationPreferences)
│   ├── subscription.ts (UserSubscription, SubscriptionPlan)
│   ├── match.ts (Match, MatchProfile)
│   ├── interest.ts (Interest, UserInterest)
│   ├── event.ts (Event, EventRegistration)
│   ├── vdate.ts (VDate, VDateFeedback)
│   ├── forum.ts (ForumPost, ForumComment, ForumReply)
│   ├── success-story.ts (SuccessStory)
│   └── common.ts (shared entity types)
├── api/
│   ├── index.ts
│   ├── requests.ts (LoginCredentials, RegisterData, etc.)
│   ├── responses.ts (APIResponse, APIError)
│   └── search.ts (SearchFilters, SearchResult)
├── ui/
│   ├── index.ts
│   ├── button.ts (ButtonProps)
│   ├── form.ts (FormFieldProps, etc.)
│   └── common.ts (CommonUIProps)
├── hooks/
│   ├── index.ts
│   ├── auth.ts (AuthState, AuthContextType)
│   ├── messages.ts (UseRealTimeMessagesProps, TypingIndicator)
│   ├── search.ts (SearchFilters, CompatibilityScore)
│   └── common.ts (CommonHookTypes)
├── services/
│   ├── index.ts
│   ├── profile.ts (ProfileService types)
│   ├── messaging.ts (MessagingService types)
│   └── common.ts (CommonServiceTypes)
├── shared/
│   ├── index.ts
│   └── domain.ts (types shared between frontend/backend)
├── database.ts (Supabase schema types - keep as is)
├── supabase.ts (Auto-generated - keep as is)
├── global.d.ts (Global declarations - keep as is)
└── auth.ts (Auth-specific - consolidate into entities/auth.ts)
```

### Step 1.2: Create Core Entity Types

**File: src/types/entities/profile.ts**
```typescript
/**
 * Profile entity types - consolidated from 5 duplicate definitions
 * Single source of truth for all profile-related types
 */

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

/**
 * Main UserProfile type - canonical definition
 * Replaces: UserProfile (index.ts), DatabaseProfile (database.ts), ProfileData (backend)
 */
export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
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
  weight?: number;
  complexion?: string;
  education?: ProfileEducation;
  employment?: ProfileEmployment;
  annual_income?: number;
  family?: ProfileFamily;
  preferences?: ProfilePreferences;
  horoscope?: ProfileHoroscope;
  subscription_type: string;
  subscription_status?: string;
  subscription_expiry?: string;
  subscriptionExpiryDate?: string;
  interests: string[];
  languages: string[];
  verified: boolean;
  created_at: string;
  updated_at?: string;
  last_active?: string;
  lastActive?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  profileNameVisibility?: string;
  occupation?: string;
  profession?: string;
  role?: string;
  privacy_settings?: ProfilePrivacySettings;
  account_status?: 'active' | 'inactive' | 'suspended';
  profile_completion?: number;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_active?: boolean;
  is_banned?: boolean;
  deleted_at?: string;
  last_seen_at?: string;
  location_city?: string;
  location_state?: string;
  education_level?: string;
  unreadMessages?: number;
  [key: string]: unknown;
}

/**
 * Profile for matching calculations - lightweight version
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
  horoscope?: ProfileHoroscope;
  gender?: string;
  manglik_status?: string;
}
```

**File: src/types/entities/message.ts**
```typescript
/**
 * Message entity types - consolidated from 7 duplicate definitions
 * Single source of truth for all message-related types
 */

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

/**
 * Main Message type - canonical definition
 * Replaces: Message (index.ts, hooks, services), DatabaseMessage (database.ts)
 */
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type?: 'text' | 'image' | 'video' | 'audio' | 'file';
  message_type?: string;
  media_url?: string | null;
  attachment_url?: string | null;
  created_at: string;
  read_at?: string | null;
  read?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  updated_at?: string;
  deleted_at?: string | null;
  type?: string;
}

/**
 * Message with reactions - extends base Message
 */
export interface MessageWithReactions extends Message {
  reactions?: MessageReaction[];
}

/**
 * Enhanced message with computed properties
 */
export interface EnhancedMessage extends Message {
  reactions?: Record<string, ReactionSummary>;
  is_own?: boolean;
}

/**
 * Real-time message for WebSocket/subscription
 */
export interface RealTimeMessage extends Message {
  // Inherits all Message properties
}

/**
 * Conversation type - consolidated from 3 duplicate definitions
 * Supports both legacy and new schema
 */
export interface Conversation {
  id: string;
  // Legacy schema
  user1_id?: string;
  user2_id?: string;
  // New schema
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
  created_at: string;
  updated_at?: string;
  partner_profile?: UserProfile;
}
```

**File: src/types/entities/notification.ts**
```typescript
/**
 * Notification entity types - consolidated from 3 duplicate definitions
 * Single source of truth for all notification-related types
 */

export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email_enabled?: boolean;
  email_notifications?: boolean;
  sms_enabled?: boolean;
  push_enabled?: boolean;
  push_notifications?: boolean;
  frequency?: string;
  interest_received?: boolean;
  match_found?: boolean;
  message_received?: boolean;
  new_messages?: boolean;
  new_interests?: boolean;
  profile_views?: boolean;
  subscription_expiry?: boolean;
  event_reminders?: boolean;
  marketing_emails?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Main Notification type - canonical definition
 * Replaces: Notification (index.ts, hooks, services)
 */
export interface Notification {
  id: string;
  user_id: string;
  type: 'match' | 'message' | 'profile_view' | 'interest' | 'system' | 'new_message' | 'interest_received' | 'interest_accepted' | 'subscription_activated';
  title: string;
  message?: string;
  content?: string;
  read: boolean;
  timestamp?: string;
  action_url?: string | null;
  sender_id?: string | null;
  related_user_id?: string | null;
  related_entity_id?: string | null;
  created_at: string;
  read_at?: string | null;
  deleted_at?: string | null;
  [key: string]: unknown;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
}
```

**File: src/types/entities/subscription.ts**
```typescript
/**
 * Subscription entity types - consolidated from 3 duplicate definitions
 * Single source of truth for all subscription-related types
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  is_popular?: boolean;
}

/**
 * Main UserSubscription type - canonical definition
 * Replaces: UserSubscription (index.ts), Subscription (services)
 */
export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id?: string;
  plan?: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date?: string;
  end_date?: string;
  auto_renewal?: boolean;
  payment_id?: string;
  subscription_type?: string;
  subscription_start?: string;
  subscription_end?: string;
  subscription_expiry?: string;
}

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

export interface PaymentPlan {
  price: number;
  duration: number;
  name: string;
}
```

### Step 1.3: Create API Types

**File: src/types/api/responses.ts**
```typescript
/**
 * API response types - consolidated and standardized
 */

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
  count?: number;
}
```

**File: src/types/api/requests.ts**
```typescript
/**
 * API request types - consolidated from service files
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: any; // User from @supabase/supabase-js
  session: any; // Session from @supabase/supabase-js
}
```

### Step 1.4: Create Hook Types

**File: src/types/hooks/auth.ts**
```typescript
/**
 * Auth hook types
 */

import { User, AuthError } from '@supabase/supabase-js';
import { UserProfile, UserSubscription } from '../entities';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  loading: boolean;
  error: AuthError | null;
}

export interface AuthContextType extends AuthState {
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

**File: src/types/hooks/messages.ts**
```typescript
/**
 * Message hook types
 */

import { Message, Conversation } from '../entities';

export interface UseRealTimeMessagesProps {
  userId: string;
  conversationUserId?: string;
  onMessageReceived?: (message: Message) => void;
  onTypingStatusChange?: (status: TypingIndicator) => void;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
}
```

---

## Phase 2: Consolidate Duplicate Types

### Step 2.1: Merge Profile Types

**Actions:**
1. Keep `UserProfile` from `src/types/entities/profile.ts` as canonical
2. Remove `Profile` from `src/hooks/useProfile.ts`
3. Remove `DatabaseProfile` from `src/types/database.ts` (keep DB schema types)
4. Remove `ProfileData` from `backend/src/types/domain.ts`
5. Update all imports to use `UserProfile`

**Files to Update:**
- src/hooks/useProfile.ts
- src/hooks/useProfileSearch.ts
- src/hooks/useProfileInteractions.ts
- src/services/profileService.ts
- src/services/api/profile-views.service.ts
- src/services/api/search.service.ts
- 15+ component files

### Step 2.2: Merge Message Types

**Actions:**
1. Keep `Message` from `src/types/entities/message.ts` as canonical
2. Remove `Message` from `src/hooks/useRealTimeMessages.ts`
3. Remove `EnhancedMessage` from `src/hooks/useEnhancedMessages.ts`
4. Remove `RealTimeMessage` from `src/hooks/messaging/types.ts`
5. Remove `Message` from `src/services/api/messages.service.ts`
6. Update all imports

**Files to Update:**
- src/hooks/useRealTimeMessages.ts
- src/hooks/useEnhancedMessages.ts
- src/hooks/messaging/types.ts
- src/services/messagingService.ts
- src/services/api/messages.service.ts
- src/features/messages/

### Step 2.3: Merge Notification Types

**Actions:**
1. Keep `Notification` from `src/types/entities/notification.ts` as canonical
2. Remove `Notification` from `src/hooks/useNotifications.ts`
3. Remove `Notification` from `src/services/api/notifications.service.ts`
4. Update all imports

**Files to Update:**
- src/hooks/useNotifications.ts
- src/services/notificationService.ts
- src/services/api/notifications.service.ts
- src/contexts/NotificationContext.tsx

### Step 2.4: Merge Conversation Types

**Actions:**
1. Keep `Conversation` from `src/types/entities/message.ts` as canonical
2. Remove `Conversation` from `src/hooks/useEnhancedMessages.ts`
3. Remove `Conversation` from `src/hooks/messaging/types.ts`
4. Update all imports

### Step 2.5: Merge Subscription Types

**Actions:**
1. Keep `UserSubscription` and `SubscriptionPlan` from `src/types/entities/subscription.ts` as canonical
2. Remove `SubscriptionPlan` and `UserSubscription` from `src/hooks/useSubscription.ts`
3. Remove `Subscription` from `src/services/api/payments.service.ts`
4. Update all imports

---

## Phase 3: Migrate Inline Types

### Step 3.1: Migrate Hook Inline Types

**File: src/types/hooks/verification.ts**
```typescript
export interface VerificationRequest {
  id: string;
  user_id: string;
  // ... other fields
}
```

**File: src/types/hooks/success-stories.ts**
```typescript
export interface SuccessStory {
  // ... fields
}
```

**File: src/types/hooks/search.ts**
```typescript
export interface SearchFilters {
  age?: { min?: number; max?: number };
  height?: { min?: number; max?: number };
  // ... other fields
}

export interface CompatibilityScore {
  user_id: string;
  overall_score: number;
  // ... other fields
}

export interface SavedSearch {
  id: string;
  name: string;
  // ... other fields
}
```

**File: src/types/hooks/admin.ts**
```typescript
export interface AdminRole {
  role: string;
  permissions: string[];
}

export interface AdminLog {
  id: string;
  action: string;
  // ... other fields
}
```

### Step 3.2: Migrate Service Inline Types

**File: src/types/services/verification.ts**
```typescript
export interface VerificationRequest {
  id: string;
  user_id: string;
  // ... fields
}
```

**File: src/types/services/vdates.ts**
```typescript
export interface VDate {
  id: string;
  user_id_1: string;
  // ... fields
}

export interface VDateFeedback {
  rating: number;
  feedback: string;
}
```

**File: src/types/services/horoscope.ts**
```typescript
export interface Horoscope {
  id: string;
  user_id: string;
  // ... fields
}

export interface HoroscopeCompatibility {
  score: number;
  factors: Record<string, number>;
}
```

### Step 3.3: Migrate Component Inline Types

**File: src/types/ui/video-call.ts**
```typescript
export interface VideoCallProps {
  roomName: string;
  userName: string;
  // ... other fields
}

export interface JitsiAPI {
  addListener: (event: string, callback: (data?: { muted?: boolean }) => void) => void;
  executeCommand: (command: string) => void;
  // ... other methods
}
```

---

## Phase 4: Update Main Export File

**File: src/types/index.ts**
```typescript
/**
 * Central type export file
 * All types should be imported from here
 */

// Entity types
export * from './entities';

// API types
export * from './api';

// Hook types
export * from './hooks';

// Service types
export * from './services';

// UI types
export * from './ui';

// Shared types
export * from './shared';

// Keep for backwards compatibility
export * from './database';
export * from './supabase';
export * from './global';
```

---

## Phase 5: Update All Imports

### Step 5.1: Create Import Update Script

```bash
# Find all files importing from old locations
grep -r "from '@/types/index'" src/
grep -r "from '@/types/auth'" src/
grep -r "from '@/types/database'" src/

# Update imports to use new structure
# Example: src/hooks/useProfile.ts
# OLD: import { Profile } from '@/hooks/useProfile'
# NEW: import { UserProfile } from '@/types/entities'
```

### Step 5.2: Update Hook Imports

**Example: src/hooks/useProfile.ts**
```typescript
// OLD
export interface Profile { ... }

// NEW
import { UserProfile } from '@/types/entities';
export const useProfile = () => {
  // Use UserProfile instead of Profile
};
```

### Step 5.3: Update Service Imports

**Example: src/services/profileService.ts**
```typescript
// OLD
type Profile = Database['public']['Tables']['profiles']['Row'];

// NEW
import { UserProfile } from '@/types/entities';
export class ProfileService {
  // Use UserProfile
}
```

### Step 5.4: Update Component Imports

**Example: src/components/ProfileCard.tsx**
```typescript
// OLD
import { UserProfile } from '@/types';

// NEW
import { UserProfile } from '@/types/entities';
```

---

## Phase 6: Verification & Testing

### Step 6.1: Run Type Checking
```bash
npm run typecheck
```

### Step 6.2: Run Tests
```bash
npm run test
npm run test:e2e
```

### Step 6.3: Build Verification
```bash
npm run build
```

### Step 6.4: Manual Testing
- [ ] Test authentication flow
- [ ] Test profile viewing
- [ ] Test messaging
- [ ] Test notifications
- [ ] Test search/filtering

---

## Implementation Checklist

### Phase 1: Structure
- [ ] Create directory structure
- [ ] Create profile.ts with UserProfile
- [ ] Create message.ts with Message, Conversation
- [ ] Create notification.ts with Notification
- [ ] Create subscription.ts with UserSubscription
- [ ] Create API response types
- [ ] Create hook types
- [ ] Create service types

### Phase 2: Consolidation
- [ ] Merge Profile types (5 → 1)
- [ ] Merge Message types (7 → 1)
- [ ] Merge Notification types (3 → 1)
- [ ] Merge Conversation types (3 → 1)
- [ ] Merge Subscription types (3 → 1)
- [ ] Merge Event types (2 → 1)
- [ ] Merge Interest types (4 → 1)

### Phase 3: Migration
- [ ] Migrate hook inline types
- [ ] Migrate service inline types
- [ ] Migrate component inline types
- [ ] Update all imports

### Phase 4: Verification
- [ ] Run typecheck
- [ ] Run tests
- [ ] Run build
- [ ] Manual testing

### Phase 5: Documentation
- [ ] Update CONTRIBUTING.md with type guidelines
- [ ] Create type organization documentation
- [ ] Add examples for new developers

---

## Rollback Plan

If issues arise:
1. Revert to previous commit
2. Identify specific type causing issues
3. Fix in isolation
4. Re-apply changes incrementally

---

## Success Metrics

After consolidation:
- ✅ 0 duplicate type definitions
- ✅ 0 inline type definitions in hooks/services/components
- ✅ 100% type reuse rate
- ✅ All imports from centralized location
- ✅ `npm run typecheck` passes
- ✅ All tests pass
- ✅ Build succeeds

