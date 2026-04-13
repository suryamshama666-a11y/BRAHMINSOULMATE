/**
 * Environment configuration with validation
 * Fails fast if required environment variables are missing
 */

// Required environment variables
const REQUIRED_ENV_VARS = {
  VITE_SUPABASE_URL: import.meta.env.VITE_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  VITE_RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  VITE_VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
  VITE_SENTRY_ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  VITE_SENTRY_RELEASE: import.meta.env.VITE_SENTRY_RELEASE || '0.0.0',
} as const;

// Validate required environment variables
function validateEnv() {
  // Skip validation in test environment
  if (import.meta.env.MODE === 'test') {
    return;
  }
  
  const missing: string[] = [];
  
  for (const [key, value] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

// Validate on module load
validateEnv();

// Export validated configuration
export const env = {
  // Supabase
  supabase: {
    url: REQUIRED_ENV_VARS.VITE_SUPABASE_URL,
    anonKey: REQUIRED_ENV_VARS.VITE_SUPABASE_ANON_KEY,
  },
  
  // API
  api: {
    baseUrl: OPTIONAL_ENV_VARS.VITE_API_BASE_URL,
    url: OPTIONAL_ENV_VARS.VITE_API_URL,
  },
  
  // Payment
  payment: {
    razorpayKeyId: OPTIONAL_ENV_VARS.VITE_RAZORPAY_KEY_ID,
  },
  
  // Notifications
  notifications: {
    vapidPublicKey: OPTIONAL_ENV_VARS.VITE_VAPID_PUBLIC_KEY,
  },
  
  // Monitoring
  sentry: {
    dsn: OPTIONAL_ENV_VARS.VITE_SENTRY_DSN,
    environment: OPTIONAL_ENV_VARS.VITE_SENTRY_ENVIRONMENT,
    release: OPTIONAL_ENV_VARS.VITE_SENTRY_RELEASE,
  },
  
  // Environment flags
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

export default env;
