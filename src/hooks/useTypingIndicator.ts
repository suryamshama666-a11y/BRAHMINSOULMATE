import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabase } from '@/lib/getSupabase';
import { useAuth } from './useAuth';

export const useTypingIndicator = () => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const channelRef = useRef<any>(null);
  const supabase = getSupabase();

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
  }, [user, supabase]);

  const setTyping = useCallback(async (conversationId: string, isTyping: boolean) => {
    if (!user || !channelRef.current) return;

    await channelRef.current.track({
      conversationId,
      isTyping,
      typing_at: new Date().toISOString()
    });
  }, [user]);

  const getTypingUsers = (conversationId: string): string[] => {
    return typingUsers[conversationId] || [];
  };

  return {
    setTyping,
    getTypingUsers,
  };
};
