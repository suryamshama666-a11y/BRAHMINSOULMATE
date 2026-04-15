import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type MessageRow = Database['public']['Tables']['messages']['Row'];

export interface Message extends MessageRow {
  sender?: unknown;
  receiver?: unknown;
}

export interface Conversation {
  user_id: string;
  full_name?: string;
  profile_picture?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

class MessagesService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Send a message
  async sendMessage(receiverId: string, content: string): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        message_type: 'text',
        attachment_url: null,
      } as any)
      .select()
      .single();

    if (error) throw error;

    return data as unknown as Message;
  }

  // Get conversation between two users
  async getConversation(otherUserId: string, limit: number = 50): Promise<Message[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as Message[];
  }

  // Get all conversations for current user
  async getConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const conversationsMap = new Map<string, Conversation>();

    messages?.forEach(msg => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          user_id: partnerId,
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread_count: 0
        });
      }

      if (msg.receiver_id === user.id && !msg.read_at) {
        const conv = conversationsMap.get(partnerId)!;
        conv.unread_count++;
      }
    });

    return Array.from(conversationsMap.values());
  }

  // Mark messages as read
  async markAsRead(otherUserId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('messages')
      .update({
        read_at: new Date().toISOString()
      })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', user.id)
      .is('read_at', null);

    if (error) throw error;
  }

  // Subscribe to new messages
  subscribeToMessages(callback: (message: Message) => void): () => void {
    const userPromise = supabase.auth.getUser();
    
    userPromise.then(({ data: { user } }) => {
      if (!user) return;

      const channelName = `messages:${user.id}`;
      
      if (this.channels.has(channelName)) {
        this.channels.get(channelName)?.unsubscribe();
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          async (payload) => {
            callback(payload.new as unknown as Message);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    });

    return () => {
      userPromise.then(({ data: { user } }) => {
        if (user) {
          const channelName = `messages:${user.id}`;
          this.channels.get(channelName)?.unsubscribe();
          this.channels.delete(channelName);
        }
      });
    };
  }

  // Subscribe to typing indicators
  subscribeToTyping(otherUserId: string, callback: (isTyping: boolean) => void): () => void {
    const channelName = `typing:${otherUserId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, (payload) => {
        callback(payload.payload.isTyping);
      })
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      this.channels.get(channelName)?.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Send typing indicator
  async sendTypingIndicator(_receiverId: string, isTyping: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase.channel(`typing:${user.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { isTyping, userId: user.id }
    });
  }

  // Get unread message count
  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', user.id);

    if (error) throw error;
  }
}

export const messagesService = new MessagesService();
