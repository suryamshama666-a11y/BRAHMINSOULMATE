/**
 * API Services Index
 * Central export point for all API services
 */

export * from './base';
export { default as AuthService } from './auth.service';
export { ProfilesService } from './profiles.service';
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
export { blogService } from './blog.service';
export { StatsService } from './stats.service';

// Types are available via @/types
