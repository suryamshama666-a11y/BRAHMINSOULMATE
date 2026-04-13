
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export interface EnhancedMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string;
  read_at?: string;
  created_at: string;
  reply_to_id?: string;
  file_name?: string;
  file_size?: number;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  partner_id: string;
  partner_profile: any;
  last_message: EnhancedMessage;
  unread_count: number;
}

export const useEnhancedMessages = () => {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${conversationId},receiver_id.eq.${conversationId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedMessages: EnhancedMessage[] = (data || []).map(message => ({
        ...message,
        message_type: (message.message_type as EnhancedMessage['message_type']) || 'text',
        status: 'sent' as const,
        media_url: message.media_url || undefined,
        read_at: message.read_at || undefined
      }));

      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get all unique conversation partners
      const { data: messageData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!sender_id(*),
          receiver_profile:profiles!receiver_id(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();

      messageData?.forEach((msg: any) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const partnerProfile = msg.sender_id === user.id ? msg.receiver_profile : msg.sender_profile;

        if (!conversationMap.has(partnerId)) {
          const lastMessage: EnhancedMessage = {
            id: msg.id,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            content: msg.content,
            message_type: (msg.message_type as EnhancedMessage['message_type']) || 'text',
            media_url: msg.media_url || undefined,
            read_at: msg.read_at || undefined,
            created_at: msg.created_at,
            status: 'sent'
          };

          conversationMap.set(partnerId, {
            partner_id: partnerId,
            partner_profile: partnerProfile,
            last_message: lastMessage,
            unread_count: 0,
          });
        }

        // Count unread messages
        if (msg.receiver_id === user.id && !msg.read_at) {
          const conv = conversationMap.get(partnerId)!;
          conv.unread_count++;
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const sendEnhancedMessage = async (messageData: {
    receiver_id: string;
    content: string;
    message_type?: EnhancedMessage['message_type'];
    media_url?: string;
    file_name?: string;
    file_size?: number;
    reply_to_id?: string;
  }) => {
    if (!user) {
      toast.error('Please login to send messages');
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: messageData.receiver_id,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          media_url: messageData.media_url || null
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: EnhancedMessage = {
        ...data,
        message_type: (data.message_type as EnhancedMessage['message_type']) || 'text',
        status: 'sent',
        file_name: messageData.file_name,
        file_size: messageData.file_size,
        reply_to_id: messageData.reply_to_id,
        media_url: data.media_url || undefined,
        read_at: data.read_at || undefined
      };

      setMessages(prev => [...prev, newMessage]);
      return { success: true, message: newMessage };
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return { success: false, error: error.message };
    }
  };

  // Add alias for compatibility
  const sendMessage = sendEnhancedMessage;

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, read_at: new Date().toISOString(), status: 'read' as const }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return {
    messages,
    conversations,
    loading,
    fetchMessages,
    fetchConversations,
    sendEnhancedMessage,
    sendMessage, // Add alias for compatibility
    markAsRead
  };
};
