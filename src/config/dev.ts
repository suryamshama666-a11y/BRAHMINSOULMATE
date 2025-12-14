// Development Configuration
// WARNING: Only use in development mode!

const isDevBypass = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

// Show big warning in console when dev mode is active
if (isDevBypass) {
  console.log('%c🔓 DEVELOPMENT MODE ACTIVE', 'background: #ff0000; color: #ffffff; font-size: 20px; padding: 10px;');
  console.log('%cAuthentication is BYPASSED', 'background: #ffaa00; color: #000000; font-size: 16px; padding: 5px;');
  console.log('%cUsing mock user: dev@test.com', 'color: #0066cc; font-size: 14px;');
  console.log('%cTo disable: Set VITE_DEV_BYPASS_AUTH=false in .env.local', 'color: #666666; font-size: 12px;');
}

export const DEV_CONFIG = {
  // Set to true to bypass authentication in development
  BYPASS_AUTH: isDevBypass,
  
  // Mock user for development
  MOCK_USER: {
    id: 'dev-user-123',
    email: 'dev@test.com',
    user_metadata: {
      full_name: 'Dev User'
    }
  },
  
  // Mock profile for development
  MOCK_PROFILE: {
    user_id: 'dev-user-123',
    full_name: 'Dev User',
    email: 'dev@test.com',
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

// Helper to check if we're in dev bypass mode
export const isDevBypassMode = () => {
  return DEV_CONFIG.BYPASS_AUTH;
};

// Get mock user for development
export const getDevUser = () => {
  return isDevBypassMode() ? DEV_CONFIG.MOCK_USER : null;
};

// Get mock profile for development
export const getDevProfile = () => {
  return isDevBypassMode() ? DEV_CONFIG.MOCK_PROFILE : null;
};
