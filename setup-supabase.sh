#!/bin/bash

# Supabase Migration Setup Script
# Project: Brahmin Soulmate Connect
# Supabase Project ID: dotpqqfcamimrsdnvzor

echo "🚀 Brahmin Soulmate Connect - Supabase Migration"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Development Mode
VITE_DEV_BYPASS_AUTH=false
EOF
    echo -e "${GREEN}✅ Created .env.local${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
fi

# Check if backend/.env.local exists
if [ ! -f "backend/.env.local" ]; then
    echo -e "${YELLOW}Creating backend/.env.local file...${NC}"
    cat > backend/.env.local << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

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
EOF
    echo -e "${GREEN}✅ Created backend/.env.local${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env.local already exists${NC}"
fi

echo ""
echo -e "${GREEN}✅ Environment files created!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo ""
echo "1. Get your Supabase credentials:"
echo "   👉 https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/settings/api"
echo ""
echo "2. Update .env.local files with your actual keys"
echo ""
echo "3. Run database migrations:"
echo "   cd backend && npm run migrate"
echo ""
echo "4. Start the development servers:"
echo "   npm run dev          # Frontend"
echo "   cd backend && npm run dev  # Backend"
echo ""
echo -e "${GREEN}📖 Full guide: SUPABASE_MIGRATION_GUIDE.md${NC}"
echo ""
