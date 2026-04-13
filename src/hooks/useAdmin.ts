
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export interface AdminRole {
  role: string;
  permissions: string[];
}

export interface AdminLog {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  admin_id: string;
  created_at: string;
}

export const useAdmin = () => {
  const { user } = useSupabaseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminRole(null);
      return;
    }

    setLoading(true);
    try {
      // PRODUCTION SECURITY: Check the actual admin_roles table
      const { data, error } = await supabase
        .from('admin_roles' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setIsAdmin(false);
        setAdminRole(null);
        return;
      }

      setIsAdmin(true);
      const adminData = data as any;
      setAdminRole({
        role: adminData.role,
        permissions: adminData.permissions || []
      });
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const logAdminAction = async (action: string, targetType: string, targetId: string, details: any = {}) => {
    if (!user || !isAdmin) return;
    try {
      await (supabase.from('admin_logs' as any) as any).insert({
        admin_id: user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details
      });
    } catch (err) {
      console.error('Failed to log admin action:', err);
    }
  };

  const getAllUsers = async () => {
    if (!isAdmin) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const moderateUser = async (userId: string, status: 'active' | 'suspended') => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status } as any)
        .eq('user_id', userId);

      if (error) throw error;

      await logAdminAction(`${status}_user`, 'user', userId);
      toast.success(`User ${status} successfully`);
      return true;
    } catch (error) {
      console.error('Error moderating user:', error);
      toast.error('Failed to moderate user');
      return false;
    }
  };

  const getAdminLogs = async (): Promise<AdminLog[]> => {
    if (!isAdmin) return [];
    try {
      const { data, error } = await (supabase
        .from('admin_logs' as any) as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as any[];
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      return [];
    }
  };

  const moderateContent = async (contentType: string, contentId: string, action: 'approve' | 'reject') => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return { success: false };
    }

    try {
      const isApproval = action === 'approve';
      const { error } = await supabase
        .from(contentType as any)
        .update({ approved: isApproval } as any)
        .eq('id', contentId);

      if (error) throw error;

      await logAdminAction(`${action}_content`, contentType, contentId);
      toast.success(`Content ${action}ed successfully`);
      return { success: true };
    } catch (error: any) {
      console.error('Error moderating content:', error);
      toast.error('Failed to moderate content');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  return {
    isAdmin,
    adminRole,
    loading,
    getAllUsers,
    moderateUser,
    getAdminLogs,
    moderateContent,
    checkAdminStatus
  };
};
