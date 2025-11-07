import express from 'express';
import { getSupabase } from '../config/supabase';

const router = express.Router();

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }
      throw error;
    }

    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    // Only allow updating own profile
    if (req.user?.id !== req.params.id && req.user?.user_id !== req.params.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Get profile stats
router.get('/:id/stats', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    // Get match counts
    const { count: sentMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.params.id);

    const { count: receivedMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', req.params.id);

    // Get message counts
    const { count: sentMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', req.params.id);

    const { count: receivedMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', req.params.id);

    return res.json({
      success: true,
      data: {
        sentMatches: sentMatches || 0,
        receivedMatches: receivedMatches || 0,
        sentMessages: sentMessages || 0,
        receivedMessages: receivedMessages || 0
      }
    });
  } catch (error: any) {
    console.error('Get profile stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch profile stats' });
  }
});

// Search profiles
router.post('/search', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const {
      gender,
      caste,
      location_city,
      location_state,
      age_min,
      age_max,
      height_min,
      height_max,
      education_level,
      occupation,
      limit = 20,
      offset = 0
    } = req.body;

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('profile_visibility', 'public');

    if (gender) query = query.eq('gender', gender);
    if (caste) query = query.eq('caste', caste);
    if (location_city) query = query.eq('location_city', location_city);
    if (location_state) query = query.eq('location_state', location_state);
    if (education_level) query = query.eq('education_level', education_level);
    if (occupation) query = query.ilike('occupation', `%${occupation}%`);
    if (height_min) query = query.gte('height', height_min);
    if (height_max) query = query.lte('height', height_max);

    // Age filtering (calculate from date_of_birth)
    if (age_min || age_max) {
      const today = new Date();
      if (age_max) {
        const minBirthDate = new Date(today.getFullYear() - age_max - 1, today.getMonth(), today.getDate());
        query = query.gte('date_of_birth', minBirthDate.toISOString().split('T')[0]);
      }
      if (age_min) {
        const maxBirthDate = new Date(today.getFullYear() - age_min, today.getMonth(), today.getDate());
        query = query.lte('date_of_birth', maxBirthDate.toISOString().split('T')[0]);
      }
    }

    const { data: profiles, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: profiles || [] });
  } catch (error: any) {
    console.error('Search profiles error:', error);
    return res.status(500).json({ success: false, error: 'Failed to search profiles' });
  }
});

// Upload image placeholder
router.post('/upload-image', (_req, res) => {
  return res.json({ success: true, url: 'https://example.com/image.jpg' });
});

// Delete image placeholder
router.post('/delete-image', (_req, res) => {
  return res.json({ success: true });
});

export default router;

