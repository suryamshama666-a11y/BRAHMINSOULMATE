import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type InterestRow = Database['public']['Tables']['interests']['Row'];
type ConnectionRow = Database['public']['Tables']['connections']['Row'];

export interface Interest extends InterestRow {
  sender?: unknown;
  receiver?: unknown;
}

export interface Connection extends ConnectionRow {
  user1?: unknown;
  user2?: unknown;
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
        message: message || null,
        status: 'pending'
      } as unknown as Database['public']['Tables']['interests']['Insert'])
      .select()
      .single();

    if (error) throw error;

    return data as unknown as Interest;
  }

  // Get interests sent by current user
  async getSentInterests(): Promise<Interest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Interest[];
  }

  // Get interests received by current user
  async getReceivedInterests(): Promise<Interest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Interest[];
  }

  // Accept an interest
  async acceptInterest(interestId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error: updateError } = await supabase
      .from('interests')
      .update({
        status: 'accepted'
      })
      .eq('id', interestId)
      .eq('receiver_id', user.id);

    if (updateError) throw updateError;
  }

  // Decline an interest
  async declineInterest(interestId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('interests')
      .update({
        status: 'declined'
      })
      .eq('id', interestId)
      .eq('receiver_id', user.id);

    if (error) throw error;
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
  async getConnections(): Promise<unknown[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'connected');

    if (error) throw error;

    return (data || []) as unknown[];
  }
}

export const interestsService = new InterestsService();
