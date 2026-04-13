
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';
import { ForumPost } from './types';

export const useForumPostActions = () => {
  const { user } = useSupabaseAuth();
  const [loading, ] = useState(false);

  const createPost = async (categoryId: string, title: string, content: string) => {
    if (!user) {
      toast.error('Please login to create posts');
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          category_id: categoryId,
          author_id: user.id,
          title,
          content
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Post created successfully!');
      return { success: true, post: data };
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      return { success: false, error: error.message };
    }
  };

  const likePost = async (postId: string, posts: ForumPost[], setPosts: (posts: ForumPost[]) => void) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_likes')
        .insert({ user_id: user.id, post_id: postId });

      if (error) throw error;

      // Update the post's like count optimistically
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, like_count: post.like_count + 1 }
          : post
      ));

      toast.success('Post liked!');
    } catch (error: any) {
      if (error.code === '23505') {
        // Already liked, remove like
        try {
          const { error: deleteError } = await supabase
            .from('forum_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId);
        
          if (deleteError) throw deleteError;

          // Update the post's like count optimistically
          setPosts(posts.map(post => 
            post.id === postId 
              ? { ...post, like_count: Math.max(0, post.like_count - 1) }
              : post
          ));
          
          toast.success('Like removed');
        } catch (removeError) {
          console.error('Error removing like:', removeError);
          toast.error('Failed to remove like');
        }
      } else {
        console.error('Error liking post:', error);
        toast.error('Failed to like post');
      }
    }
  };

  const incrementViewCount = async (postId: string, posts: ForumPost[], setPosts: (posts: ForumPost[]) => void) => {
    try {
      // First get the current view count, then increment it
      const { data: currentPost, error: fetchError } = await supabase
        .from('forum_posts')
        .select('view_count')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      const newViewCount = (currentPost.view_count || 0) + 1;

      // Update the view count in the database
      const { error } = await supabase
        .from('forum_posts')
        .update({ view_count: newViewCount })
        .eq('id', postId);

      if (error) throw error;

      // Update the post's view count optimistically
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, view_count: newViewCount }
          : post
      ));
    } catch (error) {
      console.error('Error incrementing view count:', error);
      // Don't show error toast for view count failures
    }
  };

  return {
    loading,
    createPost,
    likePost,
    incrementViewCount
  };
};
