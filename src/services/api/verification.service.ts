import { supabase } from '@/lib/supabase';

export interface VerificationRequest {
  id: string;
  user_id: string;
  document_type: 'id_proof' | 'address_proof' | 'income_proof' | 'education_proof';
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
}

class VerificationService {
  private readonly BUCKET_NAME = 'verification-documents';

  // Submit verification request
  async submitVerification(
    documentType: 'id_proof' | 'address_proof' | 'income_proof' | 'education_proof',
    file: File
  ): Promise<VerificationRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF and image files are allowed');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Upload document
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;

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

    // Create verification request
    const { data, error } = await supabase
      .from('verification_requests')
      .insert({
        user_id: user.id,
        document_type: documentType,
        document_url: publicUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      // Cleanup uploaded file
      await supabase.storage.from(this.BUCKET_NAME).remove([fileName]);
      throw error;
    }

    // Notify admins
    await this.notifyAdmins(data.id);

    return data;
  }

  // Get my verification requests
  async getMyVerifications(): Promise<VerificationRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get verification status
  async getVerificationStatus(): Promise<{
    isVerified: boolean;
    pendingRequests: number;
    approvedCount: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .single();

    const verifications = await this.getMyVerifications();
    const pending = verifications.filter(v => v.status === 'pending').length;
    const approved = verifications.filter(v => v.status === 'approved').length;

    return {
      isVerified: profile?.verification_status === 'verified',
      pendingRequests: pending,
      approvedCount: approved
    };
  }

  // Admin: Get pending verifications
  async getPendingVerifications(): Promise<VerificationRequest[]> {
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

    const { data, error } = await supabase
      .from('verification_requests')
      .select(`
        *,
        user:user_id (
          user_id,
          full_name,
          email,
          phone
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Admin: Approve verification
  async approveVerification(requestId: string, notes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get verification request
    const { data: request, error: fetchError } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;
    if (!request) throw new Error('Verification request not found');

    // Update verification request
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({
        status: 'approved',
        admin_notes: notes,
        reviewed_at: new Date().toISOString(),
        reviewer_id: user.id
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Check if user should be marked as verified
    const { data: allRequests } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', request.user_id);

    const hasApprovedIdProof = allRequests?.some(
      r => r.document_type === 'id_proof' && r.status === 'approved'
    );

    if (hasApprovedIdProof) {
      // Update profile verification status
      await supabase
        .from('profiles')
        .update({ verification_status: 'verified' })
        .eq('user_id', request.user_id);

      // Send notification to user
      await this.notifyUser(
        request.user_id,
        'Verification Approved',
        'Your profile has been verified! You now have a verified badge.'
      );
    }
  }

  // Admin: Reject verification
  async rejectVerification(requestId: string, reason: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get verification request
    const { data: request, error: fetchError } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;
    if (!request) throw new Error('Verification request not found');

    // Update verification request
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({
        status: 'rejected',
        admin_notes: reason,
        reviewed_at: new Date().toISOString(),
        reviewer_id: user.id
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Send notification to user
    await this.notifyUser(
      request.user_id,
      'Verification Rejected',
      `Your verification request was rejected. Reason: ${reason}. You can resubmit with correct documents.`
    );
  }

  // Delete verification request (resubmit)
  async deleteVerification(requestId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get verification request
    const { data: request, error: fetchError } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!request) throw new Error('Verification request not found');

    // Can only delete rejected requests
    if (request.status !== 'rejected') {
      throw new Error('Can only delete rejected verification requests');
    }

    // Extract file path and delete from storage
    const urlParts = request.document_url.split('/');
    const filePath = urlParts.slice(-2).join('/');

    await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([filePath]);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('verification_requests')
      .delete()
      .eq('id', requestId);

    if (deleteError) throw deleteError;
  }

  // Notify admins of new verification request
  private async notifyAdmins(requestId: string): Promise<void> {
    try {
      // Get all admin users
      const { data: admins } = await supabase
        .from('profiles')
        .select('user_id, email')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      // Create notifications for each admin
      const notifications = admins.map(admin => ({
        user_id: admin.user_id,
        type: 'verification_request',
        title: 'New Verification Request',
        message: 'A user has submitted documents for verification',
        action_url: `/admin/verifications/${requestId}`,
        read: false
      }));

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }

  // Notify user
  private async notifyUser(userId: string, title: string, message: string): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'verification_status',
        title,
        message,
        read: false
      });
    } catch (error) {
      console.error('Failed to notify user:', error);
    }
  }
}

export const verificationService = new VerificationService();
