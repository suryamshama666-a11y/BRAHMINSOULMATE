import { supabase } from '@/lib/supabase';

export interface Interest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  created_at: string;
  responded_at?: string;
  sender?: any;
  receiver?: any;
}

class InterestsService {
  // Send interest to another user
  async sendInterest(receiverId: string, message: string): Promise<Interest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if interest already exists
    const { data: existing } = await supabase
      .from('interests')
      .select('*')
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId)
      .single();

    if (existing) {
      throw new Error('Interest already sent to this user');
    }

    const { data, error } = await supabase
      .from('interests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Update analytics
    await this.updateAnalytics(user.id, 'interests_sent');
    await this.updateAnalytics(receiverId, 'interests_received');

    return data;
  }

  // Get interests sent by current user
  async getSentInterests(): Promise<Interest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('interests')
      .select(`
        *,
        receiver:receiver_id (
          user_id,
          full_name,
          age,
          height,
          city,
          state,
          education,
          occupation,
          profile_picture
        )
      `)
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get interests received by current user
  async getReceivedInterests(): Promise<Interest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('interests')
      .select(`
        *,
        sender:sender_id (
          user_id,
          full_name,
          age,
          height,
          city,
          state,
          education,
          occupation,
          profile_picture,
          gotra,
          subcaste
        )
      `)
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Accept an interest
  async acceptInterest(interestId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the interest
    const { data: interest, error: fetchError } = await supabase
      .from('interests')
      .select('*')
      .eq('id', interestId)
      .eq('receiver_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!interest) throw new Error('Interest not found');

    // Update interest status
    const { error: updateError } = await supabase
      .from('interests')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString()
      })
      .eq('id', interestId);

    if (updateError) throw updateError;

    // Create connection (mutual match)
    await this.createConnection(interest.sender_id, user.id);

    // Send notification to sender
    await this.sendNotification(interest.sender_id, 'interest_accepted', {
      acceptedBy: user.id
    });
  }

  // Decline an interest
  async declineInterest(interestId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('interests')
      .update({
        status: 'declined',
        responded_at: new Date().toISOString()
      })
      .eq('id', interestId)
      .eq('receiver_id', user.id);

    if (error) throw error;
  }

  // Create a connection between two users
  private async createConnection(user1Id: string, user2Id: string): Promise<void> {
    const { error } = await supabase
      .from('connections')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        status: 'connected'
      });

    if (error && !error.message.includes('duplicate')) {
      throw error;
    }
  }

  // Check if users are connected
  async areConnected(userId1: string, userId2: string): Promise<boolean> {
    const { data } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
      .eq('status', 'connected')
      .single();

    return !!data;
  }

  // Get all connections for current user
  async getConnections(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        user1:user1_id (
          user_id,
          full_name,
          age,
          city,
          profile_picture
        ),
        user2:user2_id (
          user_id,
          full_name,
          age,
          city,
          profile_picture
        )
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'connected');

    if (error) throw error;

    // Return the other user's profile
    return (data || []).map(conn => {
      return conn.user1_id === user.id ? conn.user2 : conn.user1;
    });
  }

  // Update user analytics
  private async updateAnalytics(userId: string, field: string): Promise<void> {
    const { error } = await supabase.rpc('increment_analytics', {
      p_user_id: userId,
      p_field: field
    });

    if (error) console.error('Analytics update failed:', error);
  }

  // Send notification
  private async sendNotification(userId: string, type: string, data: any): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        data,
        read: false
      });

    if (error) console.error('Notification failed:', error);
  }
}

export const interestsService = new InterestsService();
