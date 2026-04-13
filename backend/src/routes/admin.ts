import express, { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { z } from 'zod';

const router = express.Router();

const verifyStatusSchema = z.enum(['approved', 'rejected', 'pending']);

// Get dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeSubscriptions } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    const { count: pendingVerifications } = await supabase
      .from('verification_requests')
      .select('*', { count: 'exact', head: true })
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

// Get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, users: data });
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
