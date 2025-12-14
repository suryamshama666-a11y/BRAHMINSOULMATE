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

  // Schedule a V-Date
  async scheduleVDate(
    otherUserId: string,
    scheduledTime: string,
    duration: number = 30
  ): Promise<VDate> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if users are connected
    const { data: connection } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
      .eq('status', 'connected')
      .single();

    if (!connection) {
      throw new Error('You must be connected with this user to schedule a V-Date');
    }

    // Validate scheduled time is in the future
    if (new Date(scheduledTime) <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    // Generate unique room name
    const roomName = `vdate_${user.id}_${otherUserId}_${Date.now()}`;

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
    await this.sendVDateNotifications(data);

    return data;
  }

  // Get my V-Dates
  async getMyVDates(): Promise<VDate[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vdates')
      .select(`
        *,
        user1:user_id_1 (
          user_id,
          full_name,
          profile_picture
        ),
        user2:user_id_2 (
          user_id,
          full_name,
          profile_picture
        )
      `)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .order('scheduled_time', { ascending: false });

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
        user1:user_id_1 (
          user_id,
          full_name,
          profile_picture
        ),
        user2:user_id_2 (
          user_id,
          full_name,
          profile_picture
        )
      `)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .eq('status', 'scheduled')
      .gte('scheduled_time', new Date().toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get V-Date by ID
  async getVDate(vdateId: string): Promise<VDate | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vdates')
      .select(`
        *,
        user1:user_id_1 (
          user_id,
          full_name,
          profile_picture
        ),
        user2:user_id_2 (
          user_id,
          full_name,
          profile_picture
        )
      `)
      .eq('id', vdateId)
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Generate Jitsi meeting URL
  generateMeetingUrl(vdate: VDate): string {
    if (!vdate.room_name) {
      throw new Error('Room name not found');
    }
    return `https://${this.JITSI_DOMAIN}/${vdate.room_name}`;
  }

  // Get Jitsi configuration
  getJitsiConfig(vdate: VDate, userName: string) {
    return {
      roomName: vdate.room_name,
      width: '100%',
      height: '100%',
      parentNode: undefined, // Will be set by component
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'stats',
          'shortcuts',
          'tileview',
          'download',
          'help',
          'mute-everyone'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false
      },
      userInfo: {
        displayName: userName
      }
    };
  }

  // Cancel V-Date
  async cancelVDate(vdateId: string, reason?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get V-Date
    const vdate = await this.getVDate(vdateId);
    if (!vdate) throw new Error('V-Date not found');

    // Can only cancel scheduled V-Dates
    if (vdate.status !== 'scheduled') {
      throw new Error('Can only cancel scheduled V-Dates');
    }

    // Update status
    const { error } = await supabase
      .from('vdates')
      .update({ status: 'cancelled' })
      .eq('id', vdateId);

    if (error) throw error;

    // Notify the other user
    const otherUserId = vdate.user_id_1 === user.id ? vdate.user_id_2 : vdate.user_id_1;
    await this.sendCancellationNotification(otherUserId, vdate, reason);
  }

  // Submit feedback after V-Date
  async submitFeedback(
    vdateId: string,
    rating: number,
    feedback: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Get V-Date
    const vdate = await this.getVDate(vdateId);
    if (!vdate) throw new Error('V-Date not found');

    // Determine which user is submitting feedback
    const isUser1 = vdate.user_id_1 === user.id;
    const updateData = isUser1
      ? { rating_1: rating, feedback_1: feedback }
      : { rating_2: rating, feedback_2: feedback };

    // Update feedback
    const { error } = await supabase
      .from('vdates')
      .update(updateData)
      .eq('id', vdateId);

    if (error) throw error;

    // If both users have submitted feedback, mark as completed
    const updatedVDate = await this.getVDate(vdateId);
    if (updatedVDate?.rating_1 && updatedVDate?.rating_2) {
      await supabase
        .from('vdates')
        .update({ status: 'completed' })
        .eq('id', vdateId);
    }
  }

  // Mark V-Date as started
  async startVDate(vdateId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const vdate = await this.getVDate(vdateId);
    if (!vdate) throw new Error('V-Date not found');

    // Check if it's time to start (within 15 minutes of scheduled time)
    const scheduledTime = new Date(vdate.scheduled_time);
    const now = new Date();
    const diffMinutes = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes > 15) {
      throw new Error('V-Date can only be started within 15 minutes of scheduled time');
    }

    if (diffMinutes < -vdate.duration) {
      throw new Error('V-Date time has passed');
    }
  }

  // Check for missed V-Dates (to be called by cron job)
  async checkMissedVDates(): Promise<void> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const { data: scheduledVDates } = await supabase
      .from('vdates')
      .select('*')
      .eq('status', 'scheduled')
      .lt('scheduled_time', oneHourAgo.toISOString());

    if (!scheduledVDates || scheduledVDates.length === 0) return;

    // Mark as missed
    const vdateIds = scheduledVDates.map(v => v.id);
    await supabase
      .from('vdates')
      .update({ status: 'missed' })
      .in('id', vdateIds);

    // Send notifications
    for (const vdate of scheduledVDates) {
      await this.sendMissedNotifications(vdate);
    }
  }

  // Send V-Date notifications
  private async sendVDateNotifications(vdate: VDate): Promise<void> {
    try {
      const scheduledDate = new Date(vdate.scheduled_time);
      const formattedDate = scheduledDate.toLocaleString();

      // Notify user 1
      await supabase.from('notifications').insert({
        user_id: vdate.user_id_1,
        type: 'vdate_scheduled',
        title: 'V-Date Scheduled',
        message: `Your V-Date has been scheduled for ${formattedDate}`,
        action_url: `/v-dates/${vdate.id}`,
        read: false
      });

      // Notify user 2
      await supabase.from('notifications').insert({
        user_id: vdate.user_id_2,
        type: 'vdate_scheduled',
        title: 'V-Date Scheduled',
        message: `A V-Date has been scheduled with you for ${formattedDate}`,
        action_url: `/v-dates/${vdate.id}`,
        read: false
      });
    } catch (error) {
      console.error('Failed to send V-Date notifications:', error);
    }
  }

  // Send cancellation notification
  private async sendCancellationNotification(
    userId: string,
    vdate: VDate,
    reason?: string
  ): Promise<void> {
    try {
      const message = reason
        ? `A V-Date has been cancelled. Reason: ${reason}`
        : 'A V-Date has been cancelled';

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'vdate_cancelled',
        title: 'V-Date Cancelled',
        message,
        read: false
      });
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
    }
  }

  // Send missed V-Date notifications
  private async sendMissedNotifications(vdate: VDate): Promise<void> {
    try {
      const notifications = [
        {
          user_id: vdate.user_id_1,
          type: 'vdate_missed',
          title: 'V-Date Missed',
          message: 'You missed a scheduled V-Date',
          read: false
        },
        {
          user_id: vdate.user_id_2,
          type: 'vdate_missed',
          title: 'V-Date Missed',
          message: 'A scheduled V-Date was missed',
          read: false
        }
      ];

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Failed to send missed notifications:', error);
    }
  }
}

export const vdatesService = new VDatesService();
