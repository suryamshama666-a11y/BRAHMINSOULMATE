
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

type FollowRow = Database['public']['Tables']['follows']['Row'];
type InsertFollow = Database['public']['Tables']['follows']['Insert'];

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

const fetchFollowingData = async (userId: string): Promise<FollowRow[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', userId);

  if (error) throw error;
  return data || [];
};

const fetchFollowersData = async (userId: string): Promise<FollowRow[]> => {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .eq('following_id', userId);

  if (error) throw error;
  return data || [];
};

export const useUserFollows = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: following = [], refetch: fetchFollowing } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: () => fetchFollowingData(user?.id || ''),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: followers = [], refetch: fetchFollowers } = useQuery({
    queryKey: ['followers', user?.id],
    queryFn: () => fetchFollowersData(user?.id || ''),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        } as unknown as InsertFollow);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['followers', user?.id] });
      toast.success('User followed successfully!');
    },
    onError: (error: any) => {
      console.error('Error following user:', error);
      if (error.code === '23505') {
        toast.error('You are already following this user');
      } else {
        toast.error('Failed to follow user');
      }
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['followers', user?.id] });
      toast.success('User unfollowed successfully!');
    },
    onError: (error: any) => {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    }
  });

  const followUser = async (userId: string) => {
    if (!user) {
      toast.error('Please login to follow users');
      return { success: false };
    }

    try {
      await followMutation.mutateAsync(userId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) {
      toast.error('Please login to unfollow users');
      return { success: false };
    }

    try {
      await unfollowMutation.mutateAsync(userId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

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
