/**
 * Smart notification system with frequency capping and personalization
 */

import { supabase } from '../config/supabase';

export class SmartNotifications {
  private static DAILY_LIMIT = 3;
  private static MIN_HOURS_BETWEEN = 2;
  private static QUIET_HOURS_START = 22; // 10 PM
  private static QUIET_HOURS_END = 8; // 8 AM

  /**
   * Check if notification should be sent
   */
  static async shouldSendNotification(userId: string, type: string): Promise<boolean> {
    // Check user preferences
    const prefs = await this.getUserPreferences(userId);
    if (!prefs || !prefs[type]) {
      return false;
    }

    // Check daily frequency cap
    const todayCount = await this.getTodayNotificationCount(userId);
    if (todayCount >= this.DAILY_LIMIT) {
      return false;
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      return false;
    }

    // Check minimum time between notifications
    const lastNotificationTime = await this.getLastNotificationTime(userId);
    if (lastNotificationTime) {
      const hoursSince = (Date.now() - lastNotificationTime) / (1000 * 60 * 60);
      if (hoursSince < this.MIN_HOURS_BETWEEN) {
        return false;
      }
    }

    return true;
  }

  /**
   * Personalize notification content
   */
  static personalizeNotification(
    userId: string,
    template: string,
    data: Record<string, any>
  ): { title: string; message: string } {
    const userName = data.userName || 'there';

    const templates: Record<string, { title: string; message: string }> = {
      new_match: {
        title: 'New Match! 🎉',
        message: `${userName}, you have a new match waiting for you!`
      },
      new_message: {
        title: 'New Message',
        message: `${data.senderName} sent you a message`
      },
      interest_received: {
        title: 'Someone is Interested!',
        message: `${data.senderName} is interested in your profile`
      },
      interest_accepted: {
        title: 'Interest Accepted! 💕',
        message: `${data.senderName} accepted your interest. Start chatting now!`
      },
      profile_view: {
        title: 'Profile Views',
        message: `Your profile was viewed ${data.count} times today`
      },
      subscription_expiring: {
        title: 'Subscription Expiring Soon',
        message: `Your premium subscription expires in ${data.daysLeft} days`
      }
    };

    return templates[template] || {
      title: 'Notification',
      message: 'You have a new notification'
    };
  }

  /**
   * Send notification with smart logic
   */
  static async sendNotification(
    userId: string,
    type: string,
    data: Record<string, any>
  ): Promise<boolean> {
    // Check if should send
    const shouldSend = await this.shouldSendNotification(userId, type);
    if (!shouldSend) {
      return false;
    }

    // Personalize content
    const { title, message } = this.personalizeNotification(userId, type, data);

    // Create notification in database
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          action_url: data.actionUrl || null,
          sender_id: data.senderId || null,
          read: false,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;

      // TODO: Send push notification if user has enabled it
      // await this.sendPushNotification(userId, title, message);

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Get user notification preferences
   */
  private static async getUserPreferences(userId: string): Promise<Record<string, boolean> | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Default preferences
        return {
          new_messages: true,
          new_interests: true,
          profile_views: true,
          marketing_emails: false
        };
      }

      return data as Record<string, boolean>;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get today's notification count for user
   */
  private static async getTodayNotificationCount(userId: string): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('timestamp', today.toISOString());

      if (error) return 0;
      return count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get last notification time for user
   */
  private static async getLastNotificationTime(userId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;
      return new Date(data.timestamp).getTime();
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  private static isQuietHours(): boolean {
    const hour = new Date().getHours();
    return hour >= this.QUIET_HOURS_START || hour < this.QUIET_HOURS_END;
  }
}

export default SmartNotifications;
