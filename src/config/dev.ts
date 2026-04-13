// Development Configuration - ONLY for development use
// WARNING: This should never be used in production
// This uses build-time dead code elimination - the bypass only works in dev builds

import { logger } from '@/utils/logger';

export const DEV_CONFIG = {
  // Mock user for development testing (safe for demos)
  MOCK_USER: {
    id: 'dev-user-123',
    email: 'dev@example.com',
    user_metadata: {
      full_name: 'Dev User'
    }
  },

  // Mock profile for development testing
  MOCK_PROFILE: {
    user_id: 'dev-user-123',
    full_name: 'Dev User',
    email: 'dev@example.com',
    age: 28,
    gender: 'male',
    city: 'Mumbai',
    state: 'Maharashtra',
    education: 'B.Tech',
    occupation: 'Software Engineer',
    subscription_type: 'premium',
    role: 'user',
    profile_picture: '/placeholder.svg'
  }
};

// Helper to check if we're in dev bypass mode (should be false in production)
// This function is designed to be eliminated by build tools in production
export const isDevBypassMode = () => {
  // Double-check: never allow bypass in production builds
  if (import.meta.env.PROD) {
    return false;
  }

  // Only allow in development and only when explicitly enabled
  return import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
};

// Get mock user for development (only when explicitly enabled)
export const getDevUser = () => {
  return isDevBypassMode() ? DEV_CONFIG.MOCK_USER : null;
};

// Get mock profile for development (only when explicitly enabled)
export const getDevProfile = () => {
  return isDevBypassMode() ? DEV_CONFIG.MOCK_PROFILE : null;
};

// Show warning ONLY when dev bypass is active
if (import.meta.env.DEV && isDevBypassMode()) {
  logger.log('%c⚠️ DEVELOPMENT BYPASS ACTIVE', 'background: #ff0000; color: #ffffff; font-size: 20px; padding: 10px;');
  logger.log('%cAuthentication is being bypassed for development/testing only', 'background: #ffaa00; color: #000000; font-size: 16px; padding: 5px;');
  logger.log('%cTo disable: Set VITE_DEV_BYPASS_AUTH=false in .env.local', 'color: #666666; font-size: 12px;');
}
