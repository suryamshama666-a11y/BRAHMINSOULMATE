import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface VerificationRequest {
  id: string;
  user_id: string;
  id_type: string;
  id_number?: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

export const useVerification = () => {
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRequest = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_requests' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setRequest(data as any);
      }
    } catch (err) {
      console.error('Failed to fetch verification request:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadIdProof = async (file: File, idType: string, idNumber?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/id_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('id-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('id-proofs')
        .getPublicUrl(uploadData.path);

      // 2. Create or update verification request
      const { error } = await supabase
        .from('verification_requests' as any)
        .upsert({
          user_id: user.id,
          id_type: idType,
          id_number: idNumber,
          document_url: publicUrl,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('ID Proof uploaded for review');
      fetchRequest();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload ID');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  return {
    request,
    loading,
    uploadIdProof,
    refreshVerification: fetchRequest
  };
};
