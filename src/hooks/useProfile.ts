import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/lib/getSupabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  religion: string;
  caste: string;
  marital_status: string;
  height: number;
  education: string;
  employment: string;
  bio: string;
  profile_image: string;
  images: string[];
  preferences: {
    age_range: [number, number];
    location: string[];
    religion: string[];
    caste: string[];
    marital_status: string[];
    height_range: [number, number];
    education: string[];
  };
  last_active: string;
}

/**
 * Hook for managing user profile data with optimized data fetching and caching
 */
export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', userId || user?.id],
    queryFn: async () => {
      const targetId = userId || user?.id;
      if (!targetId) return null;

      const { data, error } = await getSupabase()
        .from('profiles')
        .select('*')
        .eq('user_id', targetId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!(userId || user?.id),
    gcTime: 1000 * 60 * 30, // 30 minutes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

    const { mutateAsync: updateProfile } = useMutation({
      mutationFn: async (updates: Partial<Profile>) => {
        if (!user?.id) throw new Error('User not authenticated');

        const { error } = await getSupabase()
          .from('profiles')
          .update(updates)
          .eq('user_id', user.id);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update profile');
        console.error('Error updating profile:', error);
      },
    });

    const { mutateAsync: createProfile } = useMutation({
      mutationFn: async (newProfile: Omit<Profile, 'id' | 'user_id' | 'created_at' | 'last_active'>) => {
        if (!user?.id) throw new Error('User not authenticated');

        const { error } = await getSupabase()
          .from('profiles')
          .insert({
            ...newProfile,
            user_id: user.id,
            last_active: new Date().toISOString(),
          });

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      },
      onError: (error) => {
        console.error('Error creating profile:', error);
        throw error;
      },
    });

    const { mutateAsync: uploadImage } = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await getSupabase().storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = getSupabase().storage
        .from('profile-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await getSupabase()
        .from('profiles')
        .update({
          images: [...(profile?.images || []), publicUrl],
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Image uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload image');
      console.error('Error uploading image:', error);
    },
  });

  const { mutateAsync: removeImage } = useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await getSupabase()
        .from('profiles')
        .update({
          images: profile?.images.filter(url => url !== imageUrl),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Image removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove image');
      console.error('Error removing image:', error);
    },
  });

  const { mutateAsync: updateLastActive } = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await getSupabase()
        .from('profiles')
        .update({
          last_active: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onError: (error) => {
      console.error('Error updating last active status:', error);
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadImage,
    removeImage,
    updateLastActive,
  };
};
