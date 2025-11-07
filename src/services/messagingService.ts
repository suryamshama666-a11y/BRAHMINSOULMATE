import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export class MessagingService {
  // Send a message
  static async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for receiver
      await this.createNotification(
        receiverId,
        'new_message',
        'New Message',
        'You have received a new message',
        `/messages/${senderId}`,
        senderId
      );

      return data;
    } catch (error) {
      console.error('Send message error:', error);
      return null;
    }
  }

  // Get conversation between two users
  static async getConversation(userId1: string, userId2: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get conversation error:', error);
      return [];
    }
  }

  // Get all conversations for a user
  static async getConversations(userId: string): Promise<Array<{
    profile: Profile;
    lastMessage: Message;
    unreadCount: number;
  }>> {
    try {
      // Get all unique conversation partners
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('receiver_id, created_at')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false });

      if (sentError || receivedError) throw sentError || receivedError;

      // Combine and get unique conversation partners
      const allPartners = new Set<string>();
      sentMessages?.forEach(msg => allPartners.add(msg.receiver_id));
      receivedMessages?.forEach(msg => allPartners.add(msg.sender_id));

      const conversations = [];

      for (const partnerId of allPartners) {
        // Get partner profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .single();

        if (!profile) continue;

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('id')
          .eq('sender_id', partnerId)
          .eq('receiver_id', userId)
          .eq('read', false);

        conversations.push({
          profile,
          lastMessage: lastMessage || null,
          unreadCount: unreadMessages?.length || 0
        });
      }

      // Sort by last message timestamp
      conversations.sort((a, b) => {
        const timeA = a.lastMessage?.created_at || '0';
        const timeB = b.lastMessage?.created_at || '0';
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });

      return conversations;
    } catch (error) {
      console.error('Get conversations error:', error);
      return [];
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(senderId: string, receiverId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Mark messages as read error:', error);
      return false;
    }
  }

  // Get unread message count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', userId)
        .eq('read', false);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  // Delete message
  static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      // Only allow deletion if user is the sender
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete message error:', error);
      return false;
    }
  }

  // Subscribe to new messages in real-time
  static subscribeToMessages(userId: string, callback: (message: Message) => void) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  // Subscribe to message updates (read status)
  static subscribeToMessageUpdates(userId: string, callback: (message: Message) => void) {
    return supabase
      .channel('message-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  // Check if users can message each other (must be connected)
  static async canMessage(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id')
        .eq('user_id', userId)
        .eq('match_id', targetUserId)
        .eq('status', 'accepted')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Can message check error:', error);
      return false;
    }
  }

  // Block user
  static async blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          user_id: userId,
          blocked_user_id: blockedUserId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Block user error:', error);
      return false;
    }
  }

  // Unblock user
  static async unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', userId)
        .eq('blocked_user_id', blockedUserId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Unblock user error:', error);
      return false;
    }
  }

  // Get blocked users
  static async getBlockedUsers(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_user_id')
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map(item => item.blocked_user_id) || [];
    } catch (error) {
      console.error('Get blocked users error:', error);
      return [];
    }
  }

  // Create notification helper
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

  // Send typing indicator
  static async sendTypingIndicator(senderId: string, receiverId: string): Promise<void> {
    try {
      // Use Supabase realtime to send typing indicator
      const channel = supabase.channel(`typing-${receiverId}`);
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { senderId, isTyping: true }
      });
    } catch (error) {
      console.error('Send typing indicator error:', error);
    }
  }

  // Stop typing indicator
  static async stopTypingIndicator(senderId: string, receiverId: string): Promise<void> {
    try {
      const channel = supabase.channel(`typing-${receiverId}`);
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { senderId, isTyping: false }
      });
    } catch (error) {
      console.error('Stop typing indicator error:', error);
    }
  }
}