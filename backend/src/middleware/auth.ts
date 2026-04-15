/**
 * Authentication Middleware
 * Verifies user authentication for protected routes
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

/**
 * Extended Request interface with user information
 * Uses the Express Request type which is extended in types/express.d.ts
 */
export type AuthRequest = Request;

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
    req.user = user;

    next();
  } catch (error) {
    logger.error('[AuthMiddleware] Error:', error);
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
        req.user = user;
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
 * Verifies user has admin role from DATABASE (not user_metadata, which is client-controllable)
 * 
 * SECURITY: user_metadata can be set by the user during signup.
 * Always verify roles against the profiles table.
 */
export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Require user to be already authenticated (use authMiddleware first)
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
      return;
    }

    // SECURITY: Check admin role from DATABASE, never from user_metadata
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data || data.role !== 'admin') {
      logger.warn(`[AdminMiddleware] Non-admin access attempt by user: ${userId}`);
      res.status(403).json({
        success: false,
        error: 'Admin access required.'
      });
      return;
    }

    // Set admin flag for downstream use
    (req as any).isAdmin = true;

    next();
  } catch (error) {
    logger.error('[AdminMiddleware] Error:', error);
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
 * IMPORTANT: For admin checks, always use adminMiddleware which verifies against DB
 */
export const hasRole = async (req: AuthRequest, role: string): Promise<boolean> => {
  const userId = req.user?.id;
  if (!userId) return false;
  
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
    
  return data?.role === role;
};