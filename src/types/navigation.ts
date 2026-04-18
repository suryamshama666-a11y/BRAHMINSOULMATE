/**
 * Navigation and Notification related types
 */

export interface Notification {
  id: string;
  user_id: string;
  type: 'match' | 'message' | 'profile_view' | 'interest' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp?: string;
  action_url?: string | null;
  sender_id?: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}
