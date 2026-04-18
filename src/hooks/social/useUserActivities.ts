
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '../useSupabaseAuth';
import { toast } from 'sonner';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'profile_update' | 'photo_upload' | 'post_created' | 'event_created' | 'group_joined';
  activity_data?: Record<string, unknown>;
  created_at: string;
}

export const useUserActivities = () => {
  const { user } = useSupabaseAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Filter and map the data to ensure type safety
      const typedActivities: UserActivity[] = (data || [])
        .filter((activity: { activity_type: string }) => 
          ['profile_update', 'photo_upload', 'post_created', 'event_created', 'group_joined']
            .includes(activity.activity_type)
        )
        .map((activity: Record<string, unknown>) => ({
          ...activity,
          activity_type: activity.activity_type as UserActivity['activity_type']
        }));
      
      setActivities(typedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (
    activityType: UserActivity['activity_type'],
    activityData?: Record<string, unknown>
  ) => {
    if (!user) return { success: false };

    try {
      const { error } = await (supabase as any)
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData
        });

      if (error) throw error;

      await fetchActivities();
      return { success: true };
    } catch (error: any) {
      console.error('Error creating activity:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    fetchActivities,
    createActivity
  };
};
