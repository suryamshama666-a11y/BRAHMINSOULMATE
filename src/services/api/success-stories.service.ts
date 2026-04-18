import { supabase } from '@/lib/supabase';
import { extractStorageFilePath } from '@/config/storage';

export interface SuccessStory {
  id: string;
  user1_id: string;
  user2_id: string;
  title: string;
  story: string;
  marriage_date?: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  user1?: any;
  user2?: any;
}

class SuccessStoriesService {
  private readonly BUCKET_NAME = 'success-stories';

  // Submit success story
  async submitStory(storyData: {
    partnerId: string;
    title: string;
    story: string;
    marriageDate?: string;
    image?: File;
  }): Promise<SuccessStory> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let imageUrl: string | undefined;

    // Upload image if provided
    if (storyData.image) {
      imageUrl = await this.uploadImage(storyData.image);
    }

    // Create success story
    const { data, error } = await (supabase as any)
      .from('success_stories')
      .insert({
        user1_id: user.id,
        user2_id: storyData.partnerId,
        title: storyData.title,
        story: storyData.story,
        marriage_date: storyData.marriageDate,
        image_url: imageUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      // Cleanup uploaded image if database insert fails
      if (imageUrl) {
        await this.deleteImage(imageUrl);
      }
      throw error;
    }

    // Notify admins
    await this.notifyAdmins(data.id);

    return data as SuccessStory;
  }

  // Upload story image
  private async uploadImage(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    return publicUrl;
  }

  // Delete image
  private async deleteImage(imageUrl: string): Promise<void> {
    try {
      const filePath = extractStorageFilePath(imageUrl);
      if (!filePath) return;
      await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  // Get approved success stories
  async getApprovedStories(limit: number = 20): Promise<SuccessStory[]> {
    const { data, error } = await (supabase as any)
      .from('success_stories')
      .select(`
        *,
        user1:user1_id (user_id, first_name, last_name, profile_picture_url),
        user2:user2_id (user_id, first_name, last_name, profile_picture_url)
      `)
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as SuccessStory[];
  }

  // Get my success stories
  async getMyStories(): Promise<SuccessStory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('success_stories')
      .select(`
        *,
        user1:user1_id (user_id, first_name, last_name, profile_picture_url),
        user2:user2_id (user_id, first_name, last_name, profile_picture_url)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as SuccessStory[];
  }

  // Admin: Get pending stories
  async getPendingStories(): Promise<SuccessStory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') throw new Error('Admin access required');

    const { data, error } = await (supabase as any)
      .from('success_stories')
      .select(`
        *,
        user1:user1_id (*),
        user2:user2_id (*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as SuccessStory[];
  }

  // Admin: Approve story
  async approveStory(storyId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('success_stories')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', storyId);

    if (error) throw error;
  }

  // Admin: Reject story
  async rejectStory(storyId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('success_stories')
      .update({ status: 'rejected' })
      .eq('id', storyId);

    if (error) throw error;
  }

  // Delete story
  async deleteStory(storyId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('success_stories')
      .delete()
      .eq('id', storyId)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) throw error;
  }

  // Notify admins
  private async notifyAdmins(storyId: string): Promise<void> {
    try {
      const { data: admins } = await (supabase as any)
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin');

      if (!admins) return;

      const notifications = admins.map((admin: any) => ({
        user_id: admin.user_id,
        type: 'success_story_submitted',
        title: 'New Success Story',
        message: 'A new success story has been submitted for review',
        action_url: `/admin/success-stories/${storyId}`,
        read: false
      }));

      await (supabase as any).from('notifications').insert(notifications);
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }
}

export const successStoriesService = new SuccessStoriesService();
