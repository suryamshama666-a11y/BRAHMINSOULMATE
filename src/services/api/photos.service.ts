import { supabase } from '@/lib/supabase';
import { extractStorageFilePath } from '@/config/storage';

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  thumbnail_url?: string;
  is_profile_picture: boolean;
  privacy: 'public' | 'premium' | 'connections';
  display_order: number;
  created_at: string;
}

export interface PhotoUploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

class PhotosService {
  private readonly BUCKET_NAME = 'profile-photos';
  private readonly MAX_PHOTOS = 10;

  async uploadPhoto(
    file: File,
    privacy: 'public' | 'premium' | 'connections' = 'public',
    options?: PhotoUploadOptions
  ): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const currentPhotos = await this.getMyPhotos();
    if (currentPhotos.length >= this.MAX_PHOTOS) {
      throw new Error(`Maximum ${this.MAX_PHOTOS} photos allowed`);
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    const compressedFile = await this.compressImage(file, options);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await (supabase.storage as any)
      .from(this.BUCKET_NAME)
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = (supabase.storage as any)
      .from(this.BUCKET_NAME)
      .getPublicUrl((uploadData as any).path);

    const maxOrder = currentPhotos.length > 0
      ? Math.max(...currentPhotos.map(p => (p as any).display_order))
      : 0;

    const { data: photo, error: dbError } = await (supabase as any)
      .from('photos')
      .insert({
        user_id: user.id,
        url: publicUrl,
        is_profile_picture: currentPhotos.length === 0,
        privacy,
        display_order: maxOrder + 1
      })
      .select()
      .single();

    if (dbError) {
      await (supabase.storage as any).from(this.BUCKET_NAME).remove([fileName]);
      throw dbError;
    }

    if (currentPhotos.length === 0) {
      await (supabase as any)
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('user_id', user.id);
    }

    return photo;
  }

  private async compressImage(
    file: File,
    _options?: PhotoUploadOptions
  ): Promise<File> {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }
    return file;
  }

  async getMyPhotos(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('photos')
      .select('*')
      .eq('user_id', user.id)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getUserPhotos(userId: string): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = (supabase as any)
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (!user || user.id !== userId) {
      const areConnected = user ? await this.checkConnection(user.id, userId) : false;
      const hasPremium = user ? await this.checkPremiumStatus(user.id) : false;

      if (areConnected) {
        query = query.in('privacy', ['public', 'premium', 'connections']);
      } else if (hasPremium) {
        query = query.in('privacy', ['public', 'premium']);
      } else {
        query = query.eq('privacy', 'public');
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async deletePhoto(photoId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: photo, error: fetchError } = await (supabase as any)
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!photo) throw new Error('Photo not found');

    if ((photo as any).is_profile_picture) {
      const allPhotos = await this.getMyPhotos();
      if (allPhotos.length === 1) {
        throw new Error('Cannot delete your only profile picture');
      }
    }

    const filePath = extractStorageFilePath((photo as any).url);
    if (!filePath) throw new Error('Invalid photo URL format');

    await (supabase.storage as any)
      .from(this.BUCKET_NAME)
      .remove([filePath]);

    const { error: dbError } = await (supabase as any)
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) throw dbError;

    if ((photo as any).is_profile_picture) {
      const remainingPhotos = await this.getMyPhotos();
      if (remainingPhotos.length > 0) {
        await this.setProfilePicture((remainingPhotos[0] as any).id);
      }
    }
  }

  async setProfilePicture(photoId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: photo, error: fetchError } = await (supabase as any)
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!photo) throw new Error('Photo not found');

    await (supabase as any)
      .from('photos')
      .update({ is_profile_picture: false })
      .eq('user_id', user.id)
      .eq('is_profile_picture', true);

    const { error: updateError } = await (supabase as any)
      .from('photos')
      .update({ is_profile_picture: true })
      .eq('id', photoId);

    if (updateError) throw updateError;

    await (supabase as any)
      .from('profiles')
      .update({ profile_picture_url: (photo as any).url })
      .eq('user_id', user.id);
  }

  async updatePhotoPrivacy(
    photoId: string,
    privacy: 'public' | 'premium' | 'connections'
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('photos')
      .update({ privacy })
      .eq('id', photoId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async reorderPhotos(photoIds: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updates = photoIds.map((id, index) =>
      (supabase as any)
        .from('photos')
        .update({ display_order: index })
        .eq('id', id)
        .eq('user_id', user.id)
    );

    await Promise.all(updates);
  }

  private async checkConnection(userId1: string, userId2: string): Promise<boolean> {
    const { data } = await (supabase as any)
      .from('connections')
      .select('id')
      .or(`and(user_id_1.eq.${userId1},user_id_2.eq.${userId2}),and(user_id_1.eq.${userId2},user_id_2.eq.${userId1})`)
      .eq('status', 'connected')
      .maybeSingle();

    return !!data;
  }

  private async checkPremiumStatus(userId: string): Promise<boolean> {
    const { data } = await (supabase as any)
      .from('profiles')
      .select('subscription_type, subscription_end_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) return false;
    if (data.subscription_type === 'free') return false;
    if (data.subscription_end_date) {
      return new Date(data.subscription_end_date) > new Date();
    }
    return false;
  }

  async getPhotoCount(userId?: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) return 0;

    const { count, error } = await (supabase as any)
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    if (error) return 0;
    return count || 0;
  }
}

export const photosService = new PhotosService();
