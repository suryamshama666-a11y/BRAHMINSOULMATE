import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

interface TypingStatus {
  userId: string;
  timestamp: number;
}

export const useTypingIndicator = () => {
  const { user } = useSupabaseAuth();
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus[]>>(new Map());

  useEffect(() => {
    if (!user) return;

    // Subscribe to typing status changes
    const channel = supabase.channel('typing_status')
      .on('presence', { event: 'sync' }, () => {
        // Handle presence sync
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Handle user joining
        const [conversationId, userId] = key.split(':');
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const currentTyping = newMap.get(conversationId) || [];
          const newStatus: TypingStatus = {
            userId,
            timestamp: Date.now()
          };
          newMap.set(conversationId, [...currentTyping, newStatus]);
          return newMap;
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Handle user leaving
        const [conversationId, userId] = key.split(':');
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const currentTyping = newMap.get(conversationId) || [];
          newMap.set(
            conversationId,
            currentTyping.filter(status => status.userId !== userId)
          );
          return newMap;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const setTyping = async (conversationId: string, isTyping: boolean) => {
    if (!user || !conversationId) return;

    const presenceKey = `${conversationId}:${user.id}`;
    const channel = supabase.channel('typing_status');

    if (isTyping) {
      await channel.track({ presenceKey, isTyping: true });
    } else {
      await channel.untrack();
    }
  };

  const getTypingUsers = (conversationId: string): string[] => {
    if (!conversationId) return [];

    const statuses = typingUsers.get(conversationId) || [];
    // Remove stale typing indicators (older than 3 seconds)
    const currentTime = Date.now();
    return statuses
      .filter(status => currentTime - status.timestamp < 3000)
      .map(status => status.userId);
  };

  return {
    setTyping,
    getTypingUsers,
  };
};
