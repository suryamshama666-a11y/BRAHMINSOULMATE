/**
 * Centralized authentication utilities for frontend services
 * Consolidates duplicate authentication check patterns
 */

import { supabase } from '@/integrations/supabase/client';
import { isDevBypassMode, getDevUser } from '@/config/dev';
import type { User } from '@supabase/supabase-js';

/**
 * Get current authenticated user
 * Handles both production auth and dev bypass mode
 * @returns Current user or null if not authenticated
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (isDevBypassMode()) {
    const devUser = getDevUser();
    if (devUser) {
      // Return a minimal User-like object for dev mode
      return {
        id: devUser.id,
        email: devUser.email,
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
    }
    return null;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Get current user ID
 * @returns User ID or null if not authenticated
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.id || null;
};

/**
 * Ensure user is authenticated, throw error if not
 * @param errorMessage - Custom error message
 * @returns Authenticated user
 * @throws Error if not authenticated
 */
export const requireAuth = async (errorMessage: string = 'Not authenticated'): Promise<User> => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error(errorMessage);
  }
  
  return user;
};

/**
 * Check if user is authenticated
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user !== null;
};
