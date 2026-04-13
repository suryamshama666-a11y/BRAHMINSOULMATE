
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';
import { RealTimeMessage } from './types';

export const useRealTimeSubscription = (
  onNewMessage: (message: RealTimeMessage) => void
) => {
  const { user } = useSupabaseAuth();

  // effect:audited — Real-time Supabase subscription for messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`,
        },
        (payload) => {
          logger.log('New message received:', payload);
          const data = payload.new as any;
          
          const newMessage: RealTimeMessage = {
            id: data.id,
            sender_id: data.sender_id,
            receiver_id: data.receiver_id,
            content: data.content,
            message_type: (data.message_type as RealTimeMessage['message_type']) || 'text',
            media_url: data.media_url || undefined,
            read_at: data.read_at || undefined,
            created_at: data.created_at
          };
          
          onNewMessage(newMessage);

          if (newMessage.sender_id !== user.id) {
            toast.success('New message received');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onNewMessage]);
};
