/**
 * GDPR compliance endpoints
 * Data export and account deletion
 */

import express from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { apiLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Export user data (GDPR Right to Data Portability)
 */
router.get('/export-data', authMiddleware, apiLimiter, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  try {
    // Collect all user data from various tables — explicit fields only, no SELECT *
    const [profile, messages, matches, favorites, subscriptions, notifications] = await Promise.all([
      supabase.from('profiles').select('id, first_name, last_name, email, age, gender, city, state, country, education_level, occupation, gotra, community, bio, interests, languages, created_at').eq('user_id', userId).single(),
      supabase.from('messages').select('id, content, created_at, read').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
      supabase.from('matches').select('id, status, created_at').or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
      supabase.from('favorites').select('id, favorited_user_id, created_at').eq('user_id', userId),
      supabase.from('subscriptions').select('id, plan, status, current_period_start, current_period_end, created_at').eq('user_id', userId),
      supabase.from('notifications').select('id, type, title, message, read, created_at').eq('user_id', userId)
    ]);

    const userData = {
      profile: profile.data,
      messages: messages.data || [],
      matches: matches.data || [],
      favorites: favorites.data || [],
      subscriptions: subscriptions.data || [],
      notifications: notifications.data || [],
      exportedAt: new Date().toISOString(),
      userId
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    logger.error('Data export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
}));

/**
 * Delete user account (GDPR Right to Erasure)
 */
router.delete('/delete-account', authMiddleware, apiLimiter, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const { confirmation } = req.body;

  if (confirmation !== 'DELETE_MY_ACCOUNT') {
    return res.status(400).json({
      success: false,
      error: 'Confirmation text required'
    });
  }

  try {
    // Delete user from auth (cascading deletes will handle related data)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
}));

/**
 * Request data deletion (for non-authenticated requests)
 */
router.post('/request-deletion', apiLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }

  try {
    // Record the deletion request in the database
    const { error } = await supabase
      .from('deletion_requests')
      .insert({
        email,
        status: 'pending',
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Deletion request received. Our team will review it shortly.'
    });
  } catch (error) {
    logger.error('Deletion request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process deletion request'
    });
  }
}));

export default router;
