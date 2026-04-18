import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  sender_id?: string;
  read: boolean;
  created_at: string;
  sender?: any;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  interest_received: boolean;
  match_found: boolean;
  message_received: boolean;
  subscription_expiry: boolean;
  event_reminders: boolean;
}

class NotificationsService {
  // Get user notifications
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('notifications')
      .select(`
        *,
        sender:sender_id (
          user_id,
          full_name,
          profile_picture_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Notification[];
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { count, error } = await (supabase as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Create notification
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
    senderId?: string
  ): Promise<void> {
    const { error } = await (supabase as any)
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        action_url: actionUrl,
        sender_id: senderId,
        read: false
      });

    if (error) throw error;

    // Send email/SMS based on preferences
    await this.sendExternalNotification(userId, type, title, message);
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    return data || {
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
      frequency: 'instant',
      interest_received: true,
      match_found: true,
      message_received: true,
      subscription_expiry: true,
      event_reminders: true
    };
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await (supabase as any)
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences
      });

    if (error) throw error;
  }

  // Send external notification (email/SMS)
  private async sendExternalNotification(
    userId: string,
    type: string,
    title: string,
    message: string
  ): Promise<void> {
    try {
      const { data: prefs } = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!prefs) return;

      const typeEnabled = this.isNotificationTypeEnabled(type, prefs);
      if (!typeEnabled) return;

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('email, phone_number')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profile) return;

      if (prefs.email_enabled && profile.email) {
        await this.sendEmail(profile.email, title, message, type);
      }

      if (prefs.sms_enabled && profile.phone_number) {
        await this.sendSMS(profile.phone_number, message);
      }
    } catch (error) {
      console.error('Failed to send external notification:', error);
    }
  }

  private isNotificationTypeEnabled(type: string, prefs: any): boolean {
    const typeMap: Record<string, string> = {
      'interest_received': 'interest_received',
      'interest_accepted': 'interest_received',
      'match_found': 'match_found',
      'new_match': 'match_found',
      'message_received': 'message_received',
      'new_message': 'message_received',
      'subscription_expiry': 'subscription_expiry',
      'subscription_expiring': 'subscription_expiry',
      'event_reminder': 'event_reminders'
    };

    const prefKey = typeMap[type];
    return prefKey ? prefs[prefKey] !== false : true;
  }

  private async sendEmail(
    email: string,
    subject: string,
    message: string,
    type: string
  ): Promise<void> {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ to: email, subject, message, type })
      });

      if (!response.ok) throw new Error('Failed to send email');
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }

  private async sendSMS(phone: string, message: string): Promise<void> {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ to: phone, message })
      });

      if (!response.ok) throw new Error('Failed to send SMS');
    } catch (error) {
      console.error('SMS send failed:', error);
    }
  }

  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    let channel: any;
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      channel = (supabase as any)
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          async (payload: any) => {
            let notification = payload.new as Notification;
            
            if (notification.sender_id) {
              const { data: sender } = await (supabase as any)
                .from('profiles')
                .select('user_id, full_name, profile_picture_url')
                .eq('user_id', notification.sender_id)
                .maybeSingle();

              notification = { ...notification, sender };
            }

            callback(notification);
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }

  static templates = {
    interestReceived: (senderName: string) => ({
      title: 'New Interest Received',
      message: `${senderName} has expressed interest in your profile`,
      type: 'interest_received'
    }),
    interestAccepted: (receiverName: string) => ({
      title: 'Interest Accepted',
      message: `${receiverName} has accepted your interest. You can now message each other!`,
      type: 'interest_accepted'
    }),
    newMatch: (matchName: string, score: number) => ({
      title: 'New Match Found',
      message: `You have a ${score}% match with ${matchName}`,
      type: 'new_match'
    }),
    newMessage: (senderName: string) => ({
      title: 'New Message',
      message: `${senderName} sent you a message`,
      type: 'new_message'
    }),
    subscriptionExpiring: (daysLeft: number) => ({
      title: 'Subscription Expiring Soon',
      message: `Your premium subscription will expire in ${daysLeft} days`,
      type: 'subscription_expiring'
    }),
    eventReminder: (eventName: string, daysUntil: number) => ({
      title: 'Event Reminder',
      message: `${eventName} is in ${daysUntil} days`,
      type: 'event_reminder'
    })
  };
}

export const notificationsService = new NotificationsService();
