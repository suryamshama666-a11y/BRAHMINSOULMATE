#!/usr/bin/env node

/**
 * Interactive script to update Supabase credentials in .env.local files
 * Run: node update-supabase-credentials.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔧 Supabase Credentials Setup\n');
  console.log('Get your credentials from:');
  console.log('https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/settings/api\n');
  
  // Get credentials from user
  const projectUrl = await question('Enter your Supabase Project URL (e.g., https://dotpqqfcamimrsdnvzor.supabase.co): ');
  const anonKey = await question('Enter your anon/public key (starts with eyJ...): ');
  const serviceRoleKey = await question('Enter your service_role key (starts with eyJ...): ');
  
  console.log('\n📝 Updating environment files...\n');
  
  // Update frontend .env.local
  const frontendEnvPath = path.join(__dirname, '.env.local');
  const frontendEnv = `# Supabase Configuration
# Get these from: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=${projectUrl.trim()}
VITE_SUPABASE_ANON_KEY=${anonKey.trim()}

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Development Mode
VITE_DEV_BYPASS_AUTH=false
`;
  
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Updated .env.local');
  
  // Update backend .env.local
  const backendEnvPath = path.join(__dirname, 'backend', '.env.local');
  const backendEnv = `# Supabase Configuration
# Get these from: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=${projectUrl.trim()}
VITE_SUPABASE_ANON_KEY=${anonKey.trim()}
SUPABASE_URL=${projectUrl.trim()}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey.trim()}

# Application Settings
PORT=3001
FRONTEND_URL=http://localhost:8080
NODE_ENV=development

# Razorpay Configuration (Payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# Vedic astrology API (Horoscope Matching)
VEDIC_ASTRO_API_KEY=your_vedic_api_key_here

# SendGrid Configuration (Email)
SENDGRID_API_KEY=SG.your_sendgrid_key_here
SENDGRID_FROM_EMAIL=noreply@brahminsoulmate.com

# Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Agora Configuration (Video Calls)
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_certificate_here

# Sentry Configuration (Monitoring - Optional)
SENTRY_DSN=https://your_sentry_dsn@o0.ingest.sentry.io/0

# SECURITY WARNING: Never commit secrets to version control!
# This file is already in .gitignore
`;
  
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Updated backend/.env.local');
  
  console.log('\n🔍 Verifying configuration...\n');
  
  // Run verification
  rl.close();
  
  // Spawn verification script
  const { spawn } = require('child_process');
  const verify = spawn('node', ['verify-supabase-connection.js'], {
    stdio: 'inherit'
  });
  
  verify.on('close', (code) => {
    if (code === 0) {
      console.log('\n🎉 Setup complete! You can now run your app:');
      console.log('   npm run dev        # Frontend');
      console.log('   cd backend && npm run dev  # Backend\n');
    }
  });
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
