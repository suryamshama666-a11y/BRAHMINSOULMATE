
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/getSupabase';
import { ForumPost } from './types';

export const useForumPostFetch = (categoryId?: string, searchTerm?: string) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = getSupabase()
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map the data to include the missing is_locked property
      const mappedPosts: ForumPost[] = (data || []).map(post => ({
        ...post,
        is_locked: false // Default value since this column doesn't exist in DB
      }));

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryId, searchTerm]);

  return {
    posts,
    loading,
    refetch: fetchPosts
  };
};
