
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ForumSearchFilters } from './types';

export const useForumPostSearch = () => {
  const [loading, setLoading] = useState(false);

  const searchPosts = async (query: string, filters?: ForumSearchFilters) => {
    try {
      setLoading(true);
      let supabaseQuery = supabase
        .from('forum_posts')
        .select('*');

      // Add text search using textSearch for better performance
      if (query.trim()) {
        supabaseQuery = supabaseQuery
          .textSearch('title', query)
          .textSearch('content', query, { type: 'websearch' });
      }

      // Add filters
      if (filters?.categoryId) {
        supabaseQuery = supabaseQuery.eq('category_id', filters.categoryId);
      }

      if (filters?.hasReplies) {
        supabaseQuery = supabaseQuery.gt('reply_count', 0);
      }

      if (filters?.isPinned) {
        supabaseQuery = supabaseQuery.eq('is_pinned', true);
      }

      // Add time range filter
      if (filters?.timeRange && filters.timeRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.timeRange) {
          case 'today':
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date();
            startDate.setMonth(now.getMonth() - 1);
            break;
          default:
            startDate = new Date();
        }
        
        supabaseQuery = supabaseQuery.gte('created_at', startDate.toISOString());
      }

      // Add sorting
      switch (filters?.sortBy) {
        case 'oldest':
          supabaseQuery = supabaseQuery.order('created_at', { ascending: true });
          break;
        case 'popular':
          supabaseQuery = supabaseQuery.order('like_count', { ascending: false });
          break;
        case 'replies':
          supabaseQuery = supabaseQuery.order('reply_count', { ascending: false });
          break;
        default: // newest
          supabaseQuery = supabaseQuery.order('is_pinned', { ascending: false })
                                      .order('created_at', { ascending: false });
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching posts:', error);
      toast.error('Failed to search posts');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    searchPosts
  };
};
