import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export const useShortlist = () => {
  const { user } = useSupabaseAuth();
  const [shortlistedUsers, setShortlistedUsers] = useState<Set<string>>(new Set());

  const addToShortlist = async (userId: string) => {
    if (!user) return { success: false };

    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          user_id: user.id,
          matched_user_id: userId,
          status: 'shortlisted',
        })
        .select()
        .single();

      if (error) throw error;

      setShortlistedUsers(prev => new Set([...prev, userId]));
      toast.success('Added to shortlist');
      return { success: true, data };
    } catch (error) {
      console.error('Error adding to shortlist:', error);
      toast.error('Failed to add to shortlist');
      return { success: false, error };
    }
  };

  const removeFromShortlist = async (userId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('user_id', user.id)
        .eq('matched_user_id', userId)
        .eq('status', 'shortlisted');

      if (error) throw error;

      setShortlistedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      toast.success('Removed from shortlist');
      return { success: true };
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      toast.error('Failed to remove from shortlist');
      return { success: false, error };
    }
  };

  const isInShortlist = (userId: string) => {
    return shortlistedUsers.has(userId);
  };

  return {
    addToShortlist,
    removeFromShortlist,
    isInShortlist,
  };
};
