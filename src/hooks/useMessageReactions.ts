import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export const useMessageReactions = () => {
  const { user } = useSupabaseAuth();
  const [reactions, setReactions] = useState<Map<string, MessageReaction[]>>(new Map());

  const loadConversationReactions = async (messageIds: string[]) => {
    if (!messageIds.length) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('reactions(*)')
        .in('id', messageIds);

      if (error) throw error;

      const reactionMap = new Map<string, MessageReaction[]>();
      data?.forEach(message => {
        if (message.reactions) {
          reactionMap.set(message.id, message.reactions);
        }
      });

      setReactions(reactionMap);
    } catch (error) {
      console.error('Error loading reactions:', error);
      toast.error('Failed to load message reactions');
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return { success: false };

    try {
      const { data, error } = await supabase
        .from('messages')
        .update({
          reactions: [...(reactions.get(messageId) || []), { emoji, user_id: user.id }]
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setReactions(prev => {
          const newMap = new Map(prev);
          const currentReactions = newMap.get(messageId) || [];
          newMap.set(messageId, [...currentReactions, { emoji, user_id: user.id }]);
          return newMap;
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
      return { success: false, error };
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!user) return { success: false };

    try {
      const currentReactions = reactions.get(messageId) || [];
      const updatedReactions = currentReactions.filter(
        r => !(r.emoji === emoji && r.user_id === user.id)
      );

      const { error } = await supabase
        .from('messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);

      if (error) throw error;

      setReactions(prev => {
        const newMap = new Map(prev);
        newMap.set(messageId, updatedReactions);
        return newMap;
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast.error('Failed to remove reaction');
      return { success: false, error };
    }
  };

  return {
    reactions,
    loadConversationReactions,
    addReaction,
    removeReaction,
  };
};
