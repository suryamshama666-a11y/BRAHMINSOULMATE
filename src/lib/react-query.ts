/**
 * React Query Configuration
 * Centralized configuration for data fetching and caching
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Default options for all queries
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: Data is considered fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
    
    // Cache time: Data stays in cache for 30 minutes
    gcTime: 1000 * 60 * 30,
    
    // Retry failed requests once
    retry: 1,
    
    // Don't refetch on window focus by default
    refetchOnWindowFocus: false,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,
  },
};

// Create Query Client instance
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query Keys for consistent cache management
export const queryKeys = {
  // Profile queries
  profile: (userId: string) => ['profile', userId] as const,
  currentProfile: () => ['profile', 'current'] as const,
  profiles: (filters?: any) => ['profiles', filters] as const,
  onlineProfiles: () => ['profiles', 'online'] as const,
  newMembers: () => ['profiles', 'new'] as const,
  
  // Match queries
  matches: (userId: string) => ['matches', userId] as const,
  matchScore: (user1Id: string, user2Id: string) => ['match-score', user1Id, user2Id] as const,
  recommendations: (userId: string) => ['recommendations', userId] as const,
  
  // Interest queries
  interestsSent: (userId: string) => ['interests', 'sent', userId] as const,
  interestsReceived: (userId: string) => ['interests', 'received', userId] as const,
  interest: (interestId: string) => ['interest', interestId] as const,
  
  // Message queries
  conversations: (userId: string) => ['conversations', userId] as const,
  conversation: (user1Id: string, user2Id: string) => ['conversation', user1Id, user2Id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  
  // Subscription queries
  subscription: (userId: string) => ['subscription', userId] as const,
  subscriptions: () => ['subscriptions'] as const,
  
  // Event queries
  events: () => ['events'] as const,
  event: (eventId: string) => ['event', eventId] as const,
  eventRegistrations: (userId: string) => ['event-registrations', userId] as const,
  
  // Analytics queries
  analytics: (userId: string) => ['analytics', userId] as const,
  
  // Notification queries
  notifications: (userId: string) => ['notifications', userId] as const,
  
  // Connection queries
  connections: (userId: string) => ['connections', userId] as const,
  
  // Success stories queries
  successStories: () => ['success-stories'] as const,
  
  // Saved searches queries
  savedSearches: (userId: string) => ['saved-searches', userId] as const,
};

// Helper function to invalidate related queries
export const invalidateQueries = {
  profile: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.currentProfile() });
  },
  
  matches: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.matches(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations(userId) });
  },
  
  interests: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.interestsSent(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.interestsReceived(userId) });
  },
  
  messages: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations(userId) });
  },
  
  analytics: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics(userId) });
  },
  
  all: () => {
    queryClient.invalidateQueries();
  },
};

export default queryClient;
