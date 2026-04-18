import { supabase, apiCall, APIResponse } from './base';
import { getCurrentUser, requireAuth } from '@/utils/authHelpers';

export interface Interest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string | null;
  created_at: string;
  sender?: any;
  receiver?: any;
}

export interface Connection {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: 'pending' | 'connected' | 'rejected';
  created_at: string;
  updated_at: string;
  user1?: any;
  user2?: any;
}

class InterestsService {
  // Send interest to another user
  async sendInterest(receiverId: string, message: string): Promise<Interest> {
    const user = await requireAuth();

    // Check if interest already exists
    const { data: existing } = await (supabase as any)
      .from('interests')
      .select('*')
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId)
      .maybeSingle();

    if (existing) {
      throw new Error('Interest already sent to this user');
    }

    const { data, error } = await (supabase as any)
      .from('interests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: message || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return data as Interest;
  }

  // Get interests sent by current user
  async getSentInterests(): Promise<Interest[]> {
    const user = await requireAuth();

    const { data, error } = await (supabase as any)
      .from('interests')
      .select('*')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Interest[];
  }

  // Get interests received by current user
  async getReceivedInterests(): Promise<Interest[]> {
    const user = await requireAuth();

    const { data, error } = await (supabase as any)
      .from('interests')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Interest[];
  }

  // Accept an interest
  async acceptInterest(interestId: string): Promise<void> {
    const user = await requireAuth();

    const { error: updateError } = await (supabase as any)
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
    const user = await requireAuth();

    const { error } = await (supabase as any)
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
    const { data } = await (supabase as any)
      .from('connections')
      .select('id')
      .or(`and(user_id_1.eq.${userId1},user_id_2.eq.${userId2}),and(user_id_1.eq.${userId2},user_id_2.eq.${userId1})`)
      .eq('status', 'connected')
      .maybeSingle();

    return !!data;
  }

  // Get all connections for current user
  async getConnections(): Promise<Connection[]> {
    const user = await requireAuth();

    const { data, error } = await (supabase as any)
      .from('connections')
      .select('*')
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .eq('status', 'connected');

    if (error) throw error;

    return (data || []) as Connection[];
  }
}

export const interestsService = new InterestsService();
