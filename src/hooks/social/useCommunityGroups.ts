
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';

export interface CommunityGroup {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  is_private: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export const useCommunityGroups = () => {
  const { user } = useSupabaseAuth();
  const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCommunityGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunityGroups(data || []);
    } catch (error) {
      console.error('Error fetching community groups:', error);
      toast.error('Failed to load community groups');
    } finally {
      setLoading(false);
    }
  };

  const createCommunityGroup = async (groupData: {
    name: string;
    description?: string;
    is_private?: boolean;
  }) => {
    if (!user) {
      toast.error('Please login to create groups');
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from('community_groups')
        .insert({
          ...groupData,
          creator_id: user.id,
          is_private: groupData.is_private || false
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator to group
      await (supabase as any)
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      await fetchCommunityGroups();
      toast.success('Community group created successfully!');
      return { success: true, group: data };
    } catch (error: any) {
      console.error('Error creating community group:', error);
      toast.error('Failed to create community group');
      return { success: false, error: error.message };
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) {
      toast.error('Please login to join groups');
      return { success: false };
    }

    try {
      const { error } = await (supabase as any)
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      // Update member count manually
      const { data: currentGroup } = await supabase
        .from('community_groups')
        .select('member_count')
        .eq('id', groupId)
        .single();

      if (currentGroup) {
        await supabase
          .from('community_groups')
          .update({ member_count: currentGroup.member_count + 1 })
          .eq('id', groupId);
      }

      await fetchCommunityGroups();
      toast.success('Joined group successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error joining group:', error);
      if (error.code === '23505') {
        toast.error('You are already a member of this group');
      } else {
        toast.error('Failed to join group');
      }
      return { success: false, error: error.message };
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) {
      toast.error('Please login to leave groups');
      return { success: false };
    }

    try {
      const { error } = await (supabase as any)
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update member count manually
      const { data: currentGroup } = await supabase
        .from('community_groups')
        .select('member_count')
        .eq('id', groupId)
        .single();

      if (currentGroup) {
        await supabase
          .from('community_groups')
          .update({ member_count: Math.max(currentGroup.member_count - 1, 0) })
          .eq('id', groupId);
      }

      await fetchCommunityGroups();
      toast.success('Left group successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchCommunityGroups();
  }, []);

  return {
    communityGroups,
    loading,
    fetchCommunityGroups,
    createCommunityGroup,
    joinGroup,
    leaveGroup
  };
};
