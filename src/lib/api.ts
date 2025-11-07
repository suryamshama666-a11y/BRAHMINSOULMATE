import { getSupabase } from '@/lib/getSupabase';
import { toast } from 'sonner';

// Define specific filter types to avoid excessive type depth
interface ProfileFilter {
  gender?: string;
  religion?: string;
  marital_status?: string;
  subscription_type?: string;
  height_min?: number;
  height_max?: number;
  caste?: string;
  [key: string]: any; // Allow other properties but with controlled depth
}

/**
 * Centralized API layer with caching and error handling
 */
class API {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes default TTL
  
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
    
    const cacheKey = `profiles_${page}_${limit}_${JSON.stringify(filter)}_${searchTerm}`;
    
    // Check cache first if enabled
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );

      const queryPromise = (async () => {
        let query = getSupabase().from('profiles').select('*');

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

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) throw error;
      
      // Store in cache
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      if (error.message === 'Request timeout') {
        console.warn('Profile request timed out, returning empty array');
      } else {
        toast.error('Failed to load profiles');
      }
      return [];
    }
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
      const { data, error } = await getSupabase()
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error(`Error fetching profile ${id}:`, error);
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
      const { data: currentProfile } = await getSupabase()
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!currentProfile) {
        return [];
      }

      // Get potential matches (opposite gender, same religion)
      const { data, error } = await getSupabase()
        .from('profiles')
        .select('*')
        .neq('user_id', userId)
        .eq('religion', currentProfile.religion)
        .neq('gender', currentProfile.gender)
        .limit(20);

      if (error) throw error;

      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data || [];
    } catch (error) {
      console.error(`Error fetching matches for ${userId}:`, error);
      toast.error('Failed to load matches');
      return [];
    }
  }
  
  /**
   * Send message
   */
  async sendMessage(message: { sender_id: string; receiver_id: string; content: string }) {
    try {
      const { data, error } = await getSupabase()
        .from('messages')
        .insert(message)
        .select();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
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
      const { data, error } = await getSupabase()
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load messages');
      return [];
    }
  }
  
  /**
   * Get dashboard stats for a user
   */
  async getDashboardStats(userId: string) {
    try {
      // Get profile views (mock for now)
      const profileViews = Math.floor(Math.random() * 500) + 100;

      // Get interests sent (mock for now)
      const interestsSent = Math.floor(Math.random() * 20) + 5;

      // Get actual message count
      const { count: messageCount } = await getSupabase()
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      // Get matches count
      const matches = await this.getMatches(userId);

      return {
        profileViews,
        interestsSent,
        messageCount: messageCount || 0,
        matchesCount: matches.length,
        vDatesCount: Math.floor(Math.random() * 5) + 1
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
      const { data, error } = await getSupabase()
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If events table doesn't exist or has issues, return mock data
        const mockEvents = [
          {
            id: '1',
            title: 'Brahmin Cultural Meet - Mumbai',
            description: 'Join us for a traditional cultural gathering with music, dance, and networking opportunities for young Brahmins.',
            date: '2025-08-15',
            time: '18:00',
            location: 'Mumbai, Maharashtra',
            max_participants: 50,
            event_type: 'cultural',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Spiritual Discourse & Meditation',
            description: 'A peaceful evening of spiritual discourse followed by guided meditation session.',
            date: '2025-08-20',
            time: '17:30',
            location: 'Bangalore, Karnataka',
            max_participants: 30,
            event_type: 'spiritual',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Traditional Cooking Workshop',
            description: 'Learn to prepare authentic Brahmin cuisine with expert chefs and connect with like-minded individuals.',
            date: '2025-08-25',
            time: '15:00',
            location: 'Chennai, Tamil Nadu',
            max_participants: 25,
            event_type: 'workshop',
            created_at: new Date().toISOString()
          }
        ];

        this.cache.set(cacheKey, { data: mockEvents, timestamp: Date.now() });
        return mockEvents;
      }

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: any) {
    try {
      const { data, error } = await getSupabase()
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
      console.error('Error updating profile:', error);
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