/**
 * Authentication Middleware
 * Verifies user authentication for protected routes
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

/**
 * Extended Request interface with user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication middleware
 * Verifies Bearer token and attaches user to request
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid Bearer token.'
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token || token.trim() === '') {
      res.status(401).json({
        success: false,
        error: 'Invalid or empty token provided.'
      });
      return;
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token. Please login again.'
      });
      return;
    }

    // Attach user information to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user'
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed. Please try again.'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if authenticated, but doesn't block if not
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'user'
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Admin authentication middleware
 * Verifies user has admin role
 */
export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First run standard auth check
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token.'
      });
      return;
    }

    // Check admin role
    const role = user.user_metadata?.role || 'user';
    if (role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required.'
      });
      return;
    }

    // Attach user information
    req.user = {
      id: user.id,
      email: user.email,
      role: role
    };

    next();
  } catch (error) {
    console.error('[AdminMiddleware] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed.'
    });
  }
};

/**
 * Get user ID from request (helper function)
 */
export const getUserId = (req: AuthRequest): string | undefined => {
  return req.user?.id;
};

/**
 * Check if user is authenticated (helper function)
 */
export const isAuthenticated = (req: AuthRequest): boolean => {
  return !!req.user;
};

/**
 * Check if user has specific role (helper function)
 */
export const hasRole = (req: AuthRequest, role: string): boolean => {
  return req.user?.role === role;
};