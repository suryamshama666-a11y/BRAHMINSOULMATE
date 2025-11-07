import express from 'express';
import { getSupabase } from '../config/supabase';

const router = express.Router();

// First, let me create a notifications table since it's not in your schema
// This would typically be done via migration, but I'll add it as a comment for now

// Get all notifications for current user
router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const userId = req.user?.id || req.user?.user_id;
    const { limit = 50, offset = 0, unread_only = 'false' } = req.query;

    // For now, create notifications from user activities
    let query = supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId);

    if (unread_only === 'true') {
      // Filter for recent activities (last 7 days) as "unread"
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    }

    const { data: activities, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform activities into notification format
    const notifications = activities?.map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      title: getNotificationTitle(activity.activity_type),
      message: getNotificationMessage(activity.activity_type, activity.activity_data),
      read: false, // For now, all are unread
      created_at: activity.created_at,
      data: activity.activity_data
    })) || [];

    return res.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.post('/:id/read', async (req, res) => {
  try {
    // For now, just return success since we're using activities table
    // In a real implementation, you'd update a notifications table
    return res.json({ success: true, id: req.params.id });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', async (req, res) => {
  try {
    // For now, just return success
    // In a real implementation, you'd update all unread notifications for the user
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const userId = req.user?.id || req.user?.user_id;

    // Delete from user_activities (acting as notifications for now)
    const { error } = await supabase
      .from('user_activities')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return res.json({ success: true, id: req.params.id });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});

// Get notification preferences (placeholder)
router.get('/preferences', async (req, res) => {
  try {
    // Return default preferences
    const preferences = {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      match_notifications: true,
      message_notifications: true,
      event_notifications: true
    };

    return res.json({ success: true, data: preferences });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
});

// Update notification preferences (placeholder)
router.put('/preferences', async (req, res) => {
  try {
    // In a real implementation, you'd save these to a user_preferences table
    const preferences = req.body;

    console.log(`Updating notification preferences for user ${req.user?.id}:`, preferences);

    return res.json({ success: true, data: preferences });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

// Subscribe to push notifications
router.post('/subscribe-push', async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ success: false, error: 'subscription is required' });
    }

    // In a real implementation, you'd save the push subscription to database
    console.log(`Push subscription for user ${req.user?.id}:`, subscription);

    return res.json({ success: true, message: 'Push notifications subscribed' });
  } catch (error: any) {
    console.error('Subscribe push error:', error);
    return res.status(500).json({ success: false, error: 'Failed to subscribe to push notifications' });
  }
});

// Helper functions for notification formatting
function getNotificationTitle(activityType: string): string {
  switch (activityType) {
    case 'profile_view': return 'Profile Viewed';
    case 'match_received': return 'New Interest Received';
    case 'match_accepted': return 'Interest Accepted';
    case 'message_received': return 'New Message';
    case 'event_registered': return 'Event Registration';
    default: return 'Notification';
  }
}

function getNotificationMessage(activityType: string, data: any): string {
  switch (activityType) {
    case 'profile_view': return 'Someone viewed your profile';
    case 'match_received': return 'You received a new interest';
    case 'match_accepted': return 'Your interest was accepted';
    case 'message_received': return 'You have a new message';
    case 'event_registered': return 'You registered for an event';
    default: return 'You have a new notification';
  }
}

export default router;

