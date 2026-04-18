import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  action_url: string | null;
  sender_id: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  // Notifications fetch 
  const { data: notifications = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any as Notification[]) || [];
    },
    enabled: !!user,
  });

  // Preferences fetch
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('notification_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data as any;
    },
    enabled: !!user
  });

  // real-time
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refetch]);

  const updatePreferences = async (newPrefs: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notification_preferences' as any)
        .update(newPrefs)
        .eq('user_id', user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user.id] });
      toast.success('Preferences updated');
    } catch (err) {
      toast.error('Failed to update preferences');
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
      if (error) throw error;
      refetch();
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  return {
    notifications,
    preferences,
    loading,
    updatePreferences,
    markAsRead,
    getUnreadCount: () => notifications.filter(n => !n.read).length
  };
};
