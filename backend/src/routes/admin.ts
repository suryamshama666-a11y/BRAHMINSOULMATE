import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin middleware
const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (data?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: 'Authorization failed' });
  }
};

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
    const { status } = req.body;

    const { error } = await supabase
      .from('profiles')
      .update({ verified: status === 'approved' })
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
