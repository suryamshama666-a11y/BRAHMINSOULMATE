import { supabase } from '@/lib/supabase';
import { extractStorageFilePath } from '@/config/storage';

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
  user?: any;
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

    const fileName = `${user.id}/${documentType}_${Date.now()}.${file.name.split('.').pop()}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    const { data, error } = await (supabase as any)
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
      await supabase.storage.from(this.BUCKET_NAME).remove([fileName]);
      throw error;
    }

    await this.notifyAdmins(data.id);

    return data as VerificationRequest;
  }

  // Get my verification requests
  async getMyVerifications(): Promise<VerificationRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('verification_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as VerificationRequest[];
  }

  // Get verification status
  async getVerificationStatus(): Promise<{
    isVerified: boolean;
    pendingRequests: number;
    approvedCount: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('verification_status, verified')
      .eq('user_id', user.id)
      .maybeSingle();

    const verifications = await this.getMyVerifications();
    const pending = verifications.filter(v => v.status === 'pending').length;
    const approved = verifications.filter(v => v.status === 'approved').length;

    return {
      isVerified: profile?.verification_status === 'verified' || profile?.verified === true,
      pendingRequests: pending,
      approvedCount: approved
    };
  }

  // Admin: Get pending verifications
  async getPendingVerifications(): Promise<VerificationRequest[]> {
    const { data, error } = await (supabase as any)
      .from('verification_requests')
      .select(`
        *,
        user:user_id (user_id, full_name, email, phone)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as VerificationRequest[];
  }

  // Admin: Approve verification
  async approveVerification(requestId: string, notes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: request } = await (supabase as any)
      .from('verification_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Verification request not found');

    await (supabase as any)
      .from('verification_requests')
      .update({
        status: 'approved',
        admin_notes: notes,
        reviewed_at: new Date().toISOString(),
        reviewer_id: user.id
      })
      .eq('id', requestId);

    // Update profile
    await (supabase as any)
      .from('profiles')
      .update({ verification_status: 'verified' })
      .eq('user_id', request.user_id);

    await this.notifyUser(request.user_id, 'Verification Approved', 'Your profile has been verified!');
  }

  // Admin: Reject verification
  async rejectVerification(requestId: string, reason: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: request } = await (supabase as any)
      .from('verification_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Verification request not found');

    await (supabase as any)
      .from('verification_requests')
      .update({
        status: 'rejected',
        admin_notes: reason,
        reviewed_at: new Date().toISOString(),
        reviewer_id: user.id
      })
      .eq('id', requestId);

    await this.notifyUser(request.user_id, 'Verification Rejected', `Reason: ${reason}`);
  }

  // Notify admins
  private async notifyAdmins(requestId: string): Promise<void> {
    try {
      const { data: admins } = await (supabase as any)
        .from('profiles')
        .select('user_id')
        .eq('role', 'admin');

      if (!admins) return;

      const notifications = admins.map((admin: any) => ({
        user_id: admin.user_id,
        type: 'verification_request',
        title: 'New Verification Request',
        message: 'A user has submitted documents for verification',
        action_url: `/admin/verifications/${requestId}`,
        read: false
      }));

      await (supabase as any).from('notifications').insert(notifications);
    } catch (error) {
      console.error('Failed to notify admins:', error);
    }
  }

  // Notify user
  private async notifyUser(userId: string, title: string, message: string): Promise<void> {
    try {
      await (supabase as any).from('notifications').insert({
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
