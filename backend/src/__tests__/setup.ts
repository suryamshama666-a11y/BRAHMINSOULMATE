// Test environment setup
// Force development environment
process.env.NODE_ENV = 'test';

// Mock Supabase credentials if not present
process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mock-project.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'mock-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'mock_razorpay_key';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'mock_razorpay_secret';
process.env.SENTRY_DSN = ''; // Disable sentry in tests
