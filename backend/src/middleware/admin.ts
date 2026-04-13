import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Middleware to check if user is admin
 * Verifies admin role from database
 */
export const adminMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    return res.status(401).json({ success: false, error: 'User not authenticated' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || data?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    // Set admin flag in request for downstream use
    (req as any).user.isAdmin = true;
    next();
  } catch (error) {
    console.error('Admin check failed:', error);
    res.status(500).json({ success: false, error: 'Failed to verify admin privileges' });
  }
});
