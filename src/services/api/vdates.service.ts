import { supabase } from '@/lib/supabase';

export interface VDate {
  id: string;
  user_id_1: string;
  user_id_2: string;
  scheduled_time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  room_name?: string;
  feedback_1?: string;
  feedback_2?: string;
  rating_1?: number;
  rating_2?: number;
  created_at: string;
  user1?: any;
  user2?: any;
}

export interface VDateFeedback {
  rating: number;
  feedback: string;
}

class VDatesService {
  private readonly JITSI_DOMAIN = 'meet.jit.si';

  // Check if user has premium subscription
  async checkPremiumAccess(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_type, subscription_end_date')
      .eq('user_id', user.id)
      .single();

    if (!profile) return false;
    
    if (profile.subscription_type !== 'premium') return false;
    
    if (profile.subscription_end_date) {
      const endDate = new Date(profile.subscription_end_date);
      if (endDate < new Date()) return false;
    }

    return true;
  }

  // Check if two users are connected
  private async areUsersConnected(userId1: string, userId2: string): Promise<boolean> {
    const { data } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
      .eq('status', 'active')
      .single();

    return !!data;
  }

  // Schedule a V-Date
  async scheduleVDate(
    otherUserId: string,
    scheduledTime: string,
    duration: number = 30
  ): Promise<VDate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check premium access
    const isPremium = await this.checkPremiumAccess();
    if (!isPremium) {
      throw new Error('V-Dates are a premium feature. Please upgrade your subscription.');
    }

    // Check if users are connected (accepted interest)
    const isConnected = await this.areUsersConnected(user.id, otherUserId);
    if (!isConnected) {
      throw new Error('You must have an accepted connection with this user to schedule a V-Date');
    }

    // Validate scheduled time is in the future (at least 1 hour)
    const scheduledDate = new Date(scheduledTime);
    const minTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    if (scheduledDate < minTime) {
      throw new Error('V-Date must be scheduled at least 1 hour in advance');
    }

    // Check for conflicting V-Dates
    const { data: conflicts } = await supabase
      .from('vdates')
      .select('id')
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .eq('status', 'scheduled')
      .gte('scheduled_time', new Date(scheduledDate.getTime() - duration * 60 * 1000).toISOString())
      .lte('scheduled_time', new Date(scheduledDate.getTime() + duration * 60 * 1000).toISOString());

    if (conflicts && conflicts.length > 0) {
      throw new Error('You already have a V-Date scheduled around this time');
    }

    // Generate unique room name
    const roomName = `brahmin_vdate_${user.id.slice(0, 8)}_${Date.now()}`;

    // Create V-Date
    const { data, error } = await supabase
      .from('vdates')
      .insert({
        user_id_1: user.id,
        user_id_2: otherUserId,
        scheduled_time: scheduledTime,
        duration,
        room_name: roomName,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;

    // Send notifications to both users
    await this.sendVDateNotifications(data, 'scheduled');

    // Schedule reminder notifications
    await this.scheduleReminders(data);

    return data;
  }


  // Reschedule a V-Date (premium feature)
  async rescheduleVDate(
    vdateId: string,
    newScheduledTime: string
  ): Promise<VDate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check premium access
    const isPremium = await this.checkPremiumAccess();
    if (!isPremium) {
      throw new Error('V-Dates are a premium feature. Please upgrade your subscription.');
    }

    // Get the existing V-Date
    const { data: existingVDate, error: fetchError } = await supabase
      .from('vdates')
      .select('*')
      .eq('id', vdateId)
      .single();

    if (fetchError || !existingVDate) {
      throw new Error('V-Date not found');
    }

    // Check if user is part of this V-Date
    if (existingVDate.user_id_1 !== user.id && existingVDate.user_id_2 !== user.id) {
      throw new Error('You are not authorized to reschedule this V-Date');
    }

    // Can only reschedule scheduled V-Dates
    if (existingVDate.status !== 'scheduled') {
      throw new Error('Only scheduled V-Dates can be rescheduled');
    }

    // Validate new scheduled time is in the future (at least 1 hour)
    const newScheduledDate = new Date(newScheduledTime);
    const minTime = new Date(Date.now() + 60 * 60 * 1000);
    if (newScheduledDate < minTime) {
      throw new Error('V-Date must be scheduled at least 1 hour in advance');
    }

    // Check for conflicting V-Dates (excluding current one)
    const { data: conflicts } = await supabase
      .from('vdates')
      .select('id')
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .eq('status', 'scheduled')
      .neq('id', vdateId)
      .gte('scheduled_time', new Date(newScheduledDate.getTime() - existingVDate.duration * 60 * 1000).toISOString())
      .lte('scheduled_time', new Date(newScheduledDate.getTime() + existingVDate.duration * 60 * 1000).toISOString());

    if (conflicts && conflicts.length > 0) {
      throw new Error('You already have a V-Date scheduled around this time');
    }

    // Update the V-Date
    const { data, error } = await supabase
      .from('vdates')
      .update({ scheduled_time: newScheduledTime })
      .eq('id', vdateId)
      .select()
      .single();

    if (error) throw error;

    // Send notifications about reschedule
    await this.sendVDateNotifications(data, 'rescheduled');

    // Re-schedule reminder notifications
    await this.scheduleReminders(data);

    return data;
  }

  // Get user's V-Dates
  async getMyVDates(status?: string): Promise<VDate[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('vdates')
      .select(`
        *,
        user1:profiles!vdates_user_id_1_fkey(user_id, full_name, profile_photo_url),
        user2:profiles!vdates_user_id_2_fkey(user_id, full_name, profile_photo_url)
      `)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .order('scheduled_time', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  // Get upcoming V-Dates
  async getUpcomingVDates(): Promise<VDate[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vdates')
      .select(`
        *,
        user1:profiles!vdates_user_id_1_fkey(user_id, full_name, profile_photo_url),
        user2:profiles!vdates_user_id_2_fkey(user_id, full_name, profile_photo_url)
      `)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .eq('status', 'scheduled')
      .gte('scheduled_time', new Date().toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }


  // Cancel a V-Date
  async cancelVDate(vdateId: string, reason?: string): Promise<VDate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the V-Date
    const { data: existingVDate, error: fetchError } = await supabase
      .from('vdates')
      .select('*')
      .eq('id', vdateId)
      .single();

    if (fetchError || !existingVDate) {
      throw new Error('V-Date not found');
    }

    // Check if user is part of this V-Date
    if (existingVDate.user_id_1 !== user.id && existingVDate.user_id_2 !== user.id) {
      throw new Error('You are not authorized to cancel this V-Date');
    }

    // Can only cancel scheduled V-Dates
    if (existingVDate.status !== 'scheduled') {
      throw new Error('Only scheduled V-Dates can be cancelled');
    }

    // Update status
    const { data, error } = await supabase
      .from('vdates')
      .update({ status: 'cancelled' })
      .eq('id', vdateId)
      .select()
      .single();

    if (error) throw error;

    // Send cancellation notifications
    await this.sendVDateNotifications(data, 'cancelled', reason);

    return data;
  }

  // Join a V-Date (get room URL)
  async joinVDate(vdateId: string): Promise<{ roomUrl: string; roomName: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: vdate, error } = await supabase
      .from('vdates')
      .select('*')
      .eq('id', vdateId)
      .single();

    if (error || !vdate) {
      throw new Error('V-Date not found');
    }

    // Check if user is part of this V-Date
    if (vdate.user_id_1 !== user.id && vdate.user_id_2 !== user.id) {
      throw new Error('You are not authorized to join this V-Date');
    }

    // Check if V-Date is scheduled
    if (vdate.status !== 'scheduled') {
      throw new Error('This V-Date is not available to join');
    }

    // Check if it's time to join (allow 5 minutes early)
    const scheduledTime = new Date(vdate.scheduled_time);
    const joinWindow = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
    const endWindow = new Date(scheduledTime.getTime() + vdate.duration * 60 * 1000);

    if (new Date() < joinWindow) {
      throw new Error('V-Date has not started yet. You can join 5 minutes before the scheduled time.');
    }

    if (new Date() > endWindow) {
      // Mark as missed if past end time
      await supabase
        .from('vdates')
        .update({ status: 'missed' })
        .eq('id', vdateId);
      throw new Error('This V-Date has ended');
    }

    const roomUrl = `https://${this.JITSI_DOMAIN}/${vdate.room_name}`;
    return { roomUrl, roomName: vdate.room_name };
  }

  // Complete a V-Date
  async completeVDate(vdateId: string): Promise<VDate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vdates')
      .update({ status: 'completed' })
      .eq('id', vdateId)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .select()
      .single();

    if (error) throw error;
    return data;
  }


  // Submit feedback for a V-Date
  async submitFeedback(vdateId: string, feedback: VDateFeedback): Promise<VDate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the V-Date
    const { data: vdate, error: fetchError } = await supabase
      .from('vdates')
      .select('*')
      .eq('id', vdateId)
      .single();

    if (fetchError || !vdate) {
      throw new Error('V-Date not found');
    }

    // Check if user is part of this V-Date
    if (vdate.user_id_1 !== user.id && vdate.user_id_2 !== user.id) {
      throw new Error('You are not authorized to submit feedback for this V-Date');
    }

    // Can only submit feedback for completed V-Dates
    if (vdate.status !== 'completed') {
      throw new Error('Feedback can only be submitted for completed V-Dates');
    }

    // Determine which feedback fields to update
    const updateData: any = {};
    if (vdate.user_id_1 === user.id) {
      updateData.feedback_1 = feedback.feedback;
      updateData.rating_1 = feedback.rating;
    } else {
      updateData.feedback_2 = feedback.feedback;
      updateData.rating_2 = feedback.rating;
    }

    const { data, error } = await supabase
      .from('vdates')
      .update(updateData)
      .eq('id', vdateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Send V-Date notifications
  private async sendVDateNotifications(
    vdate: VDate,
    type: 'scheduled' | 'rescheduled' | 'cancelled' | 'reminder',
    additionalInfo?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const otherUserId = vdate.user_id_1 === user.id ? vdate.user_id_2 : vdate.user_id_1;
    const scheduledDate = new Date(vdate.scheduled_time);
    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let title = '';
    let content = '';

    switch (type) {
      case 'scheduled':
        title = 'New V-Date Scheduled';
        content = `A V-Date has been scheduled for ${formattedDate}. Duration: ${vdate.duration} minutes.`;
        break;
      case 'rescheduled':
        title = 'V-Date Rescheduled';
        content = `Your V-Date has been rescheduled to ${formattedDate}.`;
        break;
      case 'cancelled':
        title = 'V-Date Cancelled';
        content = `Your V-Date scheduled for ${formattedDate} has been cancelled.${additionalInfo ? ` Reason: ${additionalInfo}` : ''}`;
        break;
      case 'reminder':
        title = 'V-Date Reminder';
        content = `Your V-Date is ${additionalInfo}. Don't forget to join!`;
        break;
    }

    // Send notification to both users
    const notifications = [
      {
        user_id: user.id,
        type: 'vdate',
        title,
        content,
        related_user_id: otherUserId,
        related_entity_id: vdate.id
      },
      {
        user_id: otherUserId,
        type: 'vdate',
        title,
        content,
        related_user_id: user.id,
        related_entity_id: vdate.id
      }
    ];

    await supabase.from('notifications').insert(notifications);
  }


  // Schedule reminder notifications for a V-Date
  private async scheduleReminders(vdate: VDate): Promise<void> {
    const scheduledTime = new Date(vdate.scheduled_time);
    const now = new Date();

    // Calculate reminder times
    const oneDayBefore = new Date(scheduledTime.getTime() - 24 * 60 * 60 * 1000);
    const oneHourBefore = new Date(scheduledTime.getTime() - 60 * 60 * 1000);
    const fifteenMinBefore = new Date(scheduledTime.getTime() - 15 * 60 * 1000);

    // Store scheduled reminders in a separate table or use a job queue
    // For now, we'll create notification entries that can be processed by a background job
    const reminders: any[] = [];

    if (oneDayBefore > now) {
      reminders.push({
        vdate_id: vdate.id,
        user_id_1: vdate.user_id_1,
        user_id_2: vdate.user_id_2,
        reminder_time: oneDayBefore.toISOString(),
        reminder_type: '24_hours',
        sent: false
      });
    }

    if (oneHourBefore > now) {
      reminders.push({
        vdate_id: vdate.id,
        user_id_1: vdate.user_id_1,
        user_id_2: vdate.user_id_2,
        reminder_time: oneHourBefore.toISOString(),
        reminder_type: '1_hour',
        sent: false
      });
    }

    if (fifteenMinBefore > now) {
      reminders.push({
        vdate_id: vdate.id,
        user_id_1: vdate.user_id_1,
        user_id_2: vdate.user_id_2,
        reminder_time: fifteenMinBefore.toISOString(),
        reminder_type: '15_minutes',
        sent: false
      });
    }

    // Insert reminders if the table exists
    if (reminders.length > 0) {
      try {
        await supabase.from('vdate_reminders').insert(reminders);
      } catch {
        // Table might not exist, reminders will be handled differently
        console.log('VDate reminders table not available, skipping reminder scheduling');
      }
    }
  }

  // Process pending reminders (to be called by a background job/cron)
  async processPendingReminders(): Promise<void> {
    const now = new Date();

    try {
      // Get pending reminders that should be sent
      const { data: pendingReminders, error } = await supabase
        .from('vdate_reminders')
        .select('*')
        .eq('sent', false)
        .lte('reminder_time', now.toISOString());

      if (error || !pendingReminders) return;

      for (const reminder of pendingReminders) {
        // Get the V-Date
        const { data: vdate } = await supabase
          .from('vdates')
          .select('*')
          .eq('id', reminder.vdate_id)
          .eq('status', 'scheduled')
          .single();

        if (vdate) {
          let reminderText = '';
          switch (reminder.reminder_type) {
            case '24_hours':
              reminderText = 'starting in 24 hours';
              break;
            case '1_hour':
              reminderText = 'starting in 1 hour';
              break;
            case '15_minutes':
              reminderText = 'starting in 15 minutes';
              break;
          }

          // Send reminder notifications
          await this.sendReminderNotification(vdate, reminderText);
        }

        // Mark reminder as sent
        await supabase
          .from('vdate_reminders')
          .update({ sent: true })
          .eq('id', reminder.id);
      }
    } catch {
      console.log('Error processing reminders');
    }
  }

  // Send reminder notification to both users
  private async sendReminderNotification(vdate: VDate, reminderText: string): Promise<void> {
    const scheduledDate = new Date(vdate.scheduled_time);
    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const notifications = [
      {
        user_id: vdate.user_id_1,
        type: 'vdate',
        title: 'V-Date Reminder',
        content: `Your V-Date is ${reminderText}! Scheduled for ${formattedDate}.`,
        related_user_id: vdate.user_id_2,
        related_entity_id: vdate.id
      },
      {
        user_id: vdate.user_id_2,
        type: 'vdate',
        title: 'V-Date Reminder',
        content: `Your V-Date is ${reminderText}! Scheduled for ${formattedDate}.`,
        related_user_id: vdate.user_id_1,
        related_entity_id: vdate.id
      }
    ];

    await supabase.from('notifications').insert(notifications);
  }

  // Get connected users for V-Date scheduling
  async getConnectedUsers(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        user1:profiles!connections_user1_id_fkey(user_id, full_name, profile_photo_url),
        user2:profiles!connections_user2_id_fkey(user_id, full_name, profile_photo_url)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active');

    if (error) throw error;

    // Return the other user in each connection
    return (data || []).map(conn => {
      return conn.user1_id === user.id ? conn.user2 : conn.user1;
    });
  }
}

export const vdatesService = new VDatesService();
