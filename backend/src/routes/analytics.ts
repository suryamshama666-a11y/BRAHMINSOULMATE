import express from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { asyncHandler } from '../utils/asyncHandler';
import { apiLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Track analytics events
 */
router.post('/track', apiLimiter, asyncHandler(async (req, res) => {
  const { events } = req.body;

  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Events array is required'
    });
  }

  // Security Hardening: Limit batch size to prevent DB flooding
  if (events.length > 50) {
    return res.status(400).json({
      success: false,
      error: 'Event batch size exceeded (limit: 50)'
    });
  }

  // Validate and sanitize events
  const validEvents = events.map(event => ({
    event: event.event?.substring(0, 100) || 'unknown',
    properties: event.properties || {},
    user_id: event.userId || null,
    session_id: event.sessionId?.substring(0, 100) || 'unknown',
    page: event.page?.substring(0, 500) || '',
    user_agent: event.userAgent?.substring(0, 1000) || '',
    timestamp: event.timestamp || new Date().toISOString()
  }));

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert(validEvents);

    if (error) throw error;

    res.json({
      success: true,
      tracked: validEvents.length
    });
  } catch (error) {
    // Don't fail loudly - analytics shouldn't break the app
    logger.error('Analytics tracking error:', error);
    res.json({
      success: true,
      tracked: 0
    });
  }
}));

/**
 * Get analytics summary (admin only)
 */
router.get('/summary', authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('event, timestamp')
    .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('timestamp', { ascending: false });

  if (error) throw error;

  // Aggregate by event type
  const summary = events?.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    success: true,
    summary,
    totalEvents: events?.length || 0
  });
}));

export default router;
