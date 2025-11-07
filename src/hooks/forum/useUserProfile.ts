
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  display_name?: string;
}

export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, profile_picture_url')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setProfile({
            id: userId,
            first_name: 'Unknown',
            last_name: 'User',
            display_name: 'Unknown User'
          });
        } else {
          setProfile({
            ...data,
            display_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Anonymous User'
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfile({
          id: userId,
          first_name: 'Unknown',
          last_name: 'User',
          display_name: 'Unknown User'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return { profile, loading };
};
