# Type Hierarchy Diagram & Architecture

## Overall Type System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TYPE SYSTEM ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              src/types/index.ts
                         (Main export aggregator)
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
        ┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
        │   Core Types   │  │ Domain Types│  │   API Types     │
        │   (core/*)     │  │ (domain/*)  │  │   (api/*)       │
        └────────────────┘  └─────────────┘  └─────────────────┘
                │                   │                   │
        ┌───────┴────────┐  ┌──────┴──────┐  ┌────────┴────────┐
        │                │  │             │  │                 │
    common.ts        messaging.ts   requests.ts
    user.ts          matching.ts    responses.ts
    auth.ts          notification.ts filters.ts
    context.ts       payment.ts
                     profile.ts
                     events.ts
                     vdates.ts
                     forum.ts
                     blog.ts
                     horoscope.ts
                     social.ts
                     verification.ts
                     media.ts
                     stories.ts
                     interactions.ts
```

---

## Core Types Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                      CORE TYPES (core/*)                        │
│                  Foundation for entire system                   │
└─────────────────────────────────────────────────────────────────┘

common.ts
├── ErrorCode (enum)
├── APIError (class)
├── APIResponse<T> (interface)
├── PaginationParams (interface)
├── PaginationMeta (interface)
├── Timestamps (interface)
└── Utility Types
    ├── Optional<T, K>
    ├── RequiredFields<T, K>
    ├── DeepPartial<T>
    ├── Nullable<T>
    └── Awaitable<T>

user.ts
├── User (interface)
├── UserProfile (interface)
│   ├── LocationData (nested)
│   ├── ProfileEducation (nested)
│   ├── ProfileEmployment (nested)
│   ├── ProfileFamily (nested)
│   ├── ProfilePreferences (nested)
│   ├── ProfileHoroscope (nested)
│   └── ProfilePrivacySettings (nested)
├── Type Guards
│   ├── isUserProfile()
│   └── isUser()
└── Exports
    └── All nested types

auth.ts
├── Session (interface)
├── AuthState (interface)
├── AuthContextType (interface)
└── Imports
    ├── User (from user.ts)
    ├── UserProfile (from user.ts)
    └── UserSubscription (from domain/payment.ts)

context.ts
├── ThemeContextType (interface)
├── NotificationContextType (interface)
├── ChatContextType (interface)
└── Imports
    ├── Conversation (from domain/messaging.ts)
    ├── Notification (from domain/notification.ts)
    └── UserProfile (from user.ts)
```

---

## Domain Types Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                   DOMAIN TYPES (domain/*)                       │
│              Business logic and feature-specific types          │
└─────────────────────────────────────────────────────────────────┘

messaging.ts
├── Message (interface)
├── MessageReaction (interface)
├── ReactionSummary (interface)
├── EnhancedMessage (interface)
├── MessageWithReactions (interface)
├── Conversation (interface)
├── Type Guards
│   ├── isMessage()
│   └── isConversation()
└── Imports
    ├── UserProfile (from core/user.ts)
    └── Timestamps (from core/common.ts)

matching.ts
├── Match (interface)
├── CompatibilityFactors (interface)
├── MatchWithScore (interface)
├── ProfileWithMatch (interface)
├── Interest (interface)
├── Connection (interface)
├── Favorite (interface)
├── SearchResult (interface)
├── MatchingResult (interface)
├── ProfileComparison (interface)
├── MatchingError (class)
├── Type Guards
│   ├── isProfile()
│   ├── isMatch()
│   ├── isInterest()
│   └── isCompatibilityFactors()
└── Imports
    ├── UserProfile (from core/user.ts)
    ├── Timestamps (from core/common.ts)
    └── Database (from supabase.ts)

notification.ts
├── Notification (interface)
├── NotificationPreferences (interface)
├── NotificationContextType (interface)
├── Type Guards
│   ├── isNotification()
│   └── isNotificationPreferences()
└── Imports
    └── Timestamps (from core/common.ts)

payment.ts
├── SubscriptionPlan (interface)
├── UserSubscription (interface)
├── Payment (interface)
├── RazorpayOrderData (interface)
├── RazorpayPaymentResponse (interface)
├── RazorpayCheckoutOptions (interface)
├── PaymentVerificationRequest (interface)
├── PaymentVerificationResponse (interface)
├── OrderCreationRequest (interface)
├── OrderCreationResponse (interface)
├── ActivityLimits (interface)
├── PlanLimitsMap (type)
├── PaymentError (class)
├── Type Guards
│   ├── isRazorpayPaymentResponse()
│   └── isSubscriptionPlan()
└── Imports
    └── Timestamps (from core/common.ts)

profile.ts
├── ProfileLocation (interface)
├── ProfileEducation (interface)
├── ProfileEmployment (interface)
├── ProfileFamily (interface)
├── ProfilePreferences (interface)
├── ProfileHoroscope (interface)
└── Imports
    └── (Re-exports from core/user.ts)

events.ts
├── Event (interface)
├── EventRegistration (interface)
└── Imports
    └── Timestamps (from core/common.ts)

vdates.ts
├── VDate (interface)
├── VDateFeedback (interface)
├── VDateInvitation (interface)
├── VDateTemplate (interface)
├── UserAvailability (interface)
└── Imports
    └── Timestamps (from core/common.ts)

forum.ts
├── ForumPost (interface)
├── ForumComment (interface)
├── ForumCategory (interface)
├── ForumReport (interface)
└── Imports
    └── Timestamps (from core/common.ts)

blog.ts
├── BlogArticle (interface)
├── Announcement (interface)
└── Imports
    └── Timestamps (from core/common.ts)

horoscope.ts
├── Horoscope (interface)
├── HoroscopeCompatibility (interface)
└── Imports
    └── Timestamps (from core/common.ts)

social.ts
├── UserFollow (interface)
├── UserActivity (interface)
├── CommunityGroup (interface)
└── Imports
    └── Timestamps (from core/common.ts)

verification.ts
├── VerificationRequest (interface)
└── Imports
    └── Timestamps (from core/common.ts)

media.ts
├── Photo (interface)
├── PhotoUploadOptions (interface)
└── Imports
    └── Timestamps (from core/common.ts)

stories.ts
├── SuccessStory (interface)
└── Imports
    └── Timestamps (from core/common.ts)

interactions.ts
├── ProfileView (interface)
├── Favorite (interface)
├── BlockedUser (interface)
└── Imports
    └── Timestamps (from core/common.ts)
```

---

## API Types Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    API TYPES (api/*)                            │
│              Request/response and filter types                  │
└─────────────────────────────────────────────────────────────────┘

requests.ts
├── LoginCredentials (interface)
├── RegisterData (interface)
├── AuthResponse (interface)
├── LoginFormData (interface)
├── RegisterFormData (interface)
├── ProfileFormData (interface)
└── Imports
    └── UserProfile (from core/user.ts)

responses.ts
├── (API response wrappers)
└── Imports
    └── APIResponse<T> (from core/common.ts)

filters.ts
├── SearchFilters (interface)
├── AdvancedSearchFilters (interface)
├── ProfileSearchParams (interface)
├── Type Guards
│   └── isSearchFilters()
└── (No imports needed)
```

---

## UI Types Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    UI TYPES (ui/*)                              │
│              Component prop types                               │
└─────────────────────────────────────────────────────────────────┘

props.ts
├── ProfileCardProps (interface)
├── ButtonProps (interface)
└── Imports
    └── UserProfile (from core/user.ts)
```

---

## Type Dependency Graph

```
                    ┌─────────────────┐
                    │  Timestamps     │
                    │ (core/common)   │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
        ┌───────▼────┐  ┌───▼────┐  ┌──▼──────┐
        │ APIResponse│  │ APIError│  │ Utility │
        │(core/common)  │(core/common)  │Types   │
        └────────────┘  └────────┘  └─────────┘
                │            │            │
                └────────────┼────────────┘
                             │
                    ┌────────▼────────┐
                    │  Core Types     │
                    │  (core/*)       │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼────┐          ┌───▼────┐          ┌───▼────┐
    │ User   │          │ Auth   │          │Context │
    │(core)  │          │(core)  │          │(core)  │
    └────────┘          └────────┘          └────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Domain Types   │
                    │  (domain/*)     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼──────┐        ┌───▼──────┐        ┌───▼──────┐
    │Messaging │        │ Matching │        │ Payment  │
    │(domain)  │        │(domain)  │        │(domain)  │
    └──────────┘        └──────────┘        └──────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Types     │
                    │   (api/*)       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   UI Types      │
                    │   (ui/*)        │
                    └─────────────────┘
```

---

## Import Patterns

### Pattern 1: Core Type Usage
```typescript
// In services, hooks, components
import { UserProfile, User } from '@/types/core/user';
import { APIResponse, APIError } from '@/types/core/common';
import { AuthContextType } from '@/types/core/auth';
```

### Pattern 2: Domain Type Usage
```typescript
// In services, hooks, components
import { Message, Conversation } from '@/types/domain/messaging';
import { Match, Interest } from '@/types/domain/matching';
import { Notification } from '@/types/domain/notification';
import { SubscriptionPlan, UserSubscription } from '@/types/domain/payment';
```

### Pattern 3: API Type Usage
```typescript
// In API services, forms
import { LoginCredentials, RegisterData } from '@/types/api/requests';
import { SearchFilters } from '@/types/api/filters';
```

### Pattern 4: UI Type Usage
```typescript
// In components
import { ProfileCardProps, ButtonProps } from '@/types/ui/props';
```

### Pattern 5: Aggregated Import
```typescript
// In index files or when multiple types needed
import {
  UserProfile,
  Message,
  Notification,
  SubscriptionPlan,
} from '@/types';
```

---

## Type Composition Examples

### Example 1: User with Profile
```typescript
interface UserWithProfile {
  user: User;
  profile: UserProfile;
  subscription: UserSubscription;
}
```

### Example 2: Message with Reactions
```typescript
interface MessageThread {
  message: Message;
  reactions: MessageReaction[];
  replies: Message[];
}
```

### Example 3: Match with Compatibility
```typescript
interface MatchRecommendation {
  match: Match;
  compatibility: CompatibilityFactors;
  score: number;
}
```

### Example 4: API Response with Pagination
```typescript
interface PaginatedResponse<T> extends APIResponse<T[]> {
  metadata: PaginationMeta;
}
```

---

## Circular Dependency Prevention

### Safe Patterns ✓
```typescript
// core/user.ts imports from core/common.ts
import { Timestamps } from './common';

// domain/messaging.ts imports from core/user.ts
import { UserProfile } from '../core/user';

// api/requests.ts imports from core/user.ts
import { UserProfile } from '../core/user';
```

### Unsafe Patterns ✗
```typescript
// core/user.ts imports from domain/messaging.ts (CIRCULAR!)
import { Message } from '../domain/messaging';

// domain/messaging.ts imports from domain/matching.ts
// domain/matching.ts imports from domain/messaging.ts (CIRCULAR!)
```

### Resolution Strategy
- Core types never import from domain types
- Domain types can import from core types
- API types can import from core and domain types
- UI types can import from core and domain types

---

## Type Guard Patterns

### Pattern 1: Simple Type Guard
```typescript
export const isUserProfile = (obj: unknown): obj is UserProfile => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'user_id' in obj;
};
```

### Pattern 2: Complex Type Guard
```typescript
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

### Pattern 3: Union Type Guard
```typescript
export function isNotificationEvent(
  obj: unknown
): obj is Notification {
  return (
    isNotification(obj) &&
    ['match', 'message', 'profile_view', 'interest'].includes(
      (obj as Notification).type
    )
  );
}
```

---

## Migration Checklist by File Type

### Service Files
- [ ] Remove inline type definitions
- [ ] Import types from `@/types/domain/*`
- [ ] Update type exports
- [ ] Run tests

### Hook Files
- [ ] Remove inline type definitions
- [ ] Import types from `@/types/domain/*` or `@/types/core/*`
- [ ] Update type exports
- [ ] Run tests

### Component Files
- [ ] Remove inline type definitions
- [ ] Import types from `@/types/ui/*` or `@/types/domain/*`
- [ ] Update prop types
- [ ] Run tests

### Context Files
- [ ] Remove inline type definitions
- [ ] Import types from `@/types/core/context.ts`
- [ ] Update context types
- [ ] Run tests

---

## Performance Considerations

### Type Checking Performance
- Consolidated types reduce type checking time
- Fewer duplicate definitions = faster compilation
- Clear hierarchy = better tree-shaking

### Runtime Performance
- Type guards enable efficient runtime validation
- No performance impact from type consolidation
- Type erasure at compile time

### Bundle Size
- No impact on bundle size (types are compile-time only)
- Better organization may improve tree-shaking
- Reduced source file count

---

## Maintenance Guidelines

### Adding New Types
1. Determine the domain (core, domain, api, ui)
2. Add to appropriate file in that domain
3. Export from domain file
4. Re-export from `src/types/index.ts`
5. Add type guards if needed
6. Update documentation

### Modifying Existing Types
1. Update in consolidated location
2. Check all imports
3. Run tests
4. Update documentation

### Deprecating Types
1. Mark with `@deprecated` comment
2. Create alias to new type
3. Update documentation
4. Remove in next major version

---

## Documentation Standards

### Type Documentation Template
```typescript
/**
 * Brief description of what this type represents
 * 
 * @example
 * const user: User = {
 *   id: '123',
 *   email: 'user@example.com',
 *   role: 'user'
 * };
 * 
 * @see UserProfile for extended user information
 */
export interface User {
  // ...
}
```

---

## Summary

This type hierarchy provides:
- **Clear organization** - Types grouped by domain
- **Single source of truth** - Each type defined once
- **Easy discovery** - Developers know where to find types
- **Type safety** - Consistent definitions across codebase
- **Maintainability** - Reduced duplication and complexity
- **Scalability** - Easy to add new types following patterns

