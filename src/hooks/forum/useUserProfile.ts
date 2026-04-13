
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Local forum user profile type (simplified)
export interface ForumUserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  display_name?: string;
  [key: string]: any;
}

export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<ForumUserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, name, profile_picture')
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
        } else if (data) {
          const nameParts = data.name?.split(' ') || [];
          setProfile({
            id: data.id,
            first_name: nameParts[0],
            last_name: nameParts.slice(1).join(' '),
            profile_picture_url: data.profile_picture,
            display_name: data.name || 'Anonymous User'
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
