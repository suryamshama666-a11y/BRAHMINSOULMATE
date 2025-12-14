import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Agora token
router.get('/:id/token', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
