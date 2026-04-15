import express from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { preventHardDelete } from '../middleware/softDelete';

const router = express.Router();

// ✅ NEW: Prevent hard deletes on events
router.use(preventHardDelete);

// Helper function to get error message
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

// Get all events
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, event_date, capacity, location, image_url, created_at')
      .gte('event_date', new Date().toISOString())
      .is('deleted_at', null)  // ✅ NEW: Filter out deleted events
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

    // Check if user is already registered
    const { data: existing, error: fetchError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, error: 'You are already registered for this event' });
    }

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
