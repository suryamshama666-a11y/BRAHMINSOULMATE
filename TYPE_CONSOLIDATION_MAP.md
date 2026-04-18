# Type Consolidation Map: Old → New Locations

## Overview
This document maps all duplicate type definitions to their consolidated locations.

---

## 1. USER & PROFILE TYPES

### UserProfile Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `UserProfile` | `src/types/core/user.ts` | `UserProfile` | Primary |
| `src/types/database.ts` | `DatabaseProfile` | `src/types/core/user.ts` | `UserProfile` | Remove |
| `src/types/profile.ts` | `Profile` | `src/types/core/user.ts` | `UserProfile` | Remove |
| `src/hooks/useProfile.ts` | `Profile` | `src/types/core/user.ts` | `UserProfile` | Remove |
| `backend/src/routes/matching.ts` | `MatchProfile` | `src/types/core/user.ts` | `UserProfile` | Remove |
| `src/hooks/forum/useUserProfile.ts` | `ForumUserProfile` | `src/types/core/user.ts` | `UserProfile` | Remove |

**Migration Path:**
```typescript
// OLD
import { UserProfile } from '@/types/index';
import { DatabaseProfile } from '@/types/database';
import { Profile } from '@/types/profile';

// NEW
import { UserProfile } from '@/types/core/user';
```

### Profile Nested Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `ProfileLocation` | `src/types/domain/profile.ts` | `ProfileLocation` | Primary |
| `src/types/database.ts` | `ProfileLocation` | `src/types/domain/profile.ts` | `ProfileLocation` | Remove |
| `src/types/index.ts` | `ProfileEducation` | `src/types/domain/profile.ts` | `ProfileEducation` | Primary |
| `src/types/database.ts` | `ProfileEducation` | `src/types/domain/profile.ts` | `ProfileEducation` | Remove |
| `src/types/index.ts` | `ProfileEmployment` | `src/types/domain/profile.ts` | `ProfileEmployment` | Primary |
| `src/types/database.ts` | `ProfileEmployment` | `src/types/domain/profile.ts` | `ProfileEmployment` | Remove |
| `src/types/index.ts` | `ProfileFamily` | `src/types/domain/profile.ts` | `ProfileFamily` | Primary |
| `src/types/database.ts` | `ProfileFamily` | `src/types/domain/profile.ts` | `ProfileFamily` | Remove |
| `src/types/index.ts` | `ProfileHoroscope` | `src/types/domain/profile.ts` | `ProfileHoroscope` | Primary |
| `src/types/database.ts` | `ProfileHoroscope` | `src/types/domain/profile.ts` | `ProfileHoroscope` | Remove |

---

## 2. AUTHENTICATION TYPES

### Auth Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `User` | `src/types/core/auth.ts` | `User` | Primary |
| `src/types/index.ts` | `Session` | `src/types/core/auth.ts` | `Session` | Primary |
| `src/types/index.ts` | `AuthState` | `src/types/core/auth.ts` | `AuthState` | Primary |
| `src/types/auth.ts` | `AuthContextType` | `src/types/core/auth.ts` | `AuthContextType` | Primary |
| `src/hooks/useSupabaseAuth.ts` | `AuthState` | `src/types/core/auth.ts` | `AuthState` | Remove |

### Auth Service Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/auth.service.ts` | `LoginCredentials` | `src/types/api/requests.ts` | `LoginCredentials` | Primary |
| `src/services/api/auth.service.ts` | `RegisterData` | `src/types/api/requests.ts` | `RegisterData` | Primary |
| `src/services/api/auth.service.ts` | `AuthResponse` | `src/types/api/responses.ts` | `AuthResponse` | Primary |

---

## 3. MESSAGING TYPES

### Message Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `Message` | `src/types/domain/messaging.ts` | `Message` | Primary |
| `src/types/database.ts` | `DatabaseMessage` | `src/types/domain/messaging.ts` | `Message` | Remove |
| `src/services/api/messages.service.ts` | `Message` | `src/types/domain/messaging.ts` | `Message` | Remove |
| `src/hooks/useRealTimeMessages.ts` | `Message` | `src/types/domain/messaging.ts` | `Message` | Remove |
| `src/hooks/messaging/types.ts` | `RealTimeMessage` | `src/types/domain/messaging.ts` | `Message` | Remove |

### Message Reaction Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `MessageReaction` | `src/types/domain/messaging.ts` | `MessageReaction` | Primary |
| `src/types/index.ts` | `ReactionSummary` | `src/types/domain/messaging.ts` | `ReactionSummary` | Primary |
| `src/types/index.ts` | `EnhancedMessage` | `src/types/domain/messaging.ts` | `EnhancedMessage` | Primary |
| `src/types/index.ts` | `MessageWithReactions` | `src/types/domain/messaging.ts` | `MessageWithReactions` | Primary |

### Conversation Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `Conversation` | `src/types/domain/messaging.ts` | `Conversation` | Primary |
| `src/types/database.ts` | `DatabaseConversation` | `src/types/domain/messaging.ts` | `Conversation` | Remove |
| `src/services/api/messages.service.ts` | `Conversation` | `src/types/domain/messaging.ts` | `Conversation` | Remove |
| `src/hooks/useEnhancedMessages.ts` | `Conversation` | `src/types/domain/messaging.ts` | `Conversation` | Remove |
| `src/hooks/messaging/types.ts` | `Conversation` | `src/types/domain/messaging.ts` | `Conversation` | Remove |
| `backend/src/routes/messages.ts` | `Conversation` | `src/types/domain/messaging.ts` | `Conversation` | Remove |

**Migration Path:**
```typescript
// OLD
import { Message, Conversation } from '@/types/index';
import { DatabaseMessage } from '@/types/database';
import { Message as ServiceMessage } from '@/services/api/messages.service';

// NEW
import { Message, Conversation, MessageReaction } from '@/types/domain/messaging';
```

---

## 4. NOTIFICATION TYPES

### Notification Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `Notification` | `src/types/domain/notification.ts` | `Notification` | Primary |
| `src/types/database.ts` | `DatabaseNotification` | `src/types/domain/notification.ts` | `Notification` | Remove |
| `src/services/api/notifications.service.ts` | `Notification` | `src/types/domain/notification.ts` | `Notification` | Remove |
| `src/hooks/useNotifications.ts` | `Notification` | `src/types/domain/notification.ts` | `Notification` | Remove |
| `src/services/notificationService.ts` | `NotificationPayload` | `src/types/domain/notification.ts` | `Notification` | Remove |

### Notification Preferences

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `NotificationContextType` | `src/types/domain/notification.ts` | `NotificationContextType` | Primary |
| `src/services/notificationService.ts` | `NotificationPreferences` | `src/types/domain/notification.ts` | `NotificationPreferences` | Primary |
| `src/services/api/notifications.service.ts` | `NotificationPreferences` | `src/types/domain/notification.ts` | `NotificationPreferences` | Remove |

**Migration Path:**
```typescript
// OLD
import { Notification } from '@/types/index';
import { DatabaseNotification } from '@/types/database';
import { NotificationPayload } from '@/services/notificationService';

// NEW
import { Notification, NotificationPreferences } from '@/types/domain/notification';
```

---

## 5. PAYMENT & SUBSCRIPTION TYPES

### Subscription Plan Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `SubscriptionPlan` | `src/types/domain/payment.ts` | `SubscriptionPlan` | Primary |
| `src/types/database.ts` | `SubscriptionPlan` | `src/types/domain/payment.ts` | `SubscriptionPlan` | Remove |
| `src/types/payment.ts` | `PaymentPlan` | `src/types/domain/payment.ts` | `SubscriptionPlan` | Rename |
| `src/services/api/payments.service.ts` | `SubscriptionPlan` | `src/types/domain/payment.ts` | `SubscriptionPlan` | Remove |
| `src/services/paymentService.ts` | `PaymentPlan` | `src/types/domain/payment.ts` | `SubscriptionPlan` | Remove |
| `src/hooks/useSubscription.ts` | `SubscriptionPlan` | `src/types/domain/payment.ts` | `SubscriptionPlan` | Remove |

### User Subscription Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `UserSubscription` | `src/types/domain/payment.ts` | `UserSubscription` | Primary |
| `src/types/database.ts` | `DatabaseUserSubscription` | `src/types/domain/payment.ts` | `UserSubscription` | Remove |
| `src/services/api/payments.service.ts` | `Subscription` | `src/types/domain/payment.ts` | `UserSubscription` | Rename |
| `src/services/paymentService.ts` | `Subscription` | `src/types/domain/payment.ts` | `UserSubscription` | Remove |
| `src/hooks/useSubscription.ts` | `UserSubscription` | `src/types/domain/payment.ts` | `UserSubscription` | Remove |

### Payment Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/database.ts` | `DatabasePayment` | `src/types/domain/payment.ts` | `Payment` | Primary |
| `src/types/payment.ts` | `RazorpayOrderData` | `src/types/domain/payment.ts` | `RazorpayOrderData` | Primary |
| `src/types/payment.ts` | `RazorpayPaymentResponse` | `src/types/domain/payment.ts` | `RazorpayPaymentResponse` | Primary |
| `src/types/payment.ts` | `RazorpayCheckoutOptions` | `src/types/domain/payment.ts` | `RazorpayCheckoutOptions` | Primary |
| `src/services/api/payments.service.ts` | `Payment` | `src/types/domain/payment.ts` | `Payment` | Remove |
| `src/services/api/payments.service.ts` | `RazorpayOrder` | `src/types/domain/payment.ts` | `RazorpayOrderData` | Remove |

**Migration Path:**
```typescript
// OLD
import { SubscriptionPlan, UserSubscription } from '@/types/index';
import { PaymentPlan } from '@/types/payment';
import { Subscription } from '@/services/api/payments.service';

// NEW
import { SubscriptionPlan, UserSubscription, Payment } from '@/types/domain/payment';
```

---

## 6. MATCHING & INTEREST TYPES

### Match Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `Match` | `src/types/domain/matching.ts` | `Match` | Primary |
| `src/types/database.ts` | `DatabaseMatch` | `src/types/domain/matching.ts` | `Match` | Remove |
| `src/types/matching.ts` | `Match` | `src/types/domain/matching.ts` | `Match` | Remove |
| `src/services/api/matching.service.ts` | `Match` | `src/types/domain/matching.ts` | `Match` | Remove |

### Match Score Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/matching.ts` | `MatchWithScore` | `src/types/domain/matching.ts` | `MatchWithScore` | Primary |
| `src/types/matching.ts` | `ProfileWithMatch` | `src/types/domain/matching.ts` | `ProfileWithMatch` | Primary |
| `src/services/api/matching.service.ts` | `CompatibilityFactors` | `src/types/domain/matching.ts` | `CompatibilityFactors` | Primary |

### Interest Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/matching.ts` | `Interest` | `src/types/domain/matching.ts` | `Interest` | Primary |
| `src/services/api/interests.service.ts` | `Interest` | `src/types/domain/matching.ts` | `Interest` | Remove |
| `src/hooks/useInterests.ts` | `UserInterest` | `src/types/domain/matching.ts` | `Interest` | Remove |
| `src/hooks/useInterests.ts` | `InterestExchange` | `src/types/domain/matching.ts` | `Interest` | Remove |

### Connection Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/matching.ts` | `Connection` | `src/types/domain/matching.ts` | `Connection` | Primary |
| `src/services/api/interests.service.ts` | `Connection` | `src/types/domain/matching.ts` | `Connection` | Remove |
| `src/types/database.ts` | `DatabaseConnection` | `src/types/domain/matching.ts` | `Connection` | Remove |

### Search & Favorite Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/matching.ts` | `SearchFilters` | `src/types/api/filters.ts` | `SearchFilters` | Primary |
| `src/types/matching.ts` | `SearchResult` | `src/types/domain/matching.ts` | `SearchResult` | Primary |
| `src/types/matching.ts` | `Favorite` | `src/types/domain/matching.ts` | `Favorite` | Primary |

**Migration Path:**
```typescript
// OLD
import { Match, Interest, Connection } from '@/types/matching';
import { Match as ServiceMatch } from '@/services/api/matching.service';

// NEW
import { Match, Interest, Connection, MatchWithScore } from '@/types/domain/matching';
```

---

## 7. EVENT TYPES

### Event Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `Event` | `src/types/domain/events.ts` | `Event` | Primary |
| `src/types/database.ts` | `DatabaseEvent` | `src/types/domain/events.ts` | `Event` | Remove |
| `src/services/api/events.service.ts` | `Event` | `src/types/domain/events.ts` | `Event` | Remove |
| `src/hooks/useEvents.ts` | `Event` | `src/types/domain/events.ts` | `Event` | Remove |

### Event Registration Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/database.ts` | `DatabaseEventParticipant` | `src/types/domain/events.ts` | `EventRegistration` | Rename |
| `src/services/api/events.service.ts` | `EventRegistration` | `src/types/domain/events.ts` | `EventRegistration` | Primary |

**Migration Path:**
```typescript
// OLD
import { Event } from '@/types/index';
import { DatabaseEvent } from '@/types/database';

// NEW
import { Event, EventRegistration } from '@/types/domain/events';
```

---

## 8. VDATE TYPES

### VDate Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/vdates.ts` | `VDate` | `src/types/domain/vdates.ts` | `VDate` | Primary |
| `src/types/database.ts` | `DatabaseVDate` | `src/types/domain/vdates.ts` | `VDate` | Remove |
| `src/services/api/vdates.service.ts` | `VDate` | `src/types/domain/vdates.ts` | `VDate` | Remove |

### VDate Related Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/vdates.ts` | `VDateFeedback` | `src/types/domain/vdates.ts` | `VDateFeedback` | Primary |
| `src/types/vdates.ts` | `VDateInvitation` | `src/types/domain/vdates.ts` | `VDateInvitation` | Primary |
| `src/types/vdates.ts` | `VDateTemplate` | `src/types/domain/vdates.ts` | `VDateTemplate` | Primary |
| `src/types/vdates.ts` | `UserAvailability` | `src/types/domain/vdates.ts` | `UserAvailability` | Primary |
| `src/services/api/vdates.service.ts` | `VDateFeedback` | `src/types/domain/vdates.ts` | `VDateFeedback` | Remove |

---

## 9. FORUM TYPES

### Forum Post Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/forum.service.ts` | `ForumPost` | `src/types/domain/forum.ts` | `ForumPost` | Primary |
| `src/hooks/forum/types.ts` | `ForumPost` | `src/types/domain/forum.ts` | `ForumPost` | Remove |

### Forum Comment Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/forum.service.ts` | `ForumComment` | `src/types/domain/forum.ts` | `ForumComment` | Primary |
| `src/hooks/forum/useForumReplies.ts` | `ForumReply` | `src/types/domain/forum.ts` | `ForumComment` | Rename |

### Forum Category Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/hooks/forum/useForumCategories.ts` | `ForumCategory` | `src/types/domain/forum.ts` | `ForumCategory` | Primary |

### Forum Report Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/forum.service.ts` | `ForumReport` | `src/types/domain/forum.ts` | `ForumReport` | Primary |

---

## 10. BLOG & ANNOUNCEMENT TYPES

### Blog Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/blog.service.ts` | `BlogArticle` | `src/types/domain/blog.ts` | `BlogArticle` | Primary |
| `src/services/api/blog.service.ts` | `Announcement` | `src/types/domain/blog.ts` | `Announcement` | Primary |

---

## 11. HOROSCOPE TYPES

### Horoscope Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/horoscope.service.ts` | `Horoscope` | `src/types/domain/horoscope.ts` | `Horoscope` | Primary |
| `src/services/api/horoscope.service.ts` | `HoroscopeCompatibility` | `src/types/domain/horoscope.ts` | `HoroscopeCompatibility` | Primary |

---

## 12. SOCIAL TYPES

### Follow Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/hooks/social/useUserFollows.ts` | `UserFollow` | `src/types/domain/social.ts` | `UserFollow` | Primary |

### Activity Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/database.ts` | `DatabaseUserActivity` | `src/types/domain/social.ts` | `UserActivity` | Primary |
| `src/hooks/social/useUserActivities.ts` | `UserActivity` | `src/types/domain/social.ts` | `UserActivity` | Remove |

### Community Group Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/hooks/social/useCommunityGroups.ts` | `CommunityGroup` | `src/types/domain/social.ts` | `CommunityGroup` | Primary |

---

## 13. COMMON/API TYPES

### API Response Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `APIResponse<T>` | `src/types/core/common.ts` | `APIResponse<T>` | Primary |
| `src/types/database.ts` | `DatabaseApiResponse<T>` | `src/types/core/common.ts` | `APIResponse<T>` | Remove |
| `src/services/api/base.ts` | `APIResponse<T>` | `src/types/core/common.ts` | `APIResponse<T>` | Remove |

### Error Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/base.ts` | `APIError` | `src/types/core/common.ts` | `APIError` | Primary |
| `src/services/api/base.ts` | `ErrorCode` | `src/types/core/common.ts` | `ErrorCode` | Primary |
| `src/types/payment.ts` | `PaymentError` | `src/types/domain/payment.ts` | `PaymentError` | Primary |
| `src/types/matching.ts` | `MatchingError` | `src/types/domain/matching.ts` | `MatchingError` | Primary |

### Form Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `LoginFormData` | `src/types/api/requests.ts` | `LoginFormData` | Primary |
| `src/types/index.ts` | `RegisterFormData` | `src/types/api/requests.ts` | `RegisterFormData` | Primary |
| `src/types/index.ts` | `ProfileFormData` | `src/types/api/requests.ts` | `ProfileFormData` | Primary |

### Component Prop Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `ProfileCardProps` | `src/types/ui/props.ts` | `ProfileCardProps` | Primary |
| `src/types/index.ts` | `ButtonProps` | `src/types/ui/props.ts` | `ButtonProps` | Primary |

### Context Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/index.ts` | `ThemeContextType` | `src/types/core/context.ts` | `ThemeContextType` | Primary |
| `src/types/index.ts` | `ChatContextType` | `src/types/core/context.ts` | `ChatContextType` | Primary |

---

## 14. SEARCH FILTER TYPES

### SearchFilters Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/matching.ts` | `SearchFilters` | `src/types/api/filters.ts` | `SearchFilters` | Primary |
| `src/services/api/search.service.ts` | `SearchFilters` | `src/types/api/filters.ts` | `SearchFilters` | Remove |
| `src/hooks/useProfileSearch.ts` | `SearchFilters` | `src/types/api/filters.ts` | `SearchFilters` | Remove |
| `src/hooks/useAdvancedSearch.ts` | `SearchFilters` | `src/types/api/filters.ts` | `AdvancedSearchFilters` | Rename |
| `src/types/database.ts` | `ProfileSearchParams` | `src/types/api/filters.ts` | `SearchFilters` | Remove |

### Search Result Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/search.service.ts` | `SearchResult` | `src/types/domain/matching.ts` | `SearchResult` | Primary |
| `src/types/matching.ts` | `SearchResult` | `src/types/domain/matching.ts` | `SearchResult` | Remove |

---

## 15. VERIFICATION & PHOTO TYPES

### Verification Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/verification.service.ts` | `VerificationRequest` | `src/types/domain/verification.ts` | `VerificationRequest` | Primary |
| `src/hooks/useVerification.ts` | `VerificationRequest` | `src/types/domain/verification.ts` | `VerificationRequest` | Remove |

### Photo Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/services/api/photos.service.ts` | `Photo` | `src/types/domain/media.ts` | `Photo` | Primary |
| `src/services/api/photos.service.ts` | `PhotoUploadOptions` | `src/types/domain/media.ts` | `PhotoUploadOptions` | Primary |

---

## 16. SUCCESS STORY TYPES

### Success Story Consolidation

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/database.ts` | `DatabaseSuccessStory` | `src/types/domain/stories.ts` | `SuccessStory` | Primary |
| `src/services/api/success-stories.service.ts` | `SuccessStory` | `src/types/domain/stories.ts` | `SuccessStory` | Remove |
| `src/hooks/useSuccessStories.ts` | `SuccessStory` | `src/types/domain/stories.ts` | `SuccessStory` | Remove |

---

## 17. PROFILE VIEW & FAVORITE TYPES

### Profile View Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/database.ts` | `DatabaseProfileView` | `src/types/domain/interactions.ts` | `ProfileView` | Primary |
| `src/services/api/profile-views.service.ts` | `ProfileView` | `src/types/domain/interactions.ts` | `ProfileView` | Remove |

### Favorite Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/database.ts` | `DatabaseFavorite` | `src/types/domain/interactions.ts` | `Favorite` | Primary |
| `src/types/matching.ts` | `Favorite` | `src/types/domain/interactions.ts` | `Favorite` | Remove |

### Blocked User Types

| Old Location | Old Name | New Location | New Name | Status |
|---|---|---|---|---|
| `src/types/database.ts` | `DatabaseBlockedUser` | `src/types/domain/interactions.ts` | `BlockedUser` | Primary |

---

## Summary Statistics

- **Total Duplicate Types:** 30+
- **Total Type Definitions to Consolidate:** 100+
- **Files to Update:** 50+
- **New Type Files to Create:** 15
- **Type Definitions to Remove:** 70+
- **Type Definitions to Rename:** 5

---

## Implementation Order

1. Create core types (`common.ts`, `user.ts`, `auth.ts`)
2. Create domain types (all domain files)
3. Create API types (`requests.ts`, `responses.ts`, `filters.ts`)
4. Update `src/types/index.ts` to re-export
5. Update service imports
6. Update hook imports
7. Update component imports
8. Remove old type definitions
9. Run tests and verification

