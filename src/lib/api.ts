import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

// Define specific filter types to avoid excessive type depth
interface ProfileFilter {
  gender?: string;
  religion?: string;
  marital_status?: string;
  subscription_type?: string;
  height_min?: number;
  height_max?: number;
  caste?: string;
}

/**
 * Centralized API layer with caching and error handling
 */
class API {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes default TTL
  private pendingRequests = new Map<string, Promise<unknown>>();
  
  /**
   * Generate a stable cache key from an object
   * Sorts keys to prevent collision from different key orders
   */
  private generateCacheKey(prefix: string, params: Record<string, unknown>): string {
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = sortedKeys.reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, unknown>);
    return `${prefix}_${JSON.stringify(sortedParams)}`;
  }
  
  /**
   * Deduplicate concurrent requests for the same resource
   */
  private async dedupeRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // If there's already a pending request for this key, return it
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }
    
    // Create new request
    const promise = fetcher().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
  
  /**
   * Get profiles with optional filtering
   */
  async getProfiles(options: { 
    page?: number; 
    limit?: number; 
    filter?: ProfileFilter;
    searchTerm?: string;
    useCache?: boolean;
  } = {}) {
    const { 
      page = 1, 
      limit = 20, 
      filter = {}, 
      searchTerm = '',
      useCache = true 
    } = options;
    
    const cacheKey = this.generateCacheKey('profiles', { page, limit, filter, searchTerm });
    
    // Check cache first if enabled
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }
    
    // Deduplicate concurrent requests
    return this.dedupeRequest(cacheKey, async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 8000)
        );

        const queryPromise = (async () => {
          let query = supabase.from('profiles').select('*');

          // Apply simple filters directly based on actual schema
          if (filter.gender) query = query.eq('gender', filter.gender);
          if (filter.religion) query = query.eq('religion', filter.religion);
          if (filter.marital_status) query = query.eq('marital_status', filter.marital_status);
          if (filter.subscription_type) query = query.eq('subscription_type', filter.subscription_type);
          if (filter.caste) query = query.eq('caste', filter.caste);

          // Apply range filters
          if (filter.height_min) query = query.gte('height', filter.height_min);
          if (filter.height_max) query = query.lte('height', filter.height_max);

          // Apply search if provided - search in available fields
          if (searchTerm) {
            query = query.or(`gender.ilike.%${searchTerm}%,religion.ilike.%${searchTerm}%,caste.ilike.%${searchTerm}%`);
          }

          // Apply pagination
          const from = (page - 1) * limit;
          const to = from + limit - 1;
          query = query.range(from, to);

          return await query;
        })();

        const result = await Promise.race([queryPromise, timeoutPromise]) as { data: unknown; error: unknown };
        
        if (result.error) throw result.error;
        
        // Store in cache
        this.cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
        
        return result.data;
      } catch (error) {
        logger.error('Error fetching profiles:', error);
        if ((error as Error).message === 'Request timeout') {
          logger.warn('Profile request timed out, returning empty array');
        }
        // Don't show toast error - let the calling component handle it
        return [];
      }
    });
  }
  
  /**
   * Get single profile by ID
   */
  async getProfileById(id: string, useCache = true) {
    const cacheKey = `profile_${id}`;
    
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      logger.error(`Error fetching profile ${id}:`, error);
      toast.error('Failed to load profile');
      return null;
    }
  }
  

  
  /**
   * Get matches for a user - using profiles as matches since matches table doesn't exist
   */
  async getMatches(userId: string, useCache = true) {
    const cacheKey = `matches_${userId}`;

    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }

    try {
      // Get current user's profile first
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!currentProfile) {
        return [];
      }

      // Get potential matches (opposite gender, same religion)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', userId)
        .eq('religion', currentProfile.religion as string)
        .neq('gender', currentProfile.gender)
        .limit(20);

      if (error) throw error;

      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data || [];
    } catch (error) {
      logger.error(`Error fetching matches for ${userId}:`, error);
      toast.error('Failed to load matches');
      return [];
    }
  }
  
  /**
   * Send message
   */
  async sendMessage(message: { sender_id: string; receiver_id: string; content: string }) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      logger.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    }
  }
  
  /**
   * Get conversation messages
   */
  async getConversation(user1Id: string, user2Id: string, useCache = true) {
    const cacheKey = `conversation_${user1Id}_${user2Id}`;
    
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 30000) { // Shorter TTL for messages
        return cached.data;
      }
    }
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      logger.error('Error fetching conversation:', error);
      toast.error('Failed to load messages');
      return [];
    }
  }
  
  /**
   * Get dashboard stats for a user
   * Returns actual counts from database
   */
  async getDashboardStats(userId: string) {
    try {
      // Get actual message count
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      const msgCount: number = typeof messageCount === 'number' ? messageCount : Number(messageCount) || 0;

      // Get matches count
      const matches = await this.getMatches(userId) as unknown[];
      const matchesCount: number = Array.isArray(matches) ? matches.length : 0;

      // Get profile views count
      const client: any = supabase;
      const { count: profileViewsCount } = await client
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewed_profile_id', userId);

      const profileViews: number = typeof profileViewsCount === 'number' ? profileViewsCount : Number(profileViewsCount) || 0;

      // Get interests count
      const { count: interestsCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('user1_id', userId);

      const interestsSent: number = typeof interestsCount === 'number' ? interestsCount : Number(interestsCount) || 0;

      // Get v-dates count
      const { count: vDatesCount } = await supabase
        .from('vdates')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

      const vDates: number = typeof vDatesCount === 'number' ? vDatesCount : Number(vDatesCount) || 0;

      return {
        profileViews,
        interestsSent,
        messageCount: msgCount,
        matchesCount: matchesCount,
        vDatesCount: vDates
      };
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      return {
        profileViews: 0,
        interestsSent: 0,
        messageCount: 0,
        matchesCount: 0,
        vDatesCount: 0
      };
    }
  }

  /**
   * Get events
   */
  async getEvents(useCache = true) {
    const cacheKey = 'events';

    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.warn('Events table query failed, returning empty array');
        this.cache.set(cacheKey, { data: [], timestamp: Date.now() });
        return [];
      }

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data || [];
    } catch (error) {
      logger.error('Error fetching events:', error);
      return [];
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Record<string, unknown>>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      // Clear relevant caches
      this.cache.delete(`profile_${userId}`);

      return data;
    } catch (error) {
      logger.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return null;
    }
  }

  /**
   * Clear cache item or all cache
   */
  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// Export a singleton instance
export const api = new API();

// Also export the class for testing
export { API as ApiClient }; 