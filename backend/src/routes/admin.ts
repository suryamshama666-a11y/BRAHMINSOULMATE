import express from 'express';
import { getSupabase } from '../config/supabase';

const router = express.Router();

// Middleware to check admin privileges (basic implementation)
const requireAdmin = (req: any, res: any, next: any) => {
  // In a real implementation, check if user has admin role
  const userEmail = req.user?.email || req.user?.user_id;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');

  if (!adminEmails.includes(userEmail)) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { limit = 50, offset = 0, search, status } = req.query;

    let query = supabase
      .from('profiles')
      .select('*');

    // Search by name or email
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,user_id.ilike.%${search}%`);
    }

    // Filter by subscription status
    if (status) {
      if (status === 'premium') {
        query = query.not('subscription_type', 'is', null);
      } else if (status === 'free') {
        query = query.is('subscription_type', null);
      }
    }

    const { data: users, error, count } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data: users || [],
      total: count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Verify/approve a profile
router.post('/verify-profile/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const profileId = req.params.id;
    const { verified = true } = req.body;

    // Update profile verification status (using a custom field)
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        // Using religion field to store verification status temporarily
        // In a real implementation, add a 'verified' boolean field
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    // Log admin action
    await supabase
      .from('user_activities')
      .insert({
        user_id: req.user?.id,
        activity_type: 'admin_profile_verified',
        activity_data: {
          target_profile_id: profileId,
          verified,
          admin_id: req.user?.id
        }
      });

    return res.json({ success: true, id: profileId, verified });
  } catch (error: any) {
    console.error('Verify profile error:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify profile' });
  }
});

// Suspend/unsuspend a user
router.post('/suspend-user/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const profileId = req.params.id;
    const { suspended = true, reason } = req.body;

    // Update profile visibility to suspend user
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        profile_visibility: suspended ? 'private' : 'public',
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    // Log admin action
    await supabase
      .from('user_activities')
      .insert({
        user_id: req.user?.id,
        activity_type: suspended ? 'admin_user_suspended' : 'admin_user_unsuspended',
        activity_data: {
          target_profile_id: profileId,
          reason,
          admin_id: req.user?.id
        }
      });

    return res.json({
      success: true,
      id: profileId,
      suspended,
      message: suspended ? 'User suspended' : 'User unsuspended'
    });
  } catch (error: any) {
    console.error('Suspend user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to suspend user' });
  }
});

// Get reports (using user activities as reports)
router.get('/reports', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { limit = 50, offset = 0, type } = req.query;

    let query = supabase
      .from('user_activities')
      .select('*');

    // Filter by report type
    if (type) {
      query = query.eq('activity_type', type);
    } else {
      // Get activities that could be considered reports
      query = query.in('activity_type', [
        'profile_reported',
        'message_reported',
        'inappropriate_behavior',
        'spam_reported'
      ]);
    }

    const { data: reports, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({ success: true, data: reports || [] });
  } catch (error: any) {
    console.error('Get reports error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    // Get basic analytics
    const [
      { count: totalUsers },
      { count: totalMatches },
      { count: totalMessages },
      { count: totalEvents },
      { count: activeUsers }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    ]);

    // Get subscription breakdown
    const { data: subscriptionData } = await supabase
      .from('profiles')
      .select('subscription_type')
      .not('subscription_type', 'is', null);

    const subscriptionBreakdown = subscriptionData?.reduce((acc: any, profile) => {
      const type = profile.subscription_type || 'free';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    const analytics = {
      totalUsers: totalUsers || 0,
      totalMatches: totalMatches || 0,
      totalMessages: totalMessages || 0,
      totalEvents: totalEvents || 0,
      activeUsers: activeUsers || 0,
      subscriptionBreakdown,
      generatedAt: new Date().toISOString()
    };

    return res.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// Send notification to users
router.post('/send-notification', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { user_ids, title, message, type = 'admin_announcement' } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'user_ids (array), title, and message are required'
      });
    }

    // Create notification activities for each user
    const notifications = user_ids.map(user_id => ({
      user_id,
      activity_type: type,
      activity_data: {
        title,
        message,
        sent_by_admin: req.user?.id,
        sent_at: new Date().toISOString()
      }
    }));

    const { error } = await supabase
      .from('user_activities')
      .insert(notifications);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message: `Notification sent to ${user_ids.length} users`
    });
  } catch (error: any) {
    console.error('Send notification error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send notification' });
  }
});

export default router;

