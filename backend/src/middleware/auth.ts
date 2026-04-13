import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Set user context for Sentry
    Sentry.setUser({
      id: user.id || req.ip,
      email: user.email,
      ip_address: req.ip,
    });

    req.user = user;
    next();
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

