import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProfilePrivacy = () => {
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  const blockUser = async (userId: string, reason: string) => {
    try {
      const client: any = supabase;
      const { data, error } = await client
        .from('blocked_users')
        .insert({
          blocked_user_id: userId,
          reason,

        })
        .select()
        .single();

      if (error) throw error;

      setBlockedUsers(prev => new Set([...prev, userId]));
      toast.success('User blocked successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
      return { success: false, error };
    }
  };

  const reportUser = async (userId: string, reason: string, details: string) => {
    try {
      const client: any = supabase;
      const { data, error } = await client
        .from('user_reports')
        .insert({
          reported_user_id: userId,
          reason,
          details,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success('Report submitted successfully');
      return { success: true, data };
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error('Failed to submit report');
      return { success: false, error };
    }
  };

  const isUserBlocked = (userId: string) => {
    return blockedUsers.has(userId);
  };

  return {
    blockUser,
    reportUser,
    isUserBlocked,
  };
};
