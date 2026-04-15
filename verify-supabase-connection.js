#!/usr/bin/env node

/**
 * Supabase Connection Verification Script
 * Run this after updating your .env.local files with real Supabase credentials
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Supabase Configuration...\n');

// Check frontend .env.local
const frontendEnvPath = path.join(__dirname, '.env.local');
const backendEnvPath = path.join(__dirname, 'backend', '.env.local');

let frontendEnv = {};
let backendEnv = {};

// Read frontend env
if (fs.existsSync(frontendEnvPath)) {
  const content = fs.readFileSync(frontendEnvPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      frontendEnv[key.trim()] = valueParts.join('=').trim();
    }
  });
} else {
  console.error('❌ Frontend .env.local not found!');
  process.exit(1);
}

// Read backend env
if (fs.existsSync(backendEnvPath)) {
  const content = fs.readFileSync(backendEnvPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      backendEnv[key.trim()] = valueParts.join('=').trim();
    }
  });
} else {
  console.error('❌ Backend .env.local not found!');
  process.exit(1);
}

// Validation checks
let hasErrors = false;

console.log('📋 Frontend Configuration:');
console.log('─────────────────────────────────────');

// Check frontend URL
if (!frontendEnv.VITE_SUPABASE_URL || frontendEnv.VITE_SUPABASE_URL.includes('your-project')) {
  console.error('❌ VITE_SUPABASE_URL is not set or still has placeholder value');
  hasErrors = true;
} else if (frontendEnv.VITE_SUPABASE_URL.includes('dotpqqfcamimrsdnvzor')) {
  console.log('✅ VITE_SUPABASE_URL is configured');
} else {
  console.warn('⚠️  VITE_SUPABASE_URL does not match expected project ID');
}

// Check frontend anon key
if (!frontendEnv.VITE_SUPABASE_ANON_KEY || frontendEnv.VITE_SUPABASE_ANON_KEY.includes('your_anon_key')) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set or still has placeholder value');
  hasErrors = true;
} else if (frontendEnv.VITE_SUPABASE_ANON_KEY.startsWith('eyJ')) {
  console.log('✅ VITE_SUPABASE_ANON_KEY is configured');
} else {
  console.error('❌ VITE_SUPABASE_ANON_KEY does not look like a valid JWT token');
  hasErrors = true;
}

console.log('\n📋 Backend Configuration:');
console.log('─────────────────────────────────────');

// Check backend URL
if (!backendEnv.SUPABASE_URL || backendEnv.SUPABASE_URL.includes('your-project')) {
  console.error('❌ SUPABASE_URL is not set or still has placeholder value');
  hasErrors = true;
} else if (backendEnv.SUPABASE_URL.includes('dotpqqfcamimrsdnvzor')) {
  console.log('✅ SUPABASE_URL is configured');
} else {
  console.warn('⚠️  SUPABASE_URL does not match expected project ID');
}

// Check backend service role key
if (!backendEnv.SUPABASE_SERVICE_ROLE_KEY || backendEnv.SUPABASE_SERVICE_ROLE_KEY.includes('your_service_role')) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set or still has placeholder value');
  hasErrors = true;
} else if (backendEnv.SUPABASE_SERVICE_ROLE_KEY.startsWith('eyJ')) {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY is configured');
} else {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY does not look like a valid JWT token');
  hasErrors = true;
}

// Check if URLs match
if (frontendEnv.VITE_SUPABASE_URL && backendEnv.SUPABASE_URL) {
  if (frontendEnv.VITE_SUPABASE_URL === backendEnv.SUPABASE_URL) {
    console.log('✅ Frontend and backend URLs match');
  } else {
    console.error('❌ Frontend and backend URLs do not match!');
    console.error(`   Frontend: ${frontendEnv.VITE_SUPABASE_URL}`);
    console.error(`   Backend:  ${backendEnv.SUPABASE_URL}`);
    hasErrors = true;
  }
}

console.log('\n─────────────────────────────────────');

if (hasErrors) {
  console.error('\n❌ Configuration has errors. Please fix them before running the app.');
  console.log('\n📖 Get your credentials from:');
  console.log('   https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/settings/api\n');
  process.exit(1);
} else {
  console.log('\n✅ All Supabase configuration looks good!');
  console.log('\n🚀 You can now run your app:');
  console.log('   npm run dev        # Frontend');
  console.log('   cd backend && npm run dev  # Backend\n');
  process.exit(0);
}
