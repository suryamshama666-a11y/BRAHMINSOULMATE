# Type Consolidation - Code Examples

This document provides concrete before/after examples for the type consolidation process.

---

## Example 1: Profile Type Consolidation

### BEFORE: 5 Different Profile Types

**src/types/index.ts**
```typescript
export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  // ... 50+ fields
}
```

**src/types/database.ts**
```typescript
export interface DatabaseProfile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  age: number;
  gender: string;
  // ... 50+ fields
}
```

**backend/src/types/domain.ts**
```typescript
export interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  gender?: string;
  // ... 40+ fields
}
```

**src/hooks/useProfile.ts**
```typescript
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  // ... simplified fields
}
```

**src/services/profileService.ts**
```typescript
type Profile = Database['public']['Tables']['profiles']['Row'];
```

### AFTER: 1 Canonical Profile Type

**src/types/entities/profile.ts**
```typescript
/**
 * Main UserProfile type - canonical definition
 * Single source of truth for all profile-related types
 * 
 * Replaces:
 * - UserProfile (src/types/index.ts)
 * - DatabaseProfile (src/types/database.ts)
 * - ProfileData (backend/src/types/domain.ts)
 * - Profile (src/hooks/useProfile.ts)
 * - Profile (src/services/profileService.ts)
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
  interests: string[];
  languages: string[];
  verified: boolean;
  created_at: string;
  updated_at?: string;
  last_active?: string;
  profile_picture?: string;
  profile_picture_url?: string;
  role?: string;
  privacy_settings?: ProfilePrivacySettings;
  account_status?: 'active' | 'inactive' | 'suspended';
  profile_completion?: number;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_active?: boolean;
  is_banned?: boolean;
  deleted_at?: string;
  last_seen_at?: string;
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

### Import Updates

**src/hooks/useProfile.ts - BEFORE**
```typescript
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  // ...
};
```

**src/hooks/useProfile.ts - AFTER**
```typescript
import { UserProfile } from '@/types/entities';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // ...
};
```

**src/services/profileService.ts - BEFORE**
```typescript
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfileService {
  async getProfile(id: string): Promise<Profile> {
    // ...
  }
}
```

**src/services/profileService.ts - AFTER**
```typescript
import { UserProfile } from '@/types/entities';

export class ProfileService {
  async getProfile(id: string): Promise<UserProfile> {
    // ...
  }
}
```

---

## Example 2: Message Type Consolidation

### BEFORE: 7 Different Message Types

**src/types/index.ts**
```typescript
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface MessageWithReactions extends Message {
  reactions?: MessageReaction[];
}

export interface EnhancedMessage extends Message {
  reactions?: Record<string, ReactionSummary>;
  is_own?: boolean;
}
```

**src/hooks/useRealTimeMessages.ts**
```typescript
interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}
```

**src/hooks/useEnhancedMessages.ts**
```typescript
export interface EnhancedMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  reactions?: Record<string, ReactionSummary>;
  is_own?: boolean;
}
```

**src/hooks/messaging/types.ts**
```typescript
export interface RealTimeMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}
```

**src/services/api/messages.service.ts**
```typescript
export interface Message extends MessageRow {
  sender?: unknown;
  receiver?: unknown;
}
```

### AFTER: 1 Canonical Message Type with Variants

**src/types/entities/message.ts**
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
 * Replaces all other Message definitions
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
```

### Import Updates

**src/hooks/useRealTimeMessages.ts - BEFORE**
```typescript
interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface UseRealTimeMessagesProps {
  userId: string;
  conversationUserId?: string;
  onMessageReceived?: (message: Message) => void;
}
```

**src/hooks/useRealTimeMessages.ts - AFTER**
```typescript
import { Message, RealTimeMessage } from '@/types/entities';
import { UseRealTimeMessagesProps } from '@/types/hooks';

// No need to define Message here - import from types
```

**src/hooks/useEnhancedMessages.ts - BEFORE**
```typescript
export interface EnhancedMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  reactions?: Record<string, ReactionSummary>;
  is_own?: boolean;
}

export const useEnhancedMessages = () => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  // ...
};
```

**src/hooks/useEnhancedMessages.ts - AFTER**
```typescript
import { EnhancedMessage } from '@/types/entities';

export const useEnhancedMessages = () => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  // ...
};
```

---

## Example 3: Notification Type Consolidation

### BEFORE: 3 Different Notification Types

**src/types/index.ts**
```typescript
export interface Notification {
  id: string;
  user_id: string;
  type: 'match' | 'message' | 'profile_view' | 'interest' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp?: string;
  created_at: string;
}
```

**src/hooks/useNotifications.ts**
```typescript
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
```

**src/services/api/notifications.service.ts**
```typescript
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  content?: string;
  read: boolean;
  created_at: string;
}
```

### AFTER: 1 Canonical Notification Type

**src/types/entities/notification.ts**
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
 * Replaces all other Notification definitions
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

### Import Updates

**src/hooks/useNotifications.ts - BEFORE**
```typescript
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // ...
};
```

**src/hooks/useNotifications.ts - AFTER**
```typescript
import { Notification } from '@/types/entities';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // ...
};
```

---

## Example 4: Subscription Type Consolidation

### BEFORE: 3 Different Subscription Types

**src/types/index.ts**
```typescript
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
}
```

**src/hooks/useSubscription.ts**
```typescript
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  is_popular?: boolean;
}

export interface UserSubscription {
  subscribed: boolean;
  subscription_type: string;
  subscription_expiry?: string;
}
```

**src/services/api/payments.service.ts**
```typescript
export interface Subscription {
  id: string;
  user_id: string;
  plan_id?: string;
  plan?: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date?: string;
  end_date?: string;
  auto_renewal?: boolean;
  payment_id?: string;
}
```

### AFTER: 1 Canonical Subscription Type

**src/types/entities/subscription.ts**
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
 * Replaces all other Subscription definitions
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
  subscribed?: boolean;
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

### Import Updates

**src/hooks/useSubscription.ts - BEFORE**
```typescript
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  is_popular?: boolean;
}

export interface UserSubscription {
  subscribed: boolean;
  subscription_type: string;
  subscription_expiry?: string;
}

export const useSubscription = () => {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  // ...
};
```

**src/hooks/useSubscription.ts - AFTER**
```typescript
import { SubscriptionPlan, UserSubscription } from '@/types/entities';

export const useSubscription = () => {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  // ...
};
```

---

## Example 5: Inline Type Migration

### BEFORE: Inline Type in Hook

**src/hooks/useAdvancedSearch.ts**
```typescript
export interface SearchFilters {
  ageRange: [number, number];
  heightRange: [number, number];
  location?: string;
  religion?: string;
  caste?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
}

export interface CompatibilityScore {
  user_id: string;
  overall_score: number;
  age_match: number;
  height_match: number;
  location_match: number;
  education_match: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  created_at: string;
}

export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    ageRange: [18, 65],
    heightRange: [140, 200],
  });
  // ...
};
```

### AFTER: Types Moved to Centralized Location

**src/types/hooks/search.ts**
```typescript
/**
 * Search hook types - consolidated from inline definitions
 */

export interface SearchFilters {
  ageRange: [number, number];
  heightRange: [number, number];
  location?: string;
  religion?: string;
  caste?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
}

export interface CompatibilityScore {
  user_id: string;
  overall_score: number;
  age_match: number;
  height_match: number;
  location_match: number;
  education_match: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  created_at: string;
}
```

**src/hooks/useAdvancedSearch.ts**
```typescript
import { SearchFilters, CompatibilityScore, SavedSearch } from '@/types/hooks';

export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    ageRange: [18, 65],
    heightRange: [140, 200],
  });
  // ...
};
```

---

## Example 6: Main Export File Update

### BEFORE: Scattered Exports

**src/types/index.ts**
```typescript
// Re-export all types from types/index.ts for backwards compatibility
export * from './types/index';

// Also has inline definitions
export interface UserProfile { ... }
export interface Message { ... }
export interface Notification { ... }
// ... 50+ more inline definitions
```

### AFTER: Centralized Exports

**src/types/index.ts**
```typescript
/**
 * Central type export file
 * All types should be imported from here
 * 
 * Organization:
 * - Entity types: Domain models (Profile, Message, etc.)
 * - API types: Request/response types
 * - Hook types: Hook-specific types
 * - Service types: Service-specific types
 * - UI types: Component prop types
 * - Shared types: Frontend/backend shared types
 */

// Entity types - domain models
export * from './entities';

// API types - request/response
export * from './api';

// Hook types - hook-specific
export * from './hooks';

// Service types - service-specific
export * from './services';

// UI types - component props
export * from './ui';

// Shared types - frontend/backend
export * from './shared';

// Keep for backwards compatibility
export * from './database';
export * from './supabase';
export * from './global';
```

**src/types/entities/index.ts**
```typescript
/**
 * Entity type exports
 * Domain models for the application
 */

export * from './profile';
export * from './message';
export * from './notification';
export * from './subscription';
export * from './match';
export * from './interest';
export * from './event';
export * from './vdate';
export * from './forum';
export * from './success-story';
export * from './common';
```

---

## Example 7: Component Type Migration

### BEFORE: Inline Props Type

**src/components/vdates/VideoCall.tsx**
```typescript
interface VideoCallProps {
  roomName: string;
  userName: string;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: object) => JitsiAPI;
  }
}

interface JitsiAPI {
  addListener: (event: string, callback: (data?: { muted?: boolean }) => void) => void;
  executeCommand: (command: string) => void;
  dispose: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({ roomName, userName, onEnd, onError }) => {
  // ...
};
```

### AFTER: Types Moved to Centralized Location

**src/types/ui/video-call.ts**
```typescript
/**
 * Video call component types
 */

export interface VideoCallProps {
  roomName: string;
  userName: string;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface JitsiAPI {
  addListener: (event: string, callback: (data?: { muted?: boolean }) => void) => void;
  executeCommand: (command: string) => void;
  dispose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: object) => JitsiAPI;
  }
}
```

**src/components/vdates/VideoCall.tsx**
```typescript
import { VideoCallProps, JitsiAPI } from '@/types/ui';

export const VideoCall: React.FC<VideoCallProps> = ({ roomName, userName, onEnd, onError }) => {
  // ...
};
```

---

## Summary of Changes

| Category | Before | After | Benefit |
|----------|--------|-------|---------|
| Profile Types | 5 files | 1 file | Single source of truth |
| Message Types | 7 files | 1 file | Consistent definitions |
| Notification Types | 3 files | 1 file | Easier maintenance |
| Subscription Types | 3 files | 1 file | Clear hierarchy |
| Inline Definitions | 50+ | 0 | Better organization |
| Import Locations | 10+ | 1 | Easier discovery |
| Type Reuse | 33% | 95%+ | Better code quality |

