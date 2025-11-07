
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

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
      // For now, we'll use a simple check based on user email or profile
      // In a real app, you'd have an admin_roles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminRole(null);
        return;
      }

      // Simple admin check - you can customize this logic
      const adminEmails = ['admin@example.com', 'moderator@example.com'];
      const isUserAdmin = adminEmails.includes(user.email || '');
      
      setIsAdmin(isUserAdmin);
      
      if (isUserAdmin) {
        setAdminRole({
          role: 'admin',
          permissions: ['moderate_users', 'moderate_content', 'view_analytics']
        });
      } else {
        setAdminRole(null);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminRole(null);
    } finally {
      setLoading(false);
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

  const moderateUser = async (userId: string, action: 'suspend' | 'activate') => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return false;
    }

    try {
      // Mock implementation since we don't have user moderation in the current schema
      console.log(`${action} user ${userId}`);
      toast.success(`User ${action}d successfully`);
      return true;
    } catch (error: any) {
      console.error('Error moderating user:', error);
      toast.error('Failed to moderate user');
      return false;
    }
  };

  const getAdminLogs = async (): Promise<AdminLog[]> => {
    if (!isAdmin) return [];

    try {
      // Mock implementation since we don't have admin logs table
      const mockLogs: AdminLog[] = [
        {
          id: 'log-1',
          action: 'user_suspended',
          target_type: 'user',
          target_id: 'user-123',
          admin_id: user?.id || '',
          created_at: new Date().toISOString()
        },
        {
          id: 'log-2',
          action: 'content_approved',
          target_type: 'post',
          target_id: 'post-456',
          admin_id: user?.id || '',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      return mockLogs;
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
      let updateData = {};
      
      if (action === 'approve') {
        updateData = { admin_approved: true, is_published: true };
      } else {
        updateData = { admin_approved: false, is_published: false };
      }

      const { error } = await supabase
        .from(contentType as any)
        .update(updateData)
        .eq('id', contentId);

      if (error) throw error;

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
