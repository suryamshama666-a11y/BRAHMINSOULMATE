
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';
import { RealTimeMessage } from './types';

export const useMessageFetching = () => {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<RealTimeMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const mappedMessages: RealTimeMessage[] = (data || []).map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.content,
        message_type: (msg.message_type as RealTimeMessage['message_type']) || 'text',
        media_url: msg.media_url || undefined,
        read_at: msg.read_at || undefined,
        created_at: msg.created_at
      }));
      
      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    loading,
    fetchMessages
  };
};
