
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumPost } from './types';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';

export type { ForumPost } from './types';

const fetchForumPosts = async (): Promise<ForumPost[]> => {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map the data to include the missing is_locked property
  return (data || []).map(post => ({
    ...post,
    is_locked: false // Default value since this column doesn't exist in DB
  }));
};

export const useForumPosts = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: loading, refetch: fetchPosts } = useQuery({
    queryKey: ['forum-posts'],
    queryFn: fetchForumPosts,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createMutation = useMutation({
    mutationFn: async (postData: Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'like_count' | 'reply_count' | 'view_count' | 'is_locked'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          user_id: user.id,
          author_id: user.id,
          title: postData.title,
          content: postData.content,
          category: '', // Need to get this from somewhere
          category_id: postData.category_id,
          is_pinned: postData.is_pinned
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast.success('Forum post created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating forum post:', error);
      toast.error('Failed to create forum post');
    }
  });

  const createPost = async (postData: Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'like_count' | 'reply_count' | 'view_count' | 'is_locked'>) => {
    if (!user) {
      toast.error('Please login to create a post');
      return { success: false };
    }

    try {
      const data = await createMutation.mutateAsync(postData);
      return { success: true, post: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateMutation = useMutation({
    mutationFn: async ({ postId, updates }: {
      postId: string;
      updates: Partial<Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'author_id' | 'like_count' | 'reply_count' | 'view_count' | 'is_locked'>>
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('forum_posts')
        .update(updates)
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast.success('Forum post updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating forum post:', error);
      toast.error('Failed to update forum post');
    }
  });

  const updatePost = async (postId: string, updates: Partial<Omit<ForumPost, 'id' | 'created_at' | 'updated_at' | 'author_id' | 'like_count' | 'reply_count' | 'view_count' | 'is_locked'>>) => {
    if (!user) {
      toast.error('Please login to update a post');
      return { success: false };
    }

    try {
      await updateMutation.mutateAsync({ postId, updates });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast.success('Forum post deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Error deleting forum post:', error);
      toast.error('Failed to delete forum post');
    }
  });

  const deletePost = async (postId: string) => {
    if (!user) {
      toast.error('Please login to delete a post');
      return { success: false };
    }

    try {
      await deleteMutation.mutateAsync(postId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

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
          .insert({ post_id: postId, user_id: user.id, target_id: postId, target_type: 'post' });

        // Increment like count manually
        const currentPost = posts.find(p => p.id === postId);
        if (currentPost) {
          await supabase
            .from('forum_posts')
            .update({ like_count: currentPost.like_count + 1 })
            .eq('id', postId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
    onError: (error: any) => {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  });

  const likePost = async (postId: string) => {
    if (!user) {
      toast.error('Please login to like posts');
      return { success: false };
    }

    try {
      await likeMutation.mutateAsync(postId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const incrementViewCount = async (postId: string) => {
    try {
      const currentPost = posts.find(p => p.id === postId);
      if (currentPost) {
        await supabase
          .from('forum_posts')
          .update({ view_count: currentPost.view_count + 1 })
          .eq('id', postId);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

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
