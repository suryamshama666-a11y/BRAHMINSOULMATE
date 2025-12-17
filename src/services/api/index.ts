/**
 * API Services Index
 * Central export point for all API services
 */

export * from './base';
export { default as AuthService } from './auth.service';
export { default as ProfilesService } from './profiles.service';
export { default as StorageService } from './storage.service';
export { default as SearchService } from './search.service';
export { matchingService } from './matching.service';
export { messagesService } from './messages.service';
export { interestsService } from './interests.service';
export { paymentsService } from './payments.service';
export { photosService } from './photos.service';
export { horoscopeService } from './horoscope.service';
export { notificationsService } from './notifications.service';
export { verificationService } from './verification.service';
export { eventsService } from './events.service';
export { vdatesService } from './vdates.service';
export { successStoriesService } from './success-stories.service';
export { forumService } from './forum.service';
export { profileViewsService } from './profile-views.service';

// Re-export types
export type { UserProfile } from '@/types';
export type { LoginCredentials, RegisterData, AuthResponse } from './auth.service';
export type { SearchFilters, SearchResult } from './search.service';
export type { Match, CompatibilityFactors } from './matching.service';
export type { Message, Conversation } from './messages.service';
export type { Interest } from './interests.service';
export type { SubscriptionPlan, Payment, Subscription } from './payments.service';
export type { Photo } from './photos.service';
export type { Horoscope, HoroscopeCompatibility } from './horoscope.service';
export type { Notification, NotificationPreferences } from './notifications.service';
export type { VerificationRequest } from './verification.service';
export type { Event, EventRegistration } from './events.service';
export type { VDate, VDateFeedback } from './vdates.service';
export type { SuccessStory } from './success-stories.service';
export type { ForumPost, ForumComment, ForumReport } from './forum.service';
