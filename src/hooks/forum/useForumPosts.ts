
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/getSupabase';
import { ForumPost } from './types';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';

export type { ForumPost } from './types';

export const useForumPosts = () => {
  const { user } = useSupabaseAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSupabase()
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to include the missing is_locked property
      const mappedPosts: ForumPost[] = (data || []).map(post => ({
        ...post,
        is_locked: false // Default value since this column doesn't exist in DB
      }));

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      toast.error('Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'like_count' | 'reply_count' | 'view_count' | 'is_locked'>) => {
    if (!user) {
      toast.error('Please login to create a post');
      return { success: false };
    }

    try {
      const { data, error } = await getSupabase()
        .from('forum_posts')
        .insert({
          ...postData,
          author_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchPosts();
      toast.success('Forum post created successfully!');
      return { success: true, post: data };
    } catch (error: any) {
      console.error('Error creating forum post:', error);
      toast.error('Failed to create forum post');
      return { success: false, error: error.message };
    }
  };

  const updatePost = async (postId: string, updates: Partial<Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'author_id' | 'like_count' | 'reply_count' | 'view_count' | 'is_locked'>>) => {
    if (!user) {
      toast.error('Please login to update a post');
      return { success: false };
    }

    try {
      const { error } = await getSupabase()
        .from('forum_posts')
        .update(updates)
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) throw error;

      await fetchPosts();
      toast.success('Forum post updated successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error updating forum post:', error);
      toast.error('Failed to update forum post');
      return { success: false, error: error.message };
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) {
      toast.error('Please login to delete a post');
      return { success: false };
    }

    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) throw error;

      await fetchPosts();
      toast.success('Forum post deleted successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting forum post:', error);
      toast.error('Failed to delete forum post');
      return { success: false, error: error.message };
    }
  };

  const likePost = async (postId: string) => {
    if (!user) {
      toast.error('Please login to like posts');
      return { success: false };
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('forum_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        // Decrement like count manually
        const currentPost = posts.find(p => p.id === postId);
        if (currentPost) {
          await supabase
            .from('forum_posts')
            .update({ like_count: Math.max(0, currentPost.like_count - 1) })
            .eq('id', postId);
        }
      } else {
        // Like
        await supabase
          .from('forum_likes')
          .insert({ post_id: postId, user_id: user.id });

        // Increment like count manually
        const currentPost = posts.find(p => p.id === postId);
        if (currentPost) {
          await supabase
            .from('forum_posts')
            .update({ like_count: currentPost.like_count + 1 })
            .eq('id', postId);
        }
      }

      await fetchPosts();
      return { success: true };
    } catch (error: any) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
      return { success: false, error: error.message };
    }
  };

  const incrementViewCount = async (postId: string) => {
    try {
      const currentPost = posts.find(p => p.id === postId);
      if (currentPost) {
        await getSupabase()
          .from('forum_posts')
          .update({ view_count: currentPost.view_count + 1 })
          .eq('id', postId);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    incrementViewCount
  };
};
