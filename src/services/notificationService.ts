import { getSupabase } from '@/lib/getSupabase';
import { toast } from 'sonner';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  private supabase = getSupabase();

  constructor() {
    this.initializeServiceWorker();
  }

  // Initialize service worker
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast.success('Notifications enabled successfully');
      await this.subscribeToPush();
    } else if (permission === 'denied') {
      toast.error('Notifications blocked. Please enable them in browser settings.');
    }

    return permission;
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration || !this.vapidPublicKey) {
      console.error('Service Worker not registered or VAPID key missing');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Save subscription to database
      await this.saveSubscription(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast.error('Failed to enable push notifications');
      return null;
    }
  }

  // Save push subscription to database
  private async saveSubscription(subscription: PushSubscription) {
    try {
      const user = await this.supabase.auth.getUser();
      if (!user.data.user) return;

      const { error } = await this.supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.data.user.id,
          subscription: subscription.toJSON()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving push subscription:', error);
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscription();
        toast.success('Push notifications disabled');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      toast.error('Failed to disable push notifications');
      return false;
    }
  }

  // Remove subscription from database
  private async removeSubscription() {
    try {
      const user = await this.supabase.auth.getUser();
      if (!user.data.user) return;

      const { error } = await this.supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.data.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing push subscription:', error);
    }
  }

  // Show local notification
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (this.getPermissionStatus() !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if (!this.swRegistration) {
      // Fallback to browser notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/badge-72x72.png',
        image: payload.image,
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction
      });
      return;
    }

    try {
      await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/badge-72x72.png',
        image: payload.image,
        data: payload.data,
        actions: payload.actions,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        vibrate: [200, 100, 200],
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Send notification for new message
  async notifyNewMessage(senderName: string, messageContent: string, conversationId: string) {
    await this.showNotification({
      title: `New message from ${senderName}`,
      body: messageContent.length > 50 ? `${messageContent.substring(0, 50)}...` : messageContent,
      icon: '/icon-192x192.png',
      tag: `message-${conversationId}`,
      data: {
        type: 'new_message',
        conversationId,
        url: `/messages?conversation=${conversationId}`
      },
      actions: [
        {
          action: 'reply',
          title: 'Reply'
        },
        {
          action: 'view',
          title: 'View'
        }
      ],
      requireInteraction: true
    });
  }

  // Send notification for new interest
  async notifyNewInterest(senderName: string, profileId: string) {
    await this.showNotification({
      title: 'New Interest Received!',
      body: `${senderName} has shown interest in your profile`,
      icon: '/icon-192x192.png',
      tag: `interest-${profileId}`,
      data: {
        type: 'new_interest',
        profileId,
        url: `/interests-received`
      },
      actions: [
        {
          action: 'view_profile',
          title: 'View Profile'
        },
        {
          action: 'respond',
          title: 'Respond'
        }
      ]
    });
  }

  // Send notification for profile view
  async notifyProfileView(viewerName: string, profileId: string) {
    await this.showNotification({
      title: 'Profile Viewed',
      body: `${viewerName} viewed your profile`,
      icon: '/icon-192x192.png',
      tag: `profile-view-${profileId}`,
      data: {
        type: 'profile_view',
        profileId,
        url: `/profile/${profileId}`
      }
    });
  }

  // Send notification for subscription activation
  async notifySubscriptionActivated(planName: string) {
    await this.showNotification({
      title: 'Subscription Activated!',
      body: `Your ${planName} subscription is now active`,
      icon: '/icon-192x192.png',
      tag: 'subscription-activated',
      data: {
        type: 'subscription_activated',
        url: '/account'
      }
    });
  }

  // Send system notification
  async notifySystem(title: string, message: string, actionUrl?: string) {
    await this.showNotification({
      title,
      body: message,
      icon: '/icon-192x192.png',
      tag: 'system-notification',
      data: {
        type: 'system',
        url: actionUrl
      }
    });
  }

  // Get notification preferences
  async getNotificationPreferences() {
    try {
      const user = await this.supabase.auth.getUser();
      if (!user.data.user) return null;

      const { data, error } = await this.supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.data.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {
        email_notifications: true,
        push_notifications: true,
        new_messages: true,
        new_interests: true,
        profile_views: true,
        marketing_emails: false
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return null;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: any) {
    try {
      const user = await this.supabase.auth.getUser();
      if (!user.data.user) return false;

      const { error } = await this.supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.data.user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Notification preferences updated');
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update preferences');
      return false;
    }
  }

  // Check if user has enabled specific notification type
  async isNotificationEnabled(type: string): Promise<boolean> {
    const preferences = await this.getNotificationPreferences();
    if (!preferences) return true; // Default to enabled

    switch (type) {
      case 'new_message':
        return preferences.push_notifications && preferences.new_messages;
      case 'new_interest':
        return preferences.push_notifications && preferences.new_interests;
      case 'profile_view':
        return preferences.push_notifications && preferences.profile_views;
      default:
        return preferences.push_notifications;
    }
  }

  // Utility function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Initialize notifications for authenticated user
  async initializeForUser() {
    if (!this.isSupported()) return;

    const preferences = await this.getNotificationPreferences();
    if (preferences?.push_notifications && this.getPermissionStatus() === 'default') {
      // Show a subtle prompt to enable notifications
      toast.info('Enable notifications to stay updated with new messages and interests', {
        action: {
          label: 'Enable',
          onClick: () => this.requestPermission()
        },
        duration: 10000
      });
    }
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();

// Service Worker message handler (to be added to public/sw.js)
export const serviceWorkerCode = `
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      image: data.image,
      data: data.data,
      actions: data.actions,
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'reply') {
    // Handle reply action
    event.waitUntil(
      clients.openWindow('/messages?conversation=' + event.notification.data.conversationId)
    );
  } else if (event.action === 'view' || event.action === 'view_profile') {
    // Handle view action
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
`;

export default notificationService;