import express from 'express';
import { getSupabase } from '../config/supabase';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { limit = 20, offset = 0, upcoming = 'true' } = req.query;

    let query = supabase
      .from('events')
      .select(`
        *,
        creator_profile:profiles!events_creator_id_fkey(id, first_name, last_name, profile_picture_url)
      `);

    // Filter for upcoming events by default
    if (upcoming === 'true') {
      query = query.gte('event_date', new Date().toISOString());
    }

    const { data: events, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order('event_date', { ascending: true });

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: events || [] });
  } catch (error: any) {
    console.error('Get events error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        creator_profile:profiles!events_creator_id_fkey(id, first_name, last_name, profile_picture_url),
        participants:event_participants(
          id,
          status,
          joined_at,
          participant_profile:profiles!event_participants_user_id_fkey(id, first_name, last_name, profile_picture_url)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      throw error;
    }

    return res.json({ success: true, data: event });
  } catch (error: any) {
    console.error('Get event error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch event' });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const creator_id = req.user?.id || req.user?.user_id;
    const { title, description, event_date, location, max_participants, is_private = false } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ success: false, error: 'title and event_date are required' });
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        creator_id,
        title,
        description,
        event_date,
        location,
        max_participants,
        is_private,
        current_participants: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: event });
  } catch (error: any) {
    console.error('Create event error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const eventId = req.params.id;
    const currentUserId = req.user?.id || req.user?.user_id;

    // Only allow creator to update event
    const { data: event, error } = await supabase
      .from('events')
      .update({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .eq('creator_id', currentUserId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found or unauthorized' });
    }

    return res.json({ success: true, data: event });
  } catch (error: any) {
    console.error('Update event error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const eventId = req.params.id;
    const currentUserId = req.user?.id || req.user?.user_id;

    // Only allow creator to delete event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('creator_id', currentUserId);

    if (error) {
      throw error;
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Delete event error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
});

// Register for event
router.post('/:id/register', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const eventId = req.params.id;
    const userId = req.user?.id || req.user?.user_id;

    // Check if already registered
    const { data: existing } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, error: 'Already registered for this event' });
    }

    // Check event capacity
    const { data: event } = await supabase
      .from('events')
      .select('max_participants, current_participants')
      .eq('id', eventId)
      .single();

    if (event?.max_participants && event.current_participants >= event.max_participants) {
      return res.status(400).json({ success: false, error: 'Event is full' });
    }

    // Register participant
    const { data: participant, error } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'registered'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update participant count
    await supabase
      .from('events')
      .update({
        current_participants: (event?.current_participants || 0) + 1
      })
      .eq('id', eventId);

    return res.json({ success: true, data: participant });
  } catch (error: any) {
    console.error('Register for event error:', error);
    return res.status(500).json({ success: false, error: 'Failed to register for event' });
  }
});

// Unregister from event
router.post('/:id/unregister', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const eventId = req.params.id;
    const userId = req.user?.id || req.user?.user_id;

    // Remove participant
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    // Update participant count
    const { data: event } = await supabase
      .from('events')
      .select('current_participants')
      .eq('id', eventId)
      .single();

    if (event && event.current_participants > 0) {
      await supabase
        .from('events')
        .update({
          current_participants: event.current_participants - 1
        })
        .eq('id', eventId);
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Unregister from event error:', error);
    return res.status(500).json({ success: false, error: 'Failed to unregister from event' });
  }
});

export default router;

