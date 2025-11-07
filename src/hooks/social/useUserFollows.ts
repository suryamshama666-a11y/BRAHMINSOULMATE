
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const useUserFollows = () => {
  const { user } = useSupabaseAuth();
  const [following, setFollowing] = useState<UserFollow[]>([]);
  const [followers, setFollowers] = useState<UserFollow[]>([]);

  const fetchFollowing = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollowing(data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchFollowers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('following_id', user.id);

      if (error) throw error;
      setFollowers(data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) {
      toast.error('Please login to follow users');
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;

      await fetchFollowing();
      toast.success('User followed successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error following user:', error);
      if (error.code === '23505') {
        toast.error('You are already following this user');
      } else {
        toast.error('Failed to follow user');
      }
      return { success: false, error: error.message };
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) {
      toast.error('Please login to unfollow users');
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      await fetchFollowing();
      toast.success('User unfollowed successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (user) {
      fetchFollowing();
      fetchFollowers();
    }
  }, [user]);

  return {
    following,
    followers,
    followUser,
    unfollowUser,
    refetch: () => {
      fetchFollowing();
      fetchFollowers();
    }
  };
};
