import { supabase, apiCall, APIResponse } from './base';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Message, Conversation } from '@/types';

class MessagesService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Send a message
  async sendMessage(receiverId: string, content: string): Promise<APIResponse<Message>> {
    return apiCall(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          message_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;
      
      const mappedMessage: Message = {
        ...data,
        content_type: (data as any).message_type || 'text'
      };
      
      return { data: mappedMessage, error: null };
    });
  }

  // Get conversation between two users
  async getConversation(otherUserId: string, limit: number = 50): Promise<APIResponse<Message[]>> {
    return apiCall(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      
      const mappedMessages = (data || []).map((msg: any) => ({
        ...msg,
        content_type: msg.message_type || 'text'
      })) as Message[];

      return { data: mappedMessages, error: null };
    });
  }

  // Get all conversations for current user
  async getConversations(): Promise<APIResponse<Conversation[]>> {
    return apiCall(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: messages, error } = await (supabase as any)
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationsMap = new Map<string, Conversation>();

      (messages || []).forEach((msg: any) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            id: partnerId,
            user_id: user.id, 
            partner_id: partnerId,
            last_message_content: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0,
            created_at: msg.created_at
          });
        }

        if (msg.receiver_id === user.id && !msg.read_at) {
          const conv = conversationsMap.get(partnerId)!;
          conv.unread_count = (conv.unread_count || 0) + 1;
        }
      });

      return { data: Array.from(conversationsMap.values()), error: null };
    });
  }

  // Mark messages as read
  async markAsRead(otherUserId: string): Promise<APIResponse<void>> {
    return apiCall(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await (supabase as any)
        .from('messages')
        .update({
          read_at: new Date().toISOString()
        })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id)
        .is('read_at', null);

      if (error) throw error;
      return { data: null, error: null };
    });
  }

  // Subscribe to messages for a conversation
  subscribeToConversation(otherUserId: string, callback: (message: Message) => void): () => void {
    const channelKey = `conversation:${otherUserId}`;
    if (this.channels.has(channelKey)) {
      return () => {};
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const channel = (supabase as any)
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id},sender_id=eq.${otherUserId}`
          },
          (payload: { new: Record<string, unknown> }) => {
            const mappedMessage: Message = {
              ...payload.new,
              content_type: (payload.new.message_type as string) || 'text'
            } as Message;
            callback(mappedMessage);
          }
        )
        .subscribe();

      this.channels.set(channelKey, channel);
    });

    return () => {
      const channel = this.channels.get(channelKey);
      if (channel) {
        channel.unsubscribe();
        this.channels.delete(channelKey);
      }
    };
  }

  // Subscribe to all messages for current user
  subscribeToMessages(callback: (message: Message) => void): () => void {
    const channelKey = 'messages:all';
    if (this.channels.has(channelKey)) {
      return () => {};
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const channel = (supabase as any)
        .channel(channelKey)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload: { new: Record<string, unknown> }) => {
            const mappedMessage: Message = {
              ...payload.new,
              content_type: (payload.new.message_type as string) || 'text'
            } as Message;
            callback(mappedMessage);
          }
        )
        .subscribe();

      this.channels.set(channelKey, channel);
    });

    return () => {
      const channel = this.channels.get(channelKey);
      if (channel) {
        channel.unsubscribe();
        this.channels.delete(channelKey);
      }
    };
  }

  // Subscribe to typing indicators
  subscribeToTyping(_partnerId: string, callback: (isTyping: boolean) => void): () => void {
    // For now, implement a simple polling-based typing indicator
    // In a real implementation, this would use a presence channel or separate table
    let typingTimeout: ReturnType<typeof setTimeout> | null = null;
    
    // Return cleanup function
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      callback(false);
    };
  }

  // Send typing indicator
  sendTypingIndicator(_partnerId: string, _isTyping: boolean): void {
    // For now, this is a no-op placeholder
    // In a real implementation, this would broadcast to a presence channel
  }
}

export const messagesService = new MessagesService();
export default messagesService;
