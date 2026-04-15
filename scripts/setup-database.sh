#!/bin/bash

echo "🗄️  Setting up Supabase Database..."
echo ""

# Check if Supabase credentials are configured
if [ ! -f backend/.env.local ]; then
    echo "❌ No backend/.env.local file found"
    echo "Please run setup-backend.sh first"
    exit 1
fi

# Check if Supabase credentials are configured
if grep -q "your-project.supabase.co" backend/.env.local; then
    echo "❌ Supabase credentials not configured in backend/.env.local"
    echo "Please edit backend/.env.local first"
    exit 1
fi

# Source environment variables
source backend/.env.local

# Check if SUPABASE_URL is set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set"
    exit 1
fi

echo "✅ Environment configured"
echo ""

# Run migrations
echo "Running database migrations..."
cd backend
npx ts-node scripts/migrate.ts up
cd ..

echo ""
echo "✅ Database setup completed!"
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Start frontend: npm run dev"
echo "3. Visit: http://localhost:8080"
