import express from 'express';
import { getSupabase } from '../config/supabase';

const router = express.Router();

// Send interest to another user
router.post('/send-interest', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { match_id } = req.body;
    const user_id = req.user?.id || req.user?.user_id;

    if (!match_id) {
      return res.status(400).json({ success: false, error: 'match_id is required' });
    }

    // Check if interest already exists
    const { data: existing } = await supabase
      .from('matches')
      .select('id')
      .eq('user_id', user_id)
      .eq('match_id', match_id)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, error: 'Interest already sent' });
    }

    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        user_id,
        match_id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: match });
  } catch (error: any) {
    console.error('Send interest error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send interest' });
  }
});

// Accept a match
router.post('/accept/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const matchId = req.params.id;
    const currentUserId = req.user?.id || req.user?.user_id;

    // Update the match status to accepted
    const { data: match, error } = await supabase
      .from('matches')
      .update({ status: 'accepted' })
      .eq('id', matchId)
      .eq('match_id', currentUserId) // Only the recipient can accept
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found or unauthorized' });
    }

    // Create reverse match for mutual connection
    await supabase
      .from('matches')
      .insert({
        user_id: currentUserId,
        match_id: match.user_id,
        status: 'accepted'
      });

    return res.json({ success: true, data: match });
  } catch (error: any) {
    console.error('Accept match error:', error);
    return res.status(500).json({ success: false, error: 'Failed to accept match' });
  }
});

// Decline a match
router.post('/decline/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const matchId = req.params.id;
    const currentUserId = req.user?.id || req.user?.user_id;

    const { data: match, error } = await supabase
      .from('matches')
      .update({ status: 'declined' })
      .eq('id', matchId)
      .eq('match_id', currentUserId) // Only the recipient can decline
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found or unauthorized' });
    }

    return res.json({ success: true, data: match });
  } catch (error: any) {
    console.error('Decline match error:', error);
    return res.status(500).json({ success: false, error: 'Failed to decline match' });
  }
});

// Get sent interests
router.get('/sent', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const currentUserId = req.user?.id || req.user?.user_id;

    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        match_profile:profiles!matches_match_id_fkey(*)
      `)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: matches || [] });
  } catch (error: any) {
    console.error('Get sent matches error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch sent interests' });
  }
});

// Get received interests
router.get('/received', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const currentUserId = req.user?.id || req.user?.user_id;

    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_profile:profiles!matches_user_id_fkey(*)
      `)
      .eq('match_id', currentUserId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: matches || [] });
  } catch (error: any) {
    console.error('Get received matches error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch received interests' });
  }
});

// Get connections (mutual matches)
router.get('/connections', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const currentUserId = req.user?.id || req.user?.user_id;

    const { data: connections, error } = await supabase
      .from('matches')
      .select(`
        *,
        match_profile:profiles!matches_match_id_fkey(*)
      `)
      .eq('user_id', currentUserId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: connections || [] });
  } catch (error: any) {
    console.error('Get connections error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch connections' });
  }
});

// Get profile recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const currentUserId = req.user?.id || req.user?.user_id;
    const { limit = 20 } = req.query;

    // Get current user's profile for matching preferences
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single();

    if (!currentProfile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    // Get users already matched with
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('match_id')
      .eq('user_id', currentUserId);

    const excludeIds = [currentUserId, ...(existingMatches?.map(m => m.match_id) || [])];

    // Basic recommendation logic - opposite gender, same religion/caste, different location
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('profile_visibility', 'public')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(Number(limit));

    // Prefer opposite gender
    if (currentProfile.gender === 'male') {
      query = query.eq('gender', 'female');
    } else if (currentProfile.gender === 'female') {
      query = query.eq('gender', 'male');
    }

    // Same religion/caste preferences
    if (currentProfile.religion) {
      query = query.eq('religion', currentProfile.religion);
    }
    if (currentProfile.caste) {
      query = query.eq('caste', currentProfile.caste);
    }

    const { data: recommendations, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: recommendations || [] });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});

// Add to favorites (placeholder - would need favorites table)
router.post('/favorites/add', async (req, res) => {
  try {
    const { profile_id } = req.body;

    if (!profile_id) {
      return res.status(400).json({ success: false, error: 'profile_id is required' });
    }

    // TODO: Implement favorites with a favorites table
    console.log(`User ${req.user?.id} wants to favorite profile ${profile_id}`);

    return res.json({ success: true, message: 'Added to favorites (placeholder)' });
  } catch (error: any) {
    console.error('Add favorite error:', error);
    return res.status(500).json({ success: false, error: 'Failed to add favorite' });
  }
});

// Remove from favorites (placeholder)
router.post('/favorites/remove', async (req, res) => {
  try {
    const { profile_id } = req.body;

    if (!profile_id) {
      return res.status(400).json({ success: false, error: 'profile_id is required' });
    }

    // TODO: Implement favorites removal
    console.log(`User ${req.user?.id} wants to remove favorite profile ${profile_id}`);

    return res.json({ success: true, message: 'Removed from favorites (placeholder)' });
  } catch (error: any) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
});

// Get favorites (placeholder)
router.get('/favorites', async (req, res) => {
  try {
    // TODO: Implement favorites listing
    return res.json({ success: true, data: [], message: 'Favorites list (placeholder)' });
  } catch (error: any) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch favorites' });
  }
});

export default router;

