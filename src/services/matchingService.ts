import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';
import { logger } from '@/utils/logger';

type Match = Database['public']['Tables']['matches']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export class MatchingService {
  // Send interest to a profile
  static async sendInterest(userId: string, targetProfileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          user1_id: userId,
          user2_id: targetProfileId,
          compatibility_score: 0,
          status: 'pending'
        } as unknown as Database['public']['Tables']['matches']['Insert']);

      if (error) throw error;

      // Create notification for the target user
      await this.createNotification(
        targetProfileId,
        'interest_received',
        'New Interest Received',
        'Someone has expressed interest in your profile',
        `/profile/${userId}`,
        userId
      );

      return true;
    } catch (error) {
      logger.error('Send interest error:', error);
      throw error;
    }
  }

  // Accept interest
  static async acceptInterest(matchId: string): Promise<boolean> {
    try {
      const { error: updateError } = await supabase
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (updateError) throw updateError;

      // Notify the original sender
      await this.createNotification(
        '',
        'interest_accepted',
        'Interest Accepted!',
        'Your interest has been accepted. You can now start messaging!',
        `/messages/`,
        ''
      );

      return true;
    } catch (error) {
      logger.error('Accept interest error:', error);
      throw error;
    }
  }

  // Decline interest
  static async declineInterest(matchId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'declined' })
        .eq('id', matchId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Decline interest error:', error);
      throw error;
    }
  }

  // Get sent interests
  static async getSentInterests(userId: string): Promise<Match[]> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('user1_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Match[];
    } catch (error) {
      logger.error('Get sent interests error:', error);
      return [];
    }
  }

  // Get received interests
  static async getReceivedInterests(userId: string): Promise<Match[]> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('user2_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Match[];
    } catch (error) {
      logger.error('Get received interests error:', error);
      return [];
    }
  }

  // Get mutual matches (connections)
  static async getConnections(userId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return (data || []) as unknown as Profile[];
    } catch (error) {
      logger.error('Get connections error:', error);
      return [];
    }
  }

  // Get recommended matches based on preferences
  static async getRecommendedMatches(userId: string, limit: number = 10): Promise<Profile[]> {
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!userProfile) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', userId)
        .eq('verified', true)
        .limit(limit)
        .order('last_active', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Profile[];
    } catch (error) {
      logger.error('Get recommended matches error:', error);
      return [];
    }
  }

  // Calculate compatibility score between two profiles
  calculateCompatibility(profile1: any, profile2: any): number {
    return MatchingService.calculateCompatibilityScore(profile1, profile2);
  }

  // Get matches for a user
  async getMatches(userId: string): Promise<any[]> {
    return MatchingService.getRecommendedMatches(userId);
  }

  // Calculate compatibility score between two profiles
  static calculateCompatibilityScore(profile1: Profile, profile2: Profile): number {
    let score = 0;
    let factors = 0;

    // Age compatibility
    const ageDiff = Math.abs(profile1.age - profile2.age);
    if (ageDiff <= 2) score += 25;
    else if (ageDiff <= 5) score += 20;
    else if (ageDiff <= 10) score += 15;
    else score += 5;
    factors++;

    // Caste compatibility
    if (profile1.caste === profile2.caste) {
      score += 20;
    }
    factors++;

    return Math.round(score / factors) || 0;
  }

  // Create notification
  private static async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
    senderId?: string
  ) {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          action_url: actionUrl || null,
          sender_id: senderId || null,
          read: false,
          timestamp: new Date().toISOString()
        } as unknown as Database['public']['Tables']['notifications']['Insert']);
    } catch (error) {
      logger.error('Create notification error:', error);
    }
  }

  // Add to favorites
  static async addToFavorites(userId: string, profileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          profile_id: profileId
        } as unknown as Database['public']['Tables']['favorites']['Insert']);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Add to favorites error:', error);
      return false;
    }
  }

  // Remove from favorites
  static async removeFromFavorites(userId: string, profileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('profile_id', profileId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Remove from favorites error:', error);
      return false;
    }
  }

  // Get favorites
  static async getFavorites(userId: string): Promise<Profile[]> {
    try {
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('profile_id')
        .eq('user_id', userId);

      if (favError) throw favError;

      if (!favorites || favorites.length === 0) return [];

      const profileIds = favorites.map(f => f.profile_id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', profileIds);

      if (error) throw error;
      return (data || []) as unknown as Profile[];
    } catch (error) {
      logger.error('Get favorites error:', error);
      return [];
    }
  }
}
