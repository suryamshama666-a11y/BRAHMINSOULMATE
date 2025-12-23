import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get error message
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

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
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Register for event
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // Check capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('capacity')
      .eq('id', id)
      .single();

    if (eventError) throw eventError;

    const { count, error: countError } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    if (countError) throw countError;

    if (event && count !== null && count >= event.capacity) {
      return res.status(400).json({ success: false, error: 'Event is full' });
    }

    const { error } = await supabase
      .from('event_registrations')
      .insert({ event_id: id, user_id: userId });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

export default router;
