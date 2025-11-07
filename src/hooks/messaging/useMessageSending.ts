
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';
import { RealTimeMessage } from './types';

export const useMessageSending = () => {
  const { user } = useSupabaseAuth();

  const sendMessage = async (
    receiverId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'video' | 'audio' = 'text', 
    mediaUrl?: string
  ) => {
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          message_type: messageType,
          media_url: mediaUrl,
        })
        .select()
        .single();

      if (error) throw error;
      
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
      
      return { data: newMessage, error: null };
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return { data: null, error: error.message };
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('receiver_id', user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return {
    sendMessage,
    markAsRead
  };
};
