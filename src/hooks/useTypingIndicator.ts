import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

interface TypingStatus {
  userId: string;
  isTyping: boolean;
}

export const useTypingIndicator = () => {
  const { user } = useSupabaseAuth();
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('typing_status', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const newTypingMap: Record<string, string[]> = {};

        Object.entries(state).forEach(([userId, presences]: [string, any]) => {
          presences.forEach((p: any) => {
            if (p.isTyping && p.conversationId) {
              if (!newTypingMap[p.conversationId]) {
                newTypingMap[p.conversationId] = [];
              }
              if (!newTypingMap[p.conversationId].includes(userId)) {
                newTypingMap[p.conversationId].push(userId);
              }
            }
          });
        });

        setTypingUsers(newTypingMap);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const setTyping = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user || !channelRef.current) return;

    if (isTyping) {
      await channelRef.current.track({
        conversationId,
        isTyping: true,
        typing_at: new Date().toISOString()
      });
    } else {
      await channelRef.current.track({
        conversationId,
        isTyping: false,
        typing_at: new Date().toISOString()
      });
    }
  }, [user]);

  const getTypingUsers = (conversationId: string): string[] => {
    return typingUsers[conversationId] || [];
  };

  return {
    setTyping,
    getTypingUsers,
  };
};
