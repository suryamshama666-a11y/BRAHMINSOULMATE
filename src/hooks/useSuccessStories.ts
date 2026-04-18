
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

type SuccessStoryRow = Database['public']['Tables']['success_stories']['Row'];
type InsertSuccessStory = Database['public']['Tables']['success_stories']['Insert'];

export interface SuccessStory extends SuccessStoryRow {}

const fetchPublishedStories = async (): Promise<SuccessStory[]> => {
  const { data, error } = await supabase
    .from('success_stories')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as SuccessStory[]) || [];
};

export const useSuccessStories = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: stories = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['success-stories'],
    queryFn: fetchPublishedStories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const fetchPublishedStoriesWrapper = () => refetch();

  const createMutation = useMutation({
    mutationFn: async (storyData: {
      user2_id: string;
      title: string;
      story: string;
      wedding_date?: string;
      images?: string[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('success_stories')
        .insert({
          user1_id: user.id,
          user2_id: storyData.user2_id,
          title: storyData.title,
          story: storyData.story,
          images: storyData.images || null,
          approved: false
        } as unknown as InsertSuccessStory)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Success story submitted for review!');
      queryClient.invalidateQueries({ queryKey: ['success-stories'] });
    },
    onError: (error: any) => {
      console.error('Error creating success story:', error);
      toast.error('Failed to submit success story');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ storyId, updates }: {
      storyId: string;
      updates: Partial<Pick<SuccessStory, 'story' | 'images'>>;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('success_stories')
        .update(updates)
        .eq('id', storyId)
        .eq('user1_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Success story updated!');
      queryClient.invalidateQueries({ queryKey: ['success-stories'] });
    },
    onError: (error: any) => {
      console.error('Error updating success story:', error);
      toast.error('Failed to update success story');
    }
  });

  const createSuccessStory = async (storyData: {
    user2_id: string;
    title: string;
    story: string;
    wedding_date?: string;
    images?: string[];
  }) => {
    if (!user) {
      toast.error('Please login to share your success story');
      return { success: false };
    }

    try {
      const data = await createMutation.mutateAsync(storyData);
      return { success: true, story: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateSuccessStory = async (
    storyId: string,
    updates: Partial<Pick<SuccessStory, 'story' | 'images'>>
  ) => {
    if (!user) {
      toast.error('Please login to update stories');
      return { success: false };
    }

    try {
      await updateMutation.mutateAsync({ storyId, updates });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    stories,
    loading,
    fetchPublishedStories: fetchPublishedStoriesWrapper,
    createSuccessStory,
    updateSuccessStory
  };
};
