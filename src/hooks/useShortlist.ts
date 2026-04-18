import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';
import { logger } from '@/utils/logger';

type ShortlistRow = Database['public']['Tables']['shortlists']['Row'];
type InsertShortlist = Database['public']['Tables']['shortlists']['Insert'];

export const useShortlist = () => {
  const { user } = useSupabaseAuth();
  const [shortlistedUsers, setShortlistedUsers] = useState<Set<string>>(new Set());

  const addToShortlist = async (userId: string) => {
    if (!user) return { success: false };

    try {
      const { data, error } = await supabase
        .from('shortlists')
        .insert({
          user_id: user.id,
          shortlist_user_id: userId,
        } as unknown as InsertShortlist)
        .select()
        .single();

      if (error) throw error;

      setShortlistedUsers(prev => new Set([...prev, userId]));
      toast.success('Added to shortlist');
      return { success: true, data: data as ShortlistRow };
    } catch (error) {
      logger.error('Error adding to shortlist:', error);
      toast.error('Failed to add to shortlist');
      return { success: false, error };
    }
  };

  const removeFromShortlist = async (userId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('shortlists')
        .delete()
        .eq('user_id', user.id)
        .eq('shortlist_user_id', userId);

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
