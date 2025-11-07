
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';
import { Conversation, RealTimeMessage } from './types';

export const useConversations = () => {
  const { user } = useSupabaseAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
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

      const conversationMap = new Map<string, Conversation>();

      messageData?.forEach((msg: any) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const partnerProfile = msg.sender_id === user.id ? msg.receiver_profile : msg.sender_profile;

        if (!conversationMap.has(partnerId)) {
          const lastMessage: RealTimeMessage = {
            id: msg.id,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            content: msg.content,
            message_type: (msg.message_type as RealTimeMessage['message_type']) || 'text',
            media_url: msg.media_url || undefined,
            read_at: msg.read_at || undefined,
            created_at: msg.created_at
          };

          conversationMap.set(partnerId, {
            partner_id: partnerId,
            partner_profile: partnerProfile,
            last_message: lastMessage,
            unread_count: 0,
          });
        }

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

  return {
    conversations,
    setConversations,
    loading,
    fetchConversations
  };
};
