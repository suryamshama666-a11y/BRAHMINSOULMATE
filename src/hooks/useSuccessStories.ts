
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/getSupabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export interface SuccessStory {
  id: string;
  user1_id: string;
  user2_id: string;
  title: string;
  story: string;
  wedding_date?: string;
  is_published: boolean;
  admin_approved: boolean;
  created_at: string;
  updated_at: string;
}

export const useSuccessStories = () => {
  const { user } = useSupabaseAuth();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPublishedStories = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSupabase()
        .from('success_stories')
        .select('*')
        .eq('is_published', true)
        .eq('admin_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching success stories:', error);
      toast.error('Failed to load success stories');
    } finally {
      setLoading(false);
    }
  };

  const createSuccessStory = async (storyData: {
    user2_id: string;
    title: string;
    story: string;
    wedding_date?: string;
  }) => {
    if (!user) {
      toast.error('Please login to share your success story');
      return { success: false };
    }

    try {
      const { data, error } = await getSupabase()
        .from('success_stories')
        .insert({
          user1_id: user.id,
          user2_id: storyData.user2_id,
          title: storyData.title,
          story: storyData.story,
          wedding_date: storyData.wedding_date,
          is_published: false,
          admin_approved: false
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Success story submitted for review!');
      return { success: true, story: data };
    } catch (error: any) {
      console.error('Error creating success story:', error);
      toast.error('Failed to submit success story');
      return { success: false, error: error.message };
    }
  };

  const updateSuccessStory = async (
    storyId: string,
    updates: Partial<Pick<SuccessStory, 'title' | 'story' | 'wedding_date'>>
  ) => {
    if (!user) {
      toast.error('Please login to update stories');
      return { success: false };
    }

    try {
      const { error } = await getSupabase()
        .from('success_stories')
        .update(updates)
        .eq('id', storyId)
        .eq('user1_id', user.id); // Only allow user1 to update

      if (error) throw error;

      await fetchPublishedStories();
      toast.success('Success story updated!');
      return { success: true };
    } catch (error: any) {
      console.error('Error updating success story:', error);
      toast.error('Failed to update success story');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchPublishedStories();
  }, []);

  return {
    stories,
    loading,
    fetchPublishedStories,
    createSuccessStory,
    updateSuccessStory
  };
};
