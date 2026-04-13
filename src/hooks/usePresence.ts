import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // effect:audited — Real-time Supabase presence subscription for online users
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
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers((prev) => new Set([...prev, key]));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
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

          // Sync with both legacy and production-hardened columns
          await supabase
            .from('profiles')
            .update({ 
              last_active: new Date().toISOString(),
              last_seen_at: new Date().toISOString() 
            } as any)
            .eq('user_id', user.id);
        }
      });

    // Update heartbeat periodically for production visibility
    const interval = setInterval(async () => {
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            last_active: new Date().toISOString(),
            last_seen_at: new Date().toISOString()
          } as any)
          .eq('user_id', user.id);
      }
    }, 1000 * 60 * 5); // 5-minute production heartbeat

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, supabase]);

  const isUserOnline = (userId: string) => onlineUsers.has(userId);

  return { onlineUsers, isUserOnline };
};
