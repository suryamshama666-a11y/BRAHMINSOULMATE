import express, { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { z } from 'zod';

const router = express.Router();

const verifyStatusSchema = z.enum(['approved', 'rejected', 'pending']);

// Safe field list for admin views — no sensitive data like passwords, internal flags
const ADMIN_PROFILE_FIELDS = 'id, user_id, first_name, last_name, email, age, gender, city, state, verified, subscription_type, role, account_status, created_at, updated_at, last_active, profile_completion';

// Get dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { count: activeSubscriptions } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('subscription_status', 'active')
      .is('deleted_at', null);

    const { count: pendingVerifications } = await supabase
      .from('verification_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    res.json({
      success: true,
      stats: { totalUsers, activeSubscriptions, pendingVerifications }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Verify profile
router.post('/verify/:userId', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const validation = verifyStatusSchema.safeParse(req.body.status);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid verification status' 
      });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ verified: validation.data === 'approved' })
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Get all users (admin only) — with pagination, no SELECT *
router.get('/users', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('profiles')
      .select(ADMIN_PROFILE_FIELDS, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    res.json({ 
      success: true, 
      users: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Delete user (admin only) - with soft delete pattern
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Soft delete by setting account_status to 'deleted'
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: 'deleted', deleted_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
