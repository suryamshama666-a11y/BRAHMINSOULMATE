import express from 'express';
import { supabase } from '../config/supabase';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { authMiddleware } from '../middleware/auth';
import { cronService } from '../services/cron.service';

const router = express.Router();

// Helper function to get error message
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

// Schedule V-Date
router.post('/schedule', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { partnerId, scheduledTime, duration = 30 } = req.body;

    const { data, error } = await supabase
      .from('vdates')
      .insert({
        user_id_1: userId,
        user_id_2: partnerId,
        scheduled_time: scheduledTime,
        duration,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;

    // Notify partner
    await supabase.from('notifications').insert({
      user_id: partnerId,
      type: 'vdate_scheduled',
      title: 'V-Date Scheduled',
      message: 'A video date has been scheduled with you',
      action_url: `/vdates/${data.id}`,
      sender_id: userId
    });

    res.json({ success: true, vdate: data });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Get Agora token
router.get('/:id/token', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Fetch the V-Date record to check participants
    const { data: vdate, error: fetchError } = await supabase
      .from('vdates')
      .select('user_id_1, user_id_2')
      .eq('id', id)
      .single();

    if (fetchError || !vdate) {
      return res.status(404).json({ success: false, error: 'V-Date not found' });
    }

    // Authorization check - only participants can generate tokens
    if (vdate.user_id_1 !== userId && vdate.user_id_2 !== userId) {
      return res.status(403).json({ success: false, error: 'You are not a participant in this V-Date' });
    }

    const appId = process.env.VITE_AGORA_APP_ID!;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
    const channelName = `vdate_${id}`;
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    res.json({ success: true, token, channelName });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Process reminders manually (admin/testing endpoint)
router.post('/process-reminders', authMiddleware, async (req, res) => {
  try {
    await cronService.processVDateReminders();
    res.json({ success: true, message: 'Reminders processed' });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Get user's V-Dates
router.get('/my-vdates', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    let query = supabase
      .from('vdates')
      .select(`
        *,
        user1:profiles!vdates_user_id_1_fkey(user_id, first_name, last_name, display_name, profile_picture_url, city, state, verified),
        user2:profiles!vdates_user_id_2_fkey(user_id, first_name, last_name, display_name, profile_picture_url, city, state, verified)
      `)
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .order('scheduled_time', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, vdates: data });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Reschedule a V-Date
router.put('/:id/reschedule', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { scheduledTime } = req.body;

    // Get existing V-Date
    const { data: existingVDate, error: fetchError } = await supabase
      .from('vdates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingVDate) {
      return res.status(404).json({ success: false, error: 'V-Date not found' });
    }

    // Check authorization
    if (existingVDate.user_id_1 !== userId && existingVDate.user_id_2 !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Can only reschedule scheduled V-Dates
    if (existingVDate.status !== 'scheduled') {
      return res.status(400).json({ success: false, error: 'Can only reschedule scheduled V-Dates' });
    }

    // Update the V-Date
    const { data, error } = await supabase
      .from('vdates')
      .update({ scheduled_time: scheduledTime })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notify the other user
    const otherUserId = existingVDate.user_id_1 === userId ? existingVDate.user_id_2 : existingVDate.user_id_1;
    await supabase.from('notifications').insert({
      user_id: otherUserId,
      type: 'vdate',
      title: 'V-Date Rescheduled',
      content: `Your V-Date has been rescheduled to ${new Date(scheduledTime).toLocaleString()}`,
      related_user_id: userId,
      related_entity_id: id
    });

    res.json({ success: true, vdate: data });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Cancel a V-Date
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    // Get existing V-Date
    const { data: existingVDate, error: fetchError } = await supabase
      .from('vdates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingVDate) {
      return res.status(404).json({ success: false, error: 'V-Date not found' });
    }

    // Check authorization
    if (existingVDate.user_id_1 !== userId && existingVDate.user_id_2 !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Update status
    const { data, error } = await supabase
      .from('vdates')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notify the other user
    const otherUserId = existingVDate.user_id_1 === userId ? existingVDate.user_id_2 : existingVDate.user_id_1;
    await supabase.from('notifications').insert({
      user_id: otherUserId,
      type: 'vdate',
      title: 'V-Date Cancelled',
      content: `Your V-Date has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      related_user_id: userId,
      related_entity_id: id
    });

    res.json({ success: true, vdate: data });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

export default router;
