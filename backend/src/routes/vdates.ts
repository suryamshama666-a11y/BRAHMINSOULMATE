import express from 'express';
import { getSupabase } from '../config/supabase';
import crypto from 'crypto';

const router = express.Router();

// Note: VDates would typically have its own table, but I'll use user_activities for now
// In a real implementation, create a video_dates table with fields:
// id, requester_id, recipient_id, scheduled_time, status, meeting_link, created_at, updated_at

// Schedule a video date
router.post('/schedule', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const requester_id = req.user?.id || req.user?.user_id;
    const { recipient_id, scheduled_time, message } = req.body;

    if (!recipient_id || !scheduled_time) {
      return res.status(400).json({
        success: false,
        error: 'recipient_id and scheduled_time are required'
      });
    }

    // Generate meeting link (in real implementation, use Agora/Twilio)
    const meetingId = crypto.randomUUID();
    const meetingLink = `https://meet.brahminsoulmate.com/${meetingId}`;

    // Store as user activity for now
    const { data: vdate, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: requester_id,
        activity_type: 'vdate_scheduled',
        activity_data: {
          recipient_id,
          scheduled_time,
          message,
          meeting_link: meetingLink,
          status: 'pending'
        }
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Also create activity for recipient
    await supabase
      .from('user_activities')
      .insert({
        user_id: recipient_id,
        activity_type: 'vdate_received',
        activity_data: {
          requester_id,
          scheduled_time,
          message,
          meeting_link: meetingLink,
          status: 'pending',
          vdate_id: vdate.id
        }
      });

    return res.json({
      success: true,
      data: {
        id: vdate.id,
        scheduled_time,
        meeting_link: meetingLink,
        status: 'pending'
      }
    });
  } catch (error: any) {
    console.error('Schedule vdate error:', error);
    return res.status(500).json({ success: false, error: 'Failed to schedule video date' });
  }
});

// Get upcoming video dates
router.get('/upcoming', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const userId = req.user?.id || req.user?.user_id;
    const now = new Date().toISOString();

    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .in('activity_type', ['vdate_scheduled', 'vdate_received', 'vdate_accepted'])
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Filter for upcoming dates and transform data
    const upcomingVDates = activities?.filter(activity => {
      const scheduledTime = activity.activity_data?.scheduled_time;
      return scheduledTime && new Date(scheduledTime) > new Date(now);
    }).map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      scheduled_time: activity.activity_data?.scheduled_time,
      meeting_link: activity.activity_data?.meeting_link,
      status: activity.activity_data?.status,
      partner_id: activity.activity_data?.recipient_id || activity.activity_data?.requester_id,
      message: activity.activity_data?.message,
      created_at: activity.created_at
    })) || [];

    return res.json({ success: true, data: upcomingVDates });
  } catch (error: any) {
    console.error('Get upcoming vdates error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch upcoming video dates' });
  }
});

// Get video date history
router.get('/history', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const userId = req.user?.id || req.user?.user_id;
    const now = new Date().toISOString();

    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .in('activity_type', ['vdate_scheduled', 'vdate_received', 'vdate_accepted', 'vdate_completed', 'vdate_cancelled'])
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Filter for past dates and transform data
    const pastVDates = activities?.filter(activity => {
      const scheduledTime = activity.activity_data?.scheduled_time;
      return scheduledTime && new Date(scheduledTime) <= new Date(now);
    }).map(activity => ({
      id: activity.id,
      type: activity.activity_type,
      scheduled_time: activity.activity_data?.scheduled_time,
      status: activity.activity_data?.status,
      partner_id: activity.activity_data?.recipient_id || activity.activity_data?.requester_id,
      message: activity.activity_data?.message,
      created_at: activity.created_at
    })) || [];

    return res.json({ success: true, data: pastVDates });
  } catch (error: any) {
    console.error('Get vdate history error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch video date history' });
  }
});

// Accept video date
router.post('/:id/accept', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const vdateId = req.params.id;
    const userId = req.user?.id || req.user?.user_id;

    // Find the vdate activity
    const { data: activity, error: fetchError } = await supabase
      .from('user_activities')
      .select('*')
      .eq('id', vdateId)
      .eq('user_id', userId)
      .eq('activity_type', 'vdate_received')
      .single();

    if (fetchError || !activity) {
      return res.status(404).json({ success: false, error: 'Video date not found' });
    }

    // Update status to accepted
    const { error: updateError } = await supabase
      .from('user_activities')
      .update({
        activity_type: 'vdate_accepted',
        activity_data: {
          ...activity.activity_data,
          status: 'accepted'
        }
      })
      .eq('id', vdateId);

    if (updateError) {
      throw updateError;
    }

    // Notify the requester
    await supabase
      .from('user_activities')
      .insert({
        user_id: activity.activity_data.requester_id,
        activity_type: 'vdate_accepted_notification',
        activity_data: {
          recipient_id: userId,
          vdate_id: vdateId,
          scheduled_time: activity.activity_data.scheduled_time,
          meeting_link: activity.activity_data.meeting_link
        }
      });

    return res.json({ success: true, id: vdateId });
  } catch (error: any) {
    console.error('Accept vdate error:', error);
    return res.status(500).json({ success: false, error: 'Failed to accept video date' });
  }
});

// Decline video date
router.post('/:id/decline', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const vdateId = req.params.id;
    const userId = req.user?.id || req.user?.user_id;

    // Update status to declined
    const { error } = await supabase
      .from('user_activities')
      .update({
        activity_type: 'vdate_declined',
        activity_data: {
          status: 'declined'
        }
      })
      .eq('id', vdateId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return res.json({ success: true, id: vdateId });
  } catch (error: any) {
    console.error('Decline vdate error:', error);
    return res.status(500).json({ success: false, error: 'Failed to decline video date' });
  }
});

// Cancel video date
router.post('/:id/cancel', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const vdateId = req.params.id;
    const userId = req.user?.id || req.user?.user_id;

    // Update status to cancelled
    const { error } = await supabase
      .from('user_activities')
      .update({
        activity_type: 'vdate_cancelled',
        activity_data: {
          status: 'cancelled'
        }
      })
      .eq('id', vdateId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return res.json({ success: true, id: vdateId });
  } catch (error: any) {
    console.error('Cancel vdate error:', error);
    return res.status(500).json({ success: false, error: 'Failed to cancel video date' });
  }
});

// Get meeting link for video date
router.get('/:id/meeting-link', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const vdateId = req.params.id;
    const userId = req.user?.id || req.user?.user_id;

    const { data: activity, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('id', vdateId)
      .eq('user_id', userId)
      .single();

    if (error || !activity) {
      return res.status(404).json({ success: false, error: 'Video date not found' });
    }

    const meetingLink = activity.activity_data?.meeting_link;
    if (!meetingLink) {
      return res.status(404).json({ success: false, error: 'Meeting link not found' });
    }

    // Only provide link if date is accepted and within 30 minutes of scheduled time
    const scheduledTime = new Date(activity.activity_data?.scheduled_time);
    const now = new Date();
    const timeDiff = Math.abs(scheduledTime.getTime() - now.getTime());
    const thirtyMinutes = 30 * 60 * 1000;

    if (activity.activity_data?.status !== 'accepted' || timeDiff > thirtyMinutes) {
      return res.status(403).json({
        success: false,
        error: 'Meeting link not available yet'
      });
    }

    return res.json({ success: true, link: meetingLink });
  } catch (error: any) {
    console.error('Get meeting link error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get meeting link' });
  }
});

export default router;

