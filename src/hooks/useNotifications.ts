
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'interest' | 'match' | 'system';
  message: string;
  category: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  read_at?: string;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock notifications data since table doesn't exist
  const mockNotifications: Notification[] = [
    {
      id: '1',
      user_id: user?.id || '',
      type: 'message',
      message: 'You have a new message from John',
      category: 'info',
      priority: 'medium',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: user?.id || '',
      type: 'interest',
      message: 'Someone expressed interest in your profile',
      category: 'success',
      priority: 'high',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      user_id: user?.id || '',
      type: 'system',
      message: 'Your profile verification is complete',
      category: 'success',
      priority: 'medium',
      read_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ];

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Simulate API delay
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString()
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read_at).length;
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
  };
};
