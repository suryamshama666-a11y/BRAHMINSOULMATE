
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';

export interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_reply_id?: string | null;
  like_count: number;
  created_at: string;
  updated_at?: string;
}

export const useForumReplies = () => {
  const { user } = useSupabaseAuth();
  const [replies, setReplies] = useState<ForumReply[]>([]);

  const fetchReplies = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at');

      if (error) throw error;
      setReplies((data as any) || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast.error('Failed to load replies');
    }
  };

  const createReply = async (postId: string, content: string, parentReplyId?: string) => {
    if (!user) {
      toast.error('Please login to reply');
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_reply_id: parentReplyId
        })
        .select()
        .single();

      if (error) throw error;

      // Manually increment reply count
      const { data: currentPost } = await (supabase
        .from('forum_posts') as any)
        .select('reply_count')
        .eq('id', postId)
        .single();

      if (currentPost) {
        const { error: updateError } = await (supabase
          .from('forum_posts') as any)
          .update({ reply_count: (currentPost.reply_count || 0) + 1 })
          .eq('id', postId);

        if (updateError) console.error('Error updating reply count:', updateError);
      }

      await fetchReplies(postId);
      toast.success('Reply posted successfully!');
      return { success: true, reply: data };
    } catch (error: any) {
      console.error('Error creating reply:', error);
      toast.error('Failed to post reply');
      return { success: false, error: error.message };
    }
  };

  const likeReply = async (replyId: string) => {
    if (!user) {
      toast.error('Please login to like replies');
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('forum_likes')
        .insert({ user_id: user.id, reply_id: replyId });

      if (error) throw error;

      // Update the reply's like count optimistically
      setReplies(prev => prev.map(reply => 
        reply.id === replyId 
          ? { ...reply, like_count: reply.like_count + 1 }
          : reply
      ));

      toast.success('Reply liked!');
    } catch (error: any) {
      if (error.code === '23505') {
        // Already liked, remove like
        try {
          const { error: deleteError } = await (supabase as any)
            .from('forum_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('reply_id', replyId);
        
          if (deleteError) throw deleteError;

          // Update the reply's like count optimistically
          setReplies(prev => prev.map(reply => 
            reply.id === replyId 
              ? { ...reply, like_count: Math.max(0, reply.like_count - 1) }
              : reply
          ));
          
          toast.success('Like removed');
        } catch (removeError) {
          console.error('Error removing like:', removeError);
          toast.error('Failed to remove like');
        }
      } else {
        console.error('Error liking reply:', error);
        toast.error('Failed to like reply');
      }
    }
  };

  return {
    replies,
    fetchReplies,
    createReply,
    likeReply
  };
};
