import { supabase } from '@/lib/supabase';

export interface SuccessStory {
  id: string;
  user_id_1?: string;
  user_id_2?: string;
  user1_id?: string;
  user2_id?: string;
  title?: string;
  story?: string;
  marriage_date?: string;
  image_url?: string;
  images?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  approved?: boolean;
  created_at?: string;
  approved_at?: string;
  user1?: any;
  user2?: any;
}

class SuccessStoriesService {
  private readonly BUCKET_NAME = 'success-stories';
  private readonly successStories = supabase.from('success_stories' as any) as any;

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
    const { data, error } = await this.successStories
      .insert({
        user_id_1: user.id,
        user_id_2: storyData.partnerId,
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

    return this.toSuccessStory(data);
  }

  // Upload story image
  private async uploadImage(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPG and PNG images are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    return publicUrl;
  }

  // Delete image
  private async deleteImage(imageUrl: string): Promise<void> {
    try {
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/');
      
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  // Get approved success stories
  async getApprovedStories(limit: number = 20): Promise<SuccessStory[]> {
    const { data, error } = await this.successStories
      .select(`
        *,
        user1:user_id_1 (
          user_id,
          full_name,
          profile_picture
        ),
        user2:user_id_2 (
          user_id,
          full_name,
          profile_picture
        )
      `)
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(story => this.toSuccessStory(story));
  }

  // Get my success stories
  async getMyStories(): Promise<SuccessStory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.successStories
      .select(`
        *,
        user1:user_id_1 (
          user_id,
          full_name,
          profile_picture
        ),
        user2:user_id_2 (
          user_id,
          full_name,
          profile_picture
        )
      `)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(story => this.toSuccessStory(story));
  }

  // Admin: Get pending stories
  async getPendingStories(): Promise<SuccessStory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await this.successStories
      .select(`
        *,
        user1:user_id_1 (
          user_id,
          full_name,
          email,
          profile_picture
        ),
        user2:user_id_2 (
          user_id,
          full_name,
          email,
          profile_picture
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(story => this.toSuccessStory(story));
  }

  // Admin: Approve story
  async approveStory(storyId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get story
    const { data: story, error: fetchError } = await this.successStories
      .select('*')
      .eq('id', storyId)
      .single();

    if (fetchError) throw fetchError;
    if (!story) throw new Error('Story not found');

    // Update status
    const { error: updateError } = await this.successStories
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', storyId);

    if (updateError) throw updateError;

    // Send congratulations to both users
    await this.sendApprovalNotifications(this.toSuccessStory(story));
  }

  // Admin: Reject story
  async rejectStory(storyId: string, reason: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get story
    const { data: story, error: fetchError } = await this.successStories
      .select('*')
      .eq('id', storyId)
      .single();

    if (fetchError) throw fetchError;
    if (!story) throw new Error('Story not found');

    // Update status
    const { error: updateError } = await this.successStories
      .update({ status: 'rejected' })
      .eq('id', storyId);

    if (updateError) throw updateError;

    // Notify submitter
    const normalizedStory = this.toSuccessStory(story);
    if (normalizedStory.user_id_1) {
      await this.sendRejectionNotification(normalizedStory.user_id_1, reason);
    }
  }

  // Delete story
  async deleteStory(storyId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get story
    const { data: story, error: fetchError } = await this.successStories
      .select('*')
      .eq('id', storyId)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .single();

    if (fetchError) throw fetchError;
    if (!story) throw new Error('Story not found');

    // Delete image if exists
    const normalizedStory = this.toSuccessStory(story);
    if (normalizedStory.image_url) {
      await this.deleteImage(normalizedStory.image_url);
    }

    // Delete story
    const { error: deleteError } = await this.successStories
      .delete()
      .eq('id', storyId);

    if (deleteError) throw deleteError;
  }

  // Notify admins of new story
  private async notifyAdmins(storyId: string): Promise<void> {
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      const notifications = admins.map(admin => ({
        user_id: admin.user_id,
        type: 'success_story_submitted',
        title: 'New Success Story',
        message: 'A new success story has been submitted for review',
        action_url: `/admin/success-stories/${storyId}`,
        read: false
      }));

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }

  // Send approval notifications
  private async sendApprovalNotifications(story: SuccessStory): Promise<void> {
    try {
      if (!story.user_id_1 || !story.user_id_2) {
        return;
      }
      const notifications = [
        {
          user_id: story.user_id_1,
          type: 'success_story_approved',
          title: 'Success Story Approved!',
          message: 'Congratulations! Your success story has been featured on our platform.',
          action_url: `/success-stories/${story.id}`,
          read: false
        },
        {
          user_id: story.user_id_2,
          type: 'success_story_approved',
          title: 'Success Story Featured!',
          message: 'Your success story has been featured on Brahmin Soulmate Connect.',
          action_url: `/success-stories/${story.id}`,
          read: false
        }
      ];

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Failed to send approval notifications:', error);
    }
  }

  // Send rejection notification
  private async sendRejectionNotification(userId: string, reason: string): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'success_story_rejected',
        title: 'Success Story Not Approved',
        message: `Your success story was not approved. Reason: ${reason}`,
        read: false
      });
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }
  }

  private toSuccessStory(data: any): SuccessStory {
    const userId1 = data?.user_id_1 ?? data?.user1_id;
    const userId2 = data?.user_id_2 ?? data?.user2_id;
    const status = data?.status ?? (data?.approved ? 'approved' : 'pending');
    const imageUrl = data?.image_url ?? (Array.isArray(data?.images) ? data.images[0] : undefined);
    return {
      ...data,
      user_id_1: userId1,
      user_id_2: userId2,
      status,
      image_url: imageUrl
    };
  }
}

export const successStoriesService = new SuccessStoriesService();
