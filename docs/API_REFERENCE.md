# API Reference - Brahmin Soulmate Connect

## Overview

This document provides a comprehensive reference for all API services in the Brahmin Soulmate Connect platform.

## Base Configuration

All services use the Supabase client configured in `src/lib/supabase.ts`.

```typescript
import { supabase } from '@/lib/supabase';
```

## Authentication Service

### Methods

#### `login(email, password)`
Authenticate user with email and password.

```typescript
const { user, session } = await AuthService.login(email, password);
```

#### `register(userData)`
Register a new user.

```typescript
const { user } = await AuthService.register({
  email: 'user@example.com',
  password: 'password123',
  full_name: 'John Doe'
});
```

#### `logout()`
Sign out current user.

```typescript
await AuthService.logout();
```

## Matching Service

### Methods

#### `calculateCompatibility(user, candidate)`
Calculate compatibility score between two users.

```typescript
const { score, factors } = matchingService.calculateCompatibility(user, candidate);
// Returns: { score: 85, factors: { age: 0.9, height: 0.8, ... } }
```

#### `getMatches(userId, limit)`
Get matches for a user.

```typescript
const matches = await matchingService.getMatches(userId, 20);
```

#### `calculateMatches(userId)`
Calculate and store matches for a user.

```typescript
await matchingService.calculateMatches(userId);
```

## Messages Service

### Methods

#### `sendMessage(receiverId, content)`
Send a message to another user.

```typescript
const message = await messagesService.sendMessage(receiverId, 'Hello!');
```

#### `getConversation(otherUserId, limit)`
Get conversation history with another user.

```typescript
const messages = await messagesService.getConversation(otherUserId, 50);
```

#### `getConversations()`
Get all conversations for current user.

```typescript
const conversations = await messagesService.getConversations();
```

#### `markAsRead(otherUserId)`
Mark all messages from a user as read.

```typescript
await messagesService.markAsRead(otherUserId);
```

#### `subscribeToMessages(callback)`
Subscribe to real-time messages.

```typescript
const unsubscribe = messagesService.subscribeToMessages((message) => {
  console.log('New message:', message);
});

// Later: unsubscribe();
```

## Interests Service

### Methods

#### `sendInterest(receiverId, message)`
Send interest to another user.

```typescript
await interestsService.sendInterest(receiverId, 'I would like to connect');
```

#### `getSentInterests()`
Get interests sent by current user.

```typescript
const interests = await interestsService.getSentInterests();
```

#### `getReceivedInterests()`
Get interests received by current user.

```typescript
const interests = await interestsService.getReceivedInterests();
```

#### `acceptInterest(interestId)`
Accept an interest request.

```typescript
await interestsService.acceptInterest(interestId);
```

#### `declineInterest(interestId)`
Decline an interest request.

```typescript
await interestsService.declineInterest(interestId);
```

## Payments Service

### Methods

#### `getPlans()`
Get all subscription plans.

```typescript
const plans = paymentsService.getPlans();
```

#### `initiatePayment(planId)`
Start payment flow for a subscription.

```typescript
await paymentsService.initiatePayment('premium_monthly');
```

#### `getCurrentSubscription()`
Get current active subscription.

```typescript
const subscription = await paymentsService.getCurrentSubscription();
```

#### `hasActiveSubscription()`
Check if user has active subscription.

```typescript
const isActive = await paymentsService.hasActiveSubscription();
```

#### `cancelSubscription()`
Cancel auto-renewal of subscription.

```typescript
await paymentsService.cancelSubscription();
```

## Photos Service

### Methods

#### `uploadPhoto(file, privacy, options)`
Upload a photo with privacy settings.

```typescript
const photo = await photosService.uploadPhoto(
  file,
  'public', // or 'premium', 'connections'
  { maxSizeMB: 1, maxWidthOrHeight: 1920 }
);
```

#### `getMyPhotos()`
Get current user's photos.

```typescript
const photos = await photosService.getMyPhotos();
```

#### `getUserPhotos(userId)`
Get another user's photos (with privacy filtering).

```typescript
const photos = await photosService.getUserPhotos(userId);
```

#### `deletePhoto(photoId)`
Delete a photo.

```typescript
await photosService.deletePhoto(photoId);
```

#### `setProfilePicture(photoId)`
Set a photo as profile picture.

```typescript
await photosService.setProfilePicture(photoId);
```

#### `updatePhotoPrivacy(photoId, privacy)`
Update photo privacy setting.

```typescript
await photosService.updatePhotoPrivacy(photoId, 'premium');
```

## Horoscope Service

### Methods

#### `saveHoroscope(horoscopeData)`
Save or update horoscope data.

```typescript
await horoscopeService.saveHoroscope({
  birth_date: '1990-01-01',
  birth_time: '10:30:00',
  birth_place: 'Mumbai',
  moon_sign: 'Aries',
  nakshatra: 'Ashwini',
  manglik_status: 'no'
});
```

#### `uploadHoroscopeFile(file)`
Upload horoscope PDF or image.

```typescript
const url = await horoscopeService.uploadHoroscopeFile(file);
```

#### `getMyHoroscope()`
Get current user's horoscope.

```typescript
const horoscope = await horoscopeService.getMyHoroscope();
```

#### `calculateCompatibility(horoscope1, horoscope2)`
Calculate horoscope compatibility.

```typescript
const { score, factors, details } = horoscopeService.calculateCompatibility(
  horoscope1,
  horoscope2
);
```

## Notifications Service

### Methods

#### `getNotifications(limit)`
Get user notifications.

```typescript
const notifications = await notificationsService.getNotifications(50);
```

#### `getUnreadCount()`
Get unread notification count.

```typescript
const count = await notificationsService.getUnreadCount();
```

#### `markAsRead(notificationId)`
Mark notification as read.

```typescript
await notificationsService.markAsRead(notificationId);
```

#### `markAllAsRead()`
Mark all notifications as read.

```typescript
await notificationsService.markAllAsRead();
```

#### `getPreferences()`
Get notification preferences.

```typescript
const prefs = await notificationsService.getPreferences();
```

#### `updatePreferences(preferences)`
Update notification preferences.

```typescript
await notificationsService.updatePreferences({
  email_enabled: true,
  sms_enabled: false,
  frequency: 'daily'
});
```

## Verification Service

### Methods

#### `submitVerification(documentType, file)`
Submit document for verification.

```typescript
await verificationService.submitVerification('id_proof', file);
```

#### `getMyVerifications()`
Get verification requests.

```typescript
const verifications = await verificationService.getMyVerifications();
```

#### `getVerificationStatus()`
Get verification status.

```typescript
const { isVerified, pendingRequests, approvedCount } = 
  await verificationService.getVerificationStatus();
```

## Events Service

### Methods

#### `getUpcomingEvents()`
Get upcoming events.

```typescript
const events = await eventsService.getUpcomingEvents();
```

#### `getEvent(eventId)`
Get event details.

```typescript
const event = await eventsService.getEvent(eventId);
```

#### `registerForEvent(eventId)`
Register for an event.

```typescript
await eventsService.registerForEvent(eventId);
```

#### `cancelRegistration(eventId)`
Cancel event registration.

```typescript
await eventsService.cancelRegistration(eventId);
```

#### `getMyRegistrations()`
Get user's event registrations.

```typescript
const registrations = await eventsService.getMyRegistrations();
```

## V-Dates Service

### Methods

#### `scheduleVDate(otherUserId, scheduledTime, duration)`
Schedule a video date.

```typescript
const vdate = await vdatesService.scheduleVDate(
  otherUserId,
  '2024-12-25T10:00:00Z',
  30 // duration in minutes
);
```

#### `getMyVDates()`
Get all V-Dates.

```typescript
const vdates = await vdatesService.getMyVDates();
```

#### `getUpcomingVDates()`
Get upcoming V-Dates.

```typescript
const vdates = await vdatesService.getUpcomingVDates();
```

#### `generateMeetingUrl(vdate)`
Generate Jitsi meeting URL.

```typescript
const url = vdatesService.generateMeetingUrl(vdate);
```

#### `cancelVDate(vdateId, reason)`
Cancel a V-Date.

```typescript
await vdatesService.cancelVDate(vdateId, 'Schedule conflict');
```

#### `submitFeedback(vdateId, rating, feedback)`
Submit post-call feedback.

```typescript
await vdatesService.submitFeedback(vdateId, 5, 'Great conversation!');
```

## Success Stories Service

### Methods

#### `submitStory(storyData)`
Submit a success story.

```typescript
await successStoriesService.submitStory({
  partnerId: 'user-id',
  title: 'Our Love Story',
  story: 'We met on Brahmin Soulmate Connect...',
  marriageDate: '2024-06-15',
  image: file
});
```

#### `getApprovedStories(limit)`
Get approved success stories.

```typescript
const stories = await successStoriesService.getApprovedStories(20);
```

#### `getMyStories()`
Get user's submitted stories.

```typescript
const stories = await successStoriesService.getMyStories();
```

## Forum Service

### Methods

#### `createPost(category, title, content)`
Create a forum post.

```typescript
const post = await forumService.createPost(
  'General Discussion',
  'Wedding Planning Tips',
  'Here are some tips...'
);
```

#### `getPosts(category, sortBy, limit)`
Get forum posts.

```typescript
const posts = await forumService.getPosts(
  'General Discussion',
  'recent', // or 'popular', 'views'
  20
);
```

#### `getPost(postId)`
Get post details.

```typescript
const post = await forumService.getPost(postId);
```

#### `toggleLike(postId)`
Like or unlike a post.

```typescript
const isLiked = await forumService.toggleLike(postId);
```

#### `addComment(postId, content)`
Add comment to post.

```typescript
const comment = await forumService.addComment(postId, 'Great post!');
```

#### `getComments(postId)`
Get post comments.

```typescript
const comments = await forumService.getComments(postId);
```

#### `reportContent(contentType, contentId, reason)`
Report inappropriate content.

```typescript
await forumService.reportContent('post', postId, 'Spam');
```

## Error Handling

All services throw errors that should be caught:

```typescript
try {
  await messagesService.sendMessage(receiverId, content);
} catch (error) {
  console.error('Failed to send message:', error.message);
  // Handle error appropriately
}
```

## React Query Integration

Services are designed to work with React Query:

```typescript
const { data: matches, isLoading } = useQuery({
  queryKey: ['matches', userId],
  queryFn: () => matchingService.getMatches(userId)
});
```

## Type Definitions

All services export TypeScript types:

```typescript
import type { 
  Match, 
  Message, 
  Interest,
  Photo,
  Horoscope 
} from '@/services/api';
```

## Rate Limiting

Some operations may be rate-limited:
- Interest sending: 5 per month (free users)
- Profile views: 10 per day (free users)
- Message sending: No limit for connected users

## Permissions

Operations require appropriate permissions:
- **Authenticated**: Most operations
- **Connected**: Messaging, V-Dates
- **Premium**: Advanced features
- **Admin**: Moderation, verification

## Best Practices

1. Always handle errors appropriately
2. Use React Query for caching
3. Implement optimistic updates where appropriate
4. Show loading states
5. Validate input before API calls
6. Use TypeScript types for type safety

## Support

For API issues or questions:
- Check error messages
- Review documentation
- Check GitHub issues
- Contact support

---

**Last Updated:** November 2024
**Version:** 1.0.0
