#!/usr/bin/env node

/**
 * Quick script to update backend/.env.local with service role key
 * Run: node update-backend-env.js
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
  console.log('🔧 Backend Supabase Configuration\n');
  console.log('Get your service_role key from:');
  console.log('https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/settings/api\n');
  console.log('Look for "service_role" under "Project API keys"\n');
  
  const serviceRoleKey = await question('Paste your service_role key (starts with eyJ...): ');
  
  if (!serviceRoleKey || !serviceRoleKey.startsWith('eyJ')) {
    console.error('\n❌ Invalid key format. Service role key should start with "eyJ"');
    rl.close();
    process.exit(1);
  }
  
  console.log('\n📝 Updating backend/.env.local...\n');
  
  const backendEnvPath = path.join(__dirname, 'backend', '.env.local');
  const backendEnv = `# Supabase Configuration
# Get these from: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwOTgsImV4cCI6MjA5MTc3NzA5OH0.HeuiUzU1Yau1dJe-BogCkK2zKAnjI3LqVkdg237oBPU
SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
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
  console.log('✅ Updated backend/.env.local\n');
  
  rl.close();
  
  console.log('🎉 Configuration complete!\n');
  console.log('🚀 You can now start your app:');
  console.log('   Terminal 1: npm run dev');
  console.log('   Terminal 2: cd backend && npm run dev\n');
  console.log('📊 Monitor your database:');
  console.log('   https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor\n');
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
