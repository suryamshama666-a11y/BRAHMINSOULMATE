import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get all events
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (error) throw error;
    res.json({ success: true, events: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register for event
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // Check capacity
    const { data: event } = await supabase
      .from('events')
      .select('capacity, (registrations:event_registrations(count))')
      .eq('id', id)
      .single();

    if (event && event.registrations[0].count >= event.capacity) {
      return res.status(400).json({ success: false, error: 'Event is full' });
    }

    const { error } = await supabase
      .from('event_registrations')
      .insert({ event_id: id, user_id: userId });

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
