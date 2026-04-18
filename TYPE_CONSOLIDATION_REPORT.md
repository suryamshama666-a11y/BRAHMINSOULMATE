# Type Definition Consolidation Report

## Executive Summary

This report documents the type definition landscape in the Brahmin Soulmate Connect codebase, identifies duplication and overlap issues, and provides a consolidation plan to improve type safety, maintainability, and developer experience.

**Key Findings:**
- **6+ Profile type variations** across frontend and backend
- **4+ Notification type variations** with inconsistent field naming
- **5+ Message type variations** with different structures
- **4+ Subscription/Plan type variations** duplicated across services
- **3+ Horoscope type variations** with overlapping fields
- **3+ Location type variations** with different structures

---

## 1. Type Inventory

### 1.1 Frontend Types (`src/types/`)

| File | Primary Types | Notes |
|------|---------------|-------|
| `user.ts` | `UserProfile`, `LocationData` | Main user profile type |
| `auth.ts` | `User`, `AuthState`, `AuthContextType` | Auth-related types |
| `chat.ts` | `Message`, `Conversation`, `MessageReaction`, `EnhancedMessage` | Messaging types |
| `matching.ts` | `Match`, `Interest`, `Connection`, `Favorite`, `SearchFilters` | Matching domain types |
| `events.ts` | `Event` | Event type |
| `subscription.ts` | `SubscriptionPlan`, `UserSubscription` | Subscription types |
| `common.ts` | `LoginFormData`, `RegisterFormData`, `ProfileCardProps`, `ButtonProps` | UI/form types |
| `navigation.ts` | `Notification`, `NotificationContextType`, `ThemeContextType` | Navigation types |
| `errors.ts` | `APIError`, `APIResponse`, `SupabaseError`, `NetworkError`, `ValidationError`, `AuthError` | Error handling types |
| `payment.ts` | `RazorpayOrderData`, `PaymentPlan`, `Subscription`, `PaymentVerificationRequest` | Payment types |
| `supabase.ts` | `Database` (auto-generated schema) | Database schema types |
| `supabase-extended.ts` | `ProfileRow`, `MessageRow`, `MatchRow`, `InterestRow`, `NotificationRow`, etc. | Extended row types |
| `database.ts` | `DatabaseProfile`, `DatabaseMessage`, `DatabaseMatch`, etc. | Alternative database types |
| `profile.ts` | `Profile`, `ProfileGender`, `ProfileMaritalStatus`, `BrahminSubcaste`, `Gotra` | Profile domain types |
| `global.d.ts` | Window extensions, global logger | Global declarations |
| `index.ts` | Re-exports from all type files | Aggregator |

### 1.2 Backend Types (`backend/src/types/`)

| File | Primary Types | Notes |
|------|---------------|-------|
| `domain.ts` | `HoroscopeDetails`, `HoroscopeData`, `ProfileData`, `MatchProfile`, `CircuitBreakerStatus`, `LogEntry`, `SoftDeletable`, `PaymentPlan`, `Payment`, `SubscriptionStatus` | Domain types |
| `express.d.ts` | Express Request augmentation | Request extensions |

### 1.3 Inline Types (Components/Services/Hooks)

| Location | Type Name | Purpose |
|----------|-----------|---------|
| `src/hooks/useProfile.ts` | `Profile` | Simplified profile for hook |
| `src/hooks/useNotifications.ts` | `Notification` | Hook-specific notification |
| `src/hooks/useSubscription.ts` | `SubscriptionPlan`, `UserSubscription` | Hook-specific subscription |
| `src/hooks/useRealTimeMessages.ts` | `Message` | Real-time message type |
| `src/hooks/useEnhancedMessages.ts` | `EnhancedMessage` | Enhanced message type |
| `src/features/messages/types.ts` | `Message` | Feature-specific message |
| `src/features/messages/hooks/useMessages.ts` | `Message`, `MessageReaction`, `SendMessageParams` | Feature-specific message |
| `src/services/api/interests.service.ts` | `Interest`, `Connection` | Service-specific interest |
| `src/services/api/horoscope.service.ts` | `Horoscope`, `HoroscopeCompatibility` | Service-specific horoscope |
| `src/services/api/payments.service.ts` | `SubscriptionPlan`, `Payment`, `Subscription` | Service-specific payment |
| `src/services/api/notifications.service.ts` | `Notification`, `NotificationPreferences` | Service-specific notification |
| `src/services/notificationService.ts` | `NotificationPayload`, `NotificationPreferences` | Service-specific notification |
| `src/services/paymentService.ts` | `Subscription` | Service-specific subscription |
| `src/services/matchingService.ts` | `Profile` (type alias) | Service-specific profile |
| `src/data/profileTypes.ts` | `ProfileLocation`, `ProfileEducation`, `ProfileEmployment`, `ProfileFamily`, `ProfileHoroscope`, `ProfilePreference` | Data-layer profile types |
| `src/features/messages/hooks/useConversations.ts` | `PartnerProfile`, `LastMessage` | Feature-specific types |
| `src/hooks/forum/useUserProfile.ts` | `ForumUserProfile` | Forum-specific profile |
| `src/lib/api.ts` | `ProfileFilter` | API filter type |

---

## 2. Duplication Analysis

### 2.1 Profile Types (6+ Variations)

| Type | Location | Key Differences |
|------|----------|-----------------|
| `UserProfile` | `src/types/user.ts` | Comprehensive, includes nested objects for education, employment, family, horoscope, preferences |
| `Profile` | `src/types/profile.ts` | Uses camelCase, references external types from `@/data/profileTypes` |
| `ProfileRow` | `src/types/supabase-extended.ts` | Database row representation, flexible JSON fields |
| `DatabaseProfile` | `src/types/database.ts` | Alternative database representation, typed nested objects |
| `ProfileData` | `backend/src/types/domain.ts` | Backend domain type, similar to UserProfile |
| `Profile` | `src/hooks/useProfile.ts` | Simplified, minimal fields |
| `Profile` | `src/services/matchingService.ts` | Type alias to Database Row |

**Issues:**
- Inconsistent field naming: `profile_picture` vs `profilePicture` vs `profile_picture_url`
- Inconsistent nested object structures: `education` as JSON vs typed object
- Some types have `location` as string, others as object
- `subscription_status` vs `subscriptionStatus` naming inconsistency

### 2.2 Notification Types (4+ Variations)

| Type | Location | Key Differences |
|------|----------|-----------------|
| `Notification` | `src/types/navigation.ts` | Basic notification with `type` union |
| `NotificationRow` | `src/types/supabase-extended.ts` | Database row with same structure |
| `DatabaseNotification` | `src/types/database.ts` | Different `type` union values |
| `Notification` | `src/hooks/useNotifications.ts` | Similar to navigation.ts version |
| `Notification` | `src/services/api/notifications.service.ts` | Service-specific with different fields |
| `NotificationPayload` | `src/services/notificationService.ts` | Web push payload format |

**Issues:**
- Different `type` union values: `'match' | 'message'` vs `'new_message' | 'interest_received'`
- Inconsistent field presence: `timestamp` vs `created_at`
- `message` vs `content` field naming

### 2.3 Message Types (5+ Variations)

| Type | Location | Key Differences |
|------|----------|-----------------|
| `Message` | `src/types/chat.ts` | Has `content_type`, `status` |
| `MessageRow` | `src/types/supabase-extended.ts` | Database row format |
| `DatabaseMessage` | `src/types/database.ts` | Has `message_type`, `attachment_url` |
| `Message` | `src/features/messages/types.ts` | Uses `senderId` (camelCase), `timestamp` as Date |
| `Message` | `src/features/messages/hooks/useMessages.ts` | Has both `message_type` and `content_type` |
| `Message` | `src/hooks/useRealTimeMessages.ts` | Inline definition |
| `EnhancedMessage` | `src/types/chat.ts` | Extends Message with reactions |
| `EnhancedMessage` | `src/hooks/useEnhancedMessages.ts` | Different inline definition |

**Issues:**
- `sender_id` vs `senderId` naming inconsistency
- `content_type` vs `message_type` field naming
- `timestamp` as Date vs string vs `created_at`
- Different optional field sets

### 2.4 Subscription/Plan Types (4+ Variations)

| Type | Location | Key Differences |
|------|----------|-----------------|
| `SubscriptionPlan` | `src/types/subscription.ts` | Has `is_popular` |
| `SubscriptionPlan` | `src/types/payment.ts` | Has `popular` (different name) |
| `SubscriptionPlan` | `src/hooks/useSubscription.ts` | Has `type` field |
| `SubscriptionPlan` | `src/services/api/payments.service.ts` | Has `currency` field |
| `UserSubscription` | `src/types/subscription.ts` | Basic user subscription |
| `Subscription` | `src/types/payment.ts` | Different field structure |
| `Subscription` | `src/services/api/payments.service.ts` | Has `starts_at`, `ends_at` |
| `SubscriptionStatus` | `src/types/payment.ts` | Type alias for status values |
| `SubscriptionStatus` | `backend/src/types/domain.ts` | Interface with subscription fields |

**Issues:**
- Same name `SubscriptionPlan` with different structures
- `is_popular` vs `popular` naming
- Inconsistent date field naming: `start_date` vs `starts_at`

### 2.5 Horoscope Types (3+ Variations)

| Type | Location | Key Differences |
|------|----------|-----------------|
| `ProfileHoroscope` | `src/types/database.ts` | Comprehensive with all fields |
| `ProfileHoroscope` | `src/data/profileTypes.ts` | Has `doshas`, `gunaPoints`, `kundaliFile` |
| `Horoscope` | `src/services/api/horoscope.service.ts` | Has `manglik_status` as enum |
| `HoroscopeDetails` | `backend/src/types/domain.ts` | Backend-specific with `birth_date`, `birth_time` |
| `HoroscopeData` | `backend/src/types/domain.ts` | Minimal astrological data |

**Issues:**
- `manglik` as boolean vs `manglik_status` as enum
- Different field sets for similar data
- `kundali_url` vs `kundaliFile` naming

### 2.6 Location Types (3+ Variations)

| Type | Location | Key Differences |
|------|----------|-----------------|
| `LocationData` | `src/types/user.ts` | Has `coordinates` object |
| `ProfileLocation` | `src/types/database.ts` | Has `coordinates` object |
| `ProfileLocation` | `src/data/profileTypes.ts` | Minimal: just `country`, `state?`, `city` |

**Issues:**
- Optional vs required fields differ
- `coordinates` presence varies
- `address` field presence varies

---

## 3. Consolidation Plan

### 3.1 Recommended Type Hierarchy

```
src/types/
├── index.ts              # Main re-export
├── database.ts           # Database schema types (keep, but mark as source of truth)
├── domain/
│   ├── profile.ts        # Consolidated profile types
│   ├── message.ts        # Consolidated message types
│   ├── notification.ts   # Consolidated notification types
│   ├── subscription.ts   # Consolidated subscription types
│   ├── horoscope.ts      # Consolidated horoscope types
│   ├── matching.ts       # Matching types (keep)
│   ├── event.ts          # Event types (keep)
│   └── payment.ts        # Payment types (keep)
├── api/
│   ├── request.ts        # API request types
│   ├── response.ts       # API response types
│   └── errors.ts         # Error types (keep)
├── ui/
│   ├── forms.ts          # Form types
│   └── components.ts     # Component prop types
└── auth.ts               # Auth types (keep)
```

### 3.2 Types to Merge

#### Profile Types → Single Source of Truth

**Recommendation:** Create a unified `Profile` type with utility types for specific use cases.

```typescript
// src/types/domain/profile.ts

/** Base profile fields from database */
export interface ProfileRow {
  id: string;
  user_id: string;
  // ... all database fields with snake_case
}

/** Frontend-friendly profile with camelCase and typed nested objects */
export interface Profile extends Omit<ProfileRow, 
  'profile_picture_url' | 'subscription_status' | 'last_active'
> {
  profilePictureUrl: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  lastActive: string | null;
  // Typed nested objects
  location: ProfileLocation | null;
  education: ProfileEducation | null;
  employment: ProfileEmployment | null;
  family: ProfileFamily | null;
  horoscope: ProfileHoroscope | null;
  preferences: ProfilePreferences | null;
}

/** Profile for list/card display (minimal fields) */
export type ProfileSummary = Pick<Profile, 
  'id' | 'user_id' | 'name' | 'age' | 'gender' | 'profilePictureUrl' | 'city' | 'state'
>;

/** Profile for matching algorithm */
export type MatchProfile = Pick<Profile,
  'id' | 'age' | 'height' | 'city' | 'state' | 'country' | 
  'education_level' | 'gotra' | 'rashi' | 'gender' | 'manglik'
> & {
  horoscope?: HoroscopeData;
};
```

#### Notification Types → Unified

```typescript
// src/types/domain/notification.ts

/** Notification type enum */
export type NotificationType = 
  | 'match' 
  | 'message' 
  | 'profile_view' 
  | 'interest_received'
  | 'interest_accepted'
  | 'subscription_activated'
  | 'subscription_expiring'
  | 'system';

/** Database notification row */
export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  action_url: string | null;
  sender_id: string | null;
  related_user_id?: string | null;
  related_entity_id?: string | null;
}

/** Frontend notification (same as row, for consistency) */
export type Notification = NotificationRow;
```

#### Message Types → Unified

```typescript
// src/types/domain/message.ts

/** Message content type */
export type MessageContentType = 'text' | 'image' | 'video' | 'audio' | 'file';

/** Message status */
export type MessageStatus = 'sent' | 'delivered' | 'read';

/** Database message row */
export interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: MessageContentType;
  media_url: string | null;
  read_at: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

/** Frontend message with computed fields */
export interface Message extends MessageRow {
  status: MessageStatus;
  is_own?: boolean;
}

/** Message with reactions */
export interface MessageWithReactions extends Message {
  reactions: MessageReaction[];
}
```

#### Subscription Types → Unified

```typescript
// src/types/domain/subscription.ts

/** Subscription status */
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

/** Subscription plan */
export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'basic' | 'premium' | 'vip';
  price: number;
  currency: string;
  duration: number; // in days
  features: string[];
  is_popular?: boolean;
}

/** User subscription */
export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}
```

#### Horoscope Types → Unified

```typescript
// src/types/domain/horoscope.ts

/** Manglik status */
export type ManglikStatus = 'yes' | 'no' | 'anshik' | 'unknown';

/** Horoscope data */
export interface Horoscope {
  id: string;
  user_id: string;
  birth_date: string;
  birth_time: string | null;
  birth_place: string | null;
  rashi: string | null;
  nakshatra: string | null;
  manglik_status: ManglikStatus;
  moon_sign?: string | null;
  horoscope_file_url?: string | null;
  kundali_url?: string | null;
  created_at: string;
  updated_at: string;
}

/** Horoscope compatibility result */
export interface HoroscopeCompatibility {
  score: number;
  factors: {
    moonSign: number;
    nakshatra: number;
    manglik: number;
  };
  details: string[];
}
```

#### Location Types → Unified

```typescript
// src/types/domain/location.ts

/** Geographic coordinates */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Location data */
export interface Location {
  city: string;
  state: string;
  country: string;
  coordinates?: Coordinates;
  address?: string;
}

/** Profile location (minimal) */
export type ProfileLocation = Pick<Location, 'city' | 'state' | 'country'>;
```

### 3.3 Types to Keep Separate

1. **Database schema types** (`src/types/supabase.ts`) - Auto-generated, should not be modified
2. **Backend domain types** (`backend/src/types/domain.ts`) - Backend-specific, may differ from frontend
3. **Form types** (`LoginFormData`, `RegisterFormData`) - UI-specific, keep in `common.ts`
4. **Component prop types** (`ProfileCardProps`, `ButtonProps`) - UI-specific, keep in `common.ts`
5. **API error types** - Keep in `errors.ts` as they're well-organized

### 3.4 Naming Conventions

| Category | Convention | Example |
|----------|------------|---------|
| Database row types | PascalCase + `Row` suffix | `ProfileRow`, `MessageRow` |
| Domain types | PascalCase | `Profile`, `Message`, `Notification` |
| Type aliases for unions | PascalCase | `NotificationType`, `MessageStatus` |
| Form data types | PascalCase + `FormData` suffix | `LoginFormData`, `ProfileFormData` |
| Component prop types | PascalCase + `Props` suffix | `ProfileCardProps`, `ButtonProps` |
| API response types | PascalCase + `Response` suffix | `APIResponse`, `PaymentVerificationResponse` |
| Request types | PascalCase + `Request` suffix | `PaymentVerificationRequest` |
| Frontend fields | camelCase | `profilePictureUrl`, `lastActive` |
| Database fields | snake_case | `profile_picture_url`, `last_active` |

---

## 4. Implementation Summary

### Changes Made

**No changes were implemented** in this phase. This report serves as the analysis and planning document. Implementation should be done in a separate, carefully planned phase to avoid breaking changes.

### Recommended Implementation Order

1. **Phase 1: Create new unified types** (non-breaking)
   - Create `src/types/domain/` directory
   - Add new unified type files
   - Export from `src/types/index.ts`

2. **Phase 2: Update services to use unified types** (low risk)
   - Update API services to use new types
   - Add type adapters where needed

3. **Phase 3: Update hooks to use unified types** (medium risk)
   - Update hook return types
   - Add type adapters for backward compatibility

4. **Phase 4: Update components to use unified types** (higher risk)
   - Update component prop types
   - Handle field name differences

5. **Phase 5: Remove deprecated types** (after verification)
   - Mark old types as deprecated
   - Remove after all consumers updated

---

## 5. Risk Notes

### High-Risk Areas

1. **Profile types** - Used extensively across the codebase
   - Many components depend on `UserProfile` structure
   - Field name differences (`profile_picture_url` vs `profilePictureUrl`) require careful mapping

2. **Message types** - Real-time messaging depends on correct types
   - WebSocket handlers expect specific field names
   - Breaking changes could disrupt messaging functionality

3. **Database row types** - Must match Supabase schema exactly
   - `src/types/supabase.ts` is auto-generated
   - Manual changes will be overwritten

### Circular Dependency Risks

1. `src/types/matching.ts` imports from `supabase-extended` which imports `UserProfile` from `user.ts`
2. `src/types/auth.ts` imports `UserProfile` from `user.ts` and `UserSubscription` from `subscription.ts`
3. `src/types/common.ts` imports `UserProfile` from `user.ts` and `APIResponse` from `errors.ts`

**Mitigation:** Use type-only imports and ensure domain types don't import from UI types.

### Testing Requirements

Before any consolidation:
1. Run `npm run typecheck` to verify no type errors
2. Run all unit tests
3. Run integration tests
4. Manual testing of:
   - Profile viewing/editing
   - Messaging (send/receive/real-time)
   - Notifications
   - Subscription management
   - Matching algorithm

---

## 6. Appendix: Type Count Summary

| Category | Unique Types | Duplicated | Inline Definitions |
|----------|--------------|------------|-------------------|
| Profile | 6+ | 4 | 3 |
| Notification | 4+ | 3 | 2 |
| Message | 5+ | 4 | 4 |
| Subscription | 4+ | 3 | 2 |
| Horoscope | 3+ | 2 | 1 |
| Location | 3+ | 2 | 0 |
| Interest | 2+ | 1 | 1 |
| Payment | 3+ | 2 | 0 |
| Error | 6+ | 0 | 0 |
| Auth | 3+ | 0 | 0 |

**Total estimated duplicated types:** 20+
**Total inline type definitions:** 15+

---

## 7. Conclusion

The codebase has significant type duplication that impacts:
- **Maintainability:** Changes require updates in multiple files
- **Type safety:** Inconsistent types can lead to runtime errors
- **Developer experience:** Confusion about which type to use
- **Code navigation:** Multiple definitions make it hard to find the source

The recommended consolidation approach:
1. Establish `ProfileRow` (database) and `Profile` (frontend) as single sources of truth
2. Use TypeScript utility types (`Pick`, `Omit`, `Partial`) for variations
3. Create a clear naming convention and stick to it
4. Implement in phases to minimize risk
5. Add type adapters/mappers during transition

This consolidation will improve type safety, reduce bugs from type mismatches, and make the codebase easier to maintain and extend.
