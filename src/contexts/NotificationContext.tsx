import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Notification, NotificationContextType } from '@/types';
import { toast } from 'sonner';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  
  // Load initial notifications on auth change
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        setNotifications(data as Notification[]);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    
    loadNotifications();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show simplified toast for new notification
        toast.success(`${newNotification.title}: ${newNotification.message}`, {
          duration: 5000,
          position: 'top-right'
        });
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
  
  // Add notification
  const addNotification = async (notification: Notification) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Database trigger will handle real-time update
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };
  
  // Remove notification
  const removeNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };
  
  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Clear all notifications
  const clearAll = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  
  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification, 
      markAsRead, 
      clearAll 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Helper to get icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>;
    case 'match':
      return <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>;
    case 'interest':
      return <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>;
    case 'event':
      return <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
    default:
      return <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
  }
};

// Helper to get color based on notification type
const getNotificationColor = (type: string) => {
  switch (type) {
    case 'message':
      return 'bg-blue-500';
    case 'match':
      return 'bg-red-500';
    case 'interest':
      return 'bg-amber-500';
    case 'event':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

// Hook for using notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 