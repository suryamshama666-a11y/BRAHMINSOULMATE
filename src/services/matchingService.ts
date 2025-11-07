import { getSupabase } from '@/lib/getSupabase';
import { Database } from '@/types/supabase';

type Match = Database['public']['Tables']['matches']['Row'];
type MatchInsert = Database['public']['Tables']['matches']['Insert'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export class MatchingService {
  // Send interest to a profile
  static async sendInterest(userId: string, targetProfileId: string): Promise<boolean> {
    try {
      // Check if interest already exists
      const { data: existingMatch } = await getSupabase()
        .from('matches')
        .select('id')
        .eq('user_id', userId)
        .eq('match_id', targetProfileId)
        .single();

      if (existingMatch) {
        throw new Error('Interest already sent to this profile');
      }

      const { error } = await getSupabase()
        .from('matches')
        .insert({
          user_id: userId,
          match_id: targetProfileId,
          status: 'pending'
        });

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
      console.error('Send interest error:', error);
      throw error;
    }
  }

  // Accept interest
  static async acceptInterest(matchId: string): Promise<boolean> {
    try {
      const { data: match, error: fetchError } = await getSupabase()
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      // Update match status to accepted
      const { error: updateError } = await getSupabase()
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (updateError) throw updateError;

      // Create reverse match (mutual connection)
      const { error: reverseError } = await getSupabase()
        .from('matches')
        .insert({
          user_id: match.match_id,
          match_id: match.user_id,
          status: 'accepted'
        });

      if (reverseError) throw reverseError;

      // Notify the original sender
      await this.createNotification(
        match.user_id,
        'interest_accepted',
        'Interest Accepted!',
        'Your interest has been accepted. You can now start messaging!',
        `/messages/${match.match_id}`,
        match.match_id
      );

      return true;
    } catch (error) {
      console.error('Accept interest error:', error);
      throw error;
    }
  }

  // Decline interest
  static async declineInterest(matchId: string): Promise<boolean> {
    try {
      const { error } = await getSupabase()
        .from('matches')
        .update({ status: 'declined' })
        .eq('id', matchId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Decline interest error:', error);
      throw error;
    }
  }

  // Get sent interests
  static async getSentInterests(userId: string): Promise<(Match & { profile: Profile })[]> {
    try {
      const { data, error } = await getSupabase()
        .from('matches')
        .select(`
          *,
          profile:profiles!matches_match_id_fkey(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get sent interests error:', error);
      return [];
    }
  }

  // Get received interests
  static async getReceivedInterests(userId: string): Promise<(Match & { profile: Profile })[]> {
    try {
      const { data, error } = await getSupabase()
        .from('matches')
        .select(`
          *,
          profile:profiles!matches_user_id_fkey(*)
        `)
        .eq('match_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get received interests error:', error);
      return [];
    }
  }

  // Get mutual matches (connections)
  static async getConnections(userId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          profile:profiles!matches_match_id_fkey(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data?.map(item => item.profile).filter(Boolean) || [];
    } catch (error) {
      console.error('Get connections error:', error);
      return [];
    }
  }

  // Get recommended matches based on preferences
  static async getRecommendedMatches(userId: string, limit: number = 10): Promise<Profile[]> {
    try {
      // Get user's profile and preferences
      const { data: userProfile } = await getSupabase()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userProfile) return [];

      // Get profiles that match user's preferences
      let query = getSupabase()
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .eq('verified', true);

      // Filter by opposite gender
      const targetGender = userProfile.gender === 'male' ? 'female' : 'male';
      query = query.eq('gender', targetGender);

      // Apply preference filters if they exist
      if (userProfile.preferences) {
        const prefs = userProfile.preferences as any;
        
        if (prefs.ageMin && prefs.ageMax) {
          query = query.gte('age', prefs.ageMin).lte('age', prefs.ageMax);
        }
        
        if (prefs.heightMin && prefs.heightMax) {
          query = query.gte('height', prefs.heightMin).lte('height', prefs.heightMax);
        }
        
        if (prefs.caste) {
          query = query.eq('caste', prefs.caste);
        }
        
        if (prefs.maritalStatus) {
          query = query.in('marital_status', prefs.maritalStatus);
        }
      }

      // Exclude profiles user has already interacted with
      const { data: existingMatches } = await getSupabase()
        .from('matches')
        .select('match_id')
        .eq('user_id', userId);

      if (existingMatches && existingMatches.length > 0) {
        const excludeIds = existingMatches.map(m => m.match_id);
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data, error } = await query
        .limit(limit)
        .order('last_active', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get recommended matches error:', error);
      return [];
    }
  }

  // Calculate compatibility score between two profiles
  static calculateCompatibilityScore(profile1: Profile, profile2: Profile): number {
    let score = 0;
    let factors = 0;

    // Age compatibility (closer ages get higher scores)
    const ageDiff = Math.abs(profile1.age - profile2.age);
    if (ageDiff <= 2) score += 25;
    else if (ageDiff <= 5) score += 20;
    else if (ageDiff <= 10) score += 15;
    else score += 5;
    factors++;

    // Location compatibility
    if (profile1.location && profile2.location) {
      const loc1 = profile1.location as any;
      const loc2 = profile2.location as any;
      if (loc1.city === loc2.city) score += 20;
      else if (loc1.state === loc2.state) score += 15;
      else if (loc1.country === loc2.country) score += 10;
      factors++;
    }

    // Caste compatibility
    if (profile1.caste === profile2.caste) {
      score += 20;
    }
    factors++;

    // Education compatibility
    if (profile1.education && profile2.education) {
      const edu1 = profile1.education as any;
      const edu2 = profile2.education as any;
      if (edu1.level === edu2.level) score += 15;
      factors++;
    }

    // Interest compatibility
    if (profile1.interests && profile2.interests) {
      const commonInterests = profile1.interests.filter(interest => 
        profile2.interests.includes(interest)
      );
      score += Math.min(commonInterests.length * 5, 20);
      factors++;
    }

    return Math.round(score / factors);
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
          action_url: actionUrl,
          sender_id: senderId,
          read: false,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Create notification error:', error);
    }
  }

  // Add to favorites
  static async addToFavorites(userId: string, profileId: string): Promise<boolean> {
    try {
      // Check if already in favorites
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .single();

      if (existing) return true;

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          profile_id: profileId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Add to favorites error:', error);
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
      console.error('Remove from favorites error:', error);
      return false;
    }
  }

  // Get favorites
  static async getFavorites(userId: string): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          profile:profiles(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(item => item.profile).filter(Boolean) || [];
    } catch (error) {
      console.error('Get favorites error:', error);
      return [];
    }
  }
}