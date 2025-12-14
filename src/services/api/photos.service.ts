import { supabase } from '@/lib/supabase';

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

  // Upload photo with compression
  async uploadPhoto(
    file: File,
    privacy: 'public' | 'premium' | 'connections' = 'public',
    options?: PhotoUploadOptions
  ): Promise<Photo> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check photo limit
    const currentPhotos = await this.getMyPhotos();
    if (currentPhotos.length >= this.MAX_PHOTOS) {
      throw new Error(`Maximum ${this.MAX_PHOTOS} photos allowed`);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Compress image
    const compressedFile = await this.compressImage(file, options);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    // Get next display order
    const maxOrder = currentPhotos.length > 0
      ? Math.max(...currentPhotos.map(p => p.display_order))
      : 0;

    // Save photo record to database
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        url: publicUrl,
        is_profile_picture: currentPhotos.length === 0, // First photo is profile picture
        privacy,
        display_order: maxOrder + 1
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup uploaded file if database insert fails
      await supabase.storage.from(this.BUCKET_NAME).remove([fileName]);
      throw dbError;
    }

    // If this is the first photo, update profile
    if (currentPhotos.length === 0) {
      await supabase
        .from('profiles')
        .update({ profile_picture: publicUrl })
        .eq('user_id', user.id);
    }

    return photo;
  }

  // Compress image before upload (basic client-side compression)
  private async compressImage(
    file: File,
    _options?: PhotoUploadOptions
  ): Promise<File> {
    // For now, return the original file
    // TODO: Install browser-image-compression package for better compression
    // npm install browser-image-compression
    
    // Basic size check
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    return file;
  }

  // Get my photos
  async getMyPhotos(): Promise<Photo[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', user.id)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get user photos (with privacy filtering)
  async getUserPhotos(userId: string): Promise<Photo[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    // If not the owner, filter by privacy
    if (!user || user.id !== userId) {
      // Check if users are connected
      const areConnected = user ? await this.checkConnection(user.id, userId) : false;
      
      // Check if viewer has premium subscription
      const hasPremium = user ? await this.checkPremiumStatus(user.id) : false;

      if (areConnected) {
        // Connected users can see all photos
        query = query.in('privacy', ['public', 'premium', 'connections']);
      } else if (hasPremium) {
        // Premium users can see public and premium photos
        query = query.in('privacy', ['public', 'premium']);
      } else {
        // Free users can only see public photos
        query = query.eq('privacy', 'public');
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Delete photo
  async deletePhoto(photoId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get photo details
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!photo) throw new Error('Photo not found');

    // Cannot delete if it's the only photo and profile picture
    if (photo.is_profile_picture) {
      const allPhotos = await this.getMyPhotos();
      if (allPhotos.length === 1) {
        throw new Error('Cannot delete your only profile picture');
      }
    }

    // Extract file path from URL
    const urlParts = photo.url.split('/');
    const filePath = urlParts.slice(-2).join('/'); // user_id/filename

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([filePath]);

    if (storageError) console.error('Storage deletion failed:', storageError);

    // Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) throw dbError;

    // If this was the profile picture, set another photo as profile picture
    if (photo.is_profile_picture) {
      const remainingPhotos = await this.getMyPhotos();
      if (remainingPhotos.length > 0) {
        await this.setProfilePicture(remainingPhotos[0].id);
      }
    }
  }

  // Set profile picture
  async setProfilePicture(photoId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the photo
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!photo) throw new Error('Photo not found');

    // Unset current profile picture
    await supabase
      .from('photos')
      .update({ is_profile_picture: false })
      .eq('user_id', user.id)
      .eq('is_profile_picture', true);

    // Set new profile picture
    const { error: updateError } = await supabase
      .from('photos')
      .update({ is_profile_picture: true })
      .eq('id', photoId);

    if (updateError) throw updateError;

    // Update profile table
    await supabase
      .from('profiles')
      .update({ profile_picture: photo.url })
      .eq('user_id', user.id);
  }

  // Update photo privacy
  async updatePhotoPrivacy(
    photoId: string,
    privacy: 'public' | 'premium' | 'connections'
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('photos')
      .update({ privacy })
      .eq('id', photoId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Reorder photos
  async reorderPhotos(photoIds: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Update display order for each photo
    const updates = photoIds.map((id, index) =>
      supabase
        .from('photos')
        .update({ display_order: index })
        .eq('id', id)
        .eq('user_id', user.id)
    );

    await Promise.all(updates);
  }

  // Check if users are connected
  private async checkConnection(userId1: string, userId2: string): Promise<boolean> {
    const { data } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
      .eq('status', 'connected')
      .single();

    return !!data;
  }

  // Check premium status
  private async checkPremiumStatus(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_type, subscription_end_date')
      .eq('user_id', userId)
      .single();

    if (!data) return false;

    if (data.subscription_type === 'free') return false;

    // Check if subscription is still valid
    if (data.subscription_end_date) {
      const endDate = new Date(data.subscription_end_date);
      return endDate > new Date();
    }

    return false;
  }

  // Get photo count
  async getPhotoCount(userId?: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;

    if (!targetUserId) return 0;

    const { count, error } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    if (error) return 0;
    return count || 0;
  }
}

export const photosService = new PhotosService();
