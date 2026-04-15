import express from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { profileViewLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = express.Router();

// Helper function to get error message
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

// Track profile view
router.post('/', authMiddleware, profileViewLimiter, async (req, res) => {
  try {
    const viewerId = req.user?.id;
    const { viewedProfileId } = req.body;

    if (!viewedProfileId) {
      return res.status(400).json({ success: false, error: 'Viewed profile ID required' });
    }

    // Don't track self-views
    if (viewerId === viewedProfileId) {
      return res.json({ success: true, message: 'Self-view not tracked' });
    }

    // Check if view already exists in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentView } = await supabase
      .from('profile_views')
      .select('id')
      .eq('viewer_id', viewerId)
      .eq('viewed_id', viewedProfileId)
      .gte('viewed_at', oneDayAgo.toISOString())
      .single();

    if (recentView) {
      return res.json({ success: true, message: 'View already tracked recently' });
    }

    // Insert new profile view
    const { data, error } = await supabase
      .from('profile_views')
      .insert({
        viewer_id: viewerId,
        viewed_id: viewedProfileId,
        viewed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, view: data });
  } catch (error) {
    logger.error('Error tracking profile view:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Get who viewed my profile
router.get('/who-viewed-me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const timeFilter = req.query.timeFilter as string || 'all';

    let query = supabase
      .from('profile_views')
      .select(`
        id,
        viewed_at,
        viewer:profiles!viewer_id(
          id,
          user_id,
          first_name,
          last_name,
          display_name,
          age,
          gender,
          city,
          state,
          verified,
          profile_picture_url,
          subscription_type,
          last_active
        )
      `)
      .eq('viewed_id', userId)
      .order('viewed_at', { ascending: false });

    // Apply time filters
    if (timeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte('viewed_at', today.toISOString());
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte('viewed_at', weekAgo.toISOString());
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query = query.gte('viewed_at', monthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, views: data || [] });
  } catch (error) {
    logger.error('Error fetching profile viewers:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Get profiles I viewed
router.get('/i-viewed', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const timeFilter = req.query.timeFilter as string || 'all';

    let query = supabase
      .from('profile_views')
      .select(`
        id,
        viewed_at,
        viewed_profile:profiles!viewed_id(
          id,
          user_id,
          first_name,
          last_name,
          display_name,
          age,
          gender,
          city,
          state,
          verified,
          profile_picture_url,
          subscription_type,
          last_active
        )
      `)
      .eq('viewer_id', userId)
      .order('viewed_at', { ascending: false });

    // Apply time filters
    if (timeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte('viewed_at', today.toISOString());
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte('viewed_at', weekAgo.toISOString());
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query = query.gte('viewed_at', monthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, views: data || [] });
  } catch (error) {
    logger.error('Error fetching viewed profiles:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

// Get profile views count
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const { count, error } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('viewed_id', userId);

    if (error) throw error;

    res.json({ success: true, count: count || 0 });
  } catch (error) {
    logger.error('Error fetching view count:', error);
    res.status(500).json({ success: false, error: getErrorMessage(error) });
  }
});

export default router;
