import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export const usePresence = () => {
  const { user } = useSupabaseAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const onlineIds = new Set(Object.keys(newState));
          setOnlineUsers(onlineIds);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          setOnlineUsers((prev) => new Set([...prev, key]));
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              online_at: new Date().toISOString(),
            });

            // Update last_active in database
            await supabase
              .from('profiles')
              .update({ last_active: new Date().toISOString() })
              .eq('id', user.id);
          }
        });

      // Update last_active periodically
      const interval = setInterval(async () => {
        if (user) {
          await supabase
            .from('profiles')
            .update({ last_active: new Date().toISOString() })
            .eq('id', user.id);
        }
      }, 1000 * 60 * 5); // Every 5 minutes

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
  }, [user]);

  const isUserOnline = (userId: string) => onlineUsers.has(userId);

  return { onlineUsers, isUserOnline };
};
