import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

class CronService {
  private intervals: NodeJS.Timeout[] = [];

  // Start all cron jobs
  start() {
    logger.info('🕐 Starting cron jobs...');
    
    // Process V-Date reminders every 5 minutes
    this.intervals.push(
      setInterval(() => this.processVDateReminders(), 5 * 60 * 1000)
    );
    
    // Run immediately on startup
    this.processVDateReminders();
    
    // Check for missed V-Dates every 10 minutes
    this.intervals.push(
      setInterval(() => this.checkMissedVDates(), 10 * 60 * 1000)
    );

    logger.info('✅ Cron jobs started');
  }

  // Stop all cron jobs
  stop() {
    logger.info('🛑 Stopping cron jobs...');
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  // Process pending V-Date reminders
  async processVDateReminders() {
    try {
      const now = new Date().toISOString();

      // Get pending reminders that should be sent
      const { data: pendingReminders, error: fetchError } = await supabase
        .from('vdate_reminders')
        .select('*')
        .eq('sent', false)
        .lte('reminder_time', now);

      if (fetchError) {
        logger.error('Error fetching reminders:', fetchError);
        return;
      }

      if (!pendingReminders || pendingReminders.length === 0) {
        return;
      }

      logger.info(`📬 Processing ${pendingReminders.length} V-Date reminders...`);

      for (const reminder of pendingReminders) {
        try {
          // Get the V-Date details
          const { data: vdate, error: vdateError } = await supabase
            .from('vdates')
            .select('*')
            .eq('id', reminder.vdate_id)
            .eq('status', 'scheduled')
            .single();

          if (vdateError || !vdate) {
            // V-Date no longer exists or not scheduled, mark reminder as sent
            await supabase
              .from('vdate_reminders')
              .update({ sent: true })
              .eq('id', reminder.id);
            continue;
          }

          // Format reminder text based on type
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

          // Format the scheduled date
          const scheduledDate = new Date(vdate.scheduled_time);
          const formattedDate = scheduledDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          // Create notifications for both users
          const notifications = [
            {
              user_id: vdate.user_id_1,
              type: 'vdate',
              title: 'V-Date Reminder',
              content: `Your V-Date is ${reminderText}! Scheduled for ${formattedDate}.`,
              related_user_id: vdate.user_id_2,
              related_entity_id: vdate.id,
            },
            {
              user_id: vdate.user_id_2,
              type: 'vdate',
              title: 'V-Date Reminder',
              content: `Your V-Date is ${reminderText}! Scheduled for ${formattedDate}.`,
              related_user_id: vdate.user_id_1,
              related_entity_id: vdate.id,
            },
          ];

          await supabase.from('notifications').insert(notifications);

          // Mark reminder as sent
          await supabase
            .from('vdate_reminders')
            .update({ sent: true })
            .eq('id', reminder.id);

          logger.info(`✅ Sent ${reminder.reminder_type} reminder for V-Date ${reminder.vdate_id}`);
        } catch (err) {
          logger.error(`Error processing reminder ${reminder.id}:`, err);
        }
      }
    } catch (error) {
      logger.error('Error in processVDateReminders:', error);
    }
  }

  // Check for missed V-Dates and update their status
  async checkMissedVDates() {
    try {
      const now = new Date();

      // Find scheduled V-Dates that have passed their end time
      const { data: missedVDates, error } = await supabase
        .from('vdates')
        .select('*')
        .eq('status', 'scheduled')
        .lt('scheduled_time', new Date(now.getTime() - 60 * 60 * 1000).toISOString()); // 1 hour past scheduled time

      if (error) {
        logger.error('Error checking missed V-Dates:', error);
        return;
      }

      if (!missedVDates || missedVDates.length === 0) {
        return;
      }

      logger.warn(`⚠️ Found ${missedVDates.length} missed V-Dates`);

      for (const vdate of missedVDates) {
        // Check if the V-Date end time has passed
        const scheduledTime = new Date(vdate.scheduled_time);
        const endTime = new Date(scheduledTime.getTime() + vdate.duration * 60 * 1000);

        if (now > endTime) {
          // Mark as missed
          await supabase
            .from('vdates')
            .update({ status: 'missed' })
            .eq('id', vdate.id);

          // Notify both users
          const notifications = [
            {
              user_id: vdate.user_id_1,
              type: 'vdate',
              title: 'V-Date Missed',
              content: 'Your scheduled V-Date was missed. Consider rescheduling!',
              related_user_id: vdate.user_id_2,
              related_entity_id: vdate.id,
            },
            {
              user_id: vdate.user_id_2,
              type: 'vdate',
              title: 'V-Date Missed',
              content: 'Your scheduled V-Date was missed. Consider rescheduling!',
              related_user_id: vdate.user_id_1,
              related_entity_id: vdate.id,
            },
          ];

          await supabase.from('notifications').insert(notifications);

          logger.info(`📛 Marked V-Date ${vdate.id} as missed`);
        }
      }
    } catch (error) {
      logger.error('Error in checkMissedVDates:', error);
    }
  }
}

export const cronService = new CronService();
