#!/bin/bash

echo "🚀 Setting up Brahmin Soulmate Backend..."
echo ""

# Check if .env.local exists
if [ ! -f backend/.env.local ]; then
    echo "❌ No .env.local file found in backend/"
    echo "Creating backend/.env.local from example..."
    cp backend/.env.example backend/.env.local
    echo ""
    echo "📝 Please edit backend/.env.local with your Supabase credentials:"
    echo "   - SUPABASE_URL: https://your-project.supabase.co"
    echo "   - SUPABASE_SERVICE_ROLE_KEY: your_service_role_key"
    echo "   - VITE_SUPABASE_URL: https://your-project.supabase.co"
    echo "   - VITE_SUPABASE_ANON_KEY: your_anon_key"
    echo ""
    echo "Get these from: https://app.supabase.com/project/_/settings/api"
    exit 1
fi

# Check if Supabase credentials are configured
if grep -q "your-project.supabase.co" backend/.env.local; then
    echo "❌ Supabase credentials not configured in backend/.env.local"
    echo ""
    echo "Please edit backend/.env.local and replace:"
    echo "   VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "   VITE_SUPABASE_ANON_KEY=your_anon_key_here"
    echo "   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
    echo ""
    echo "Get these from: https://app.supabase.com/project/_/settings/api"
    exit 1
fi

echo "✅ Environment file configured"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd backend
npm install
cd ..

echo ""
echo "✅ Dependencies installed"
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
cd backend
npx ts-node scripts/migrate.ts up
cd ..

echo ""
echo "✅ Migrations completed"
echo ""

# Start backend server
echo "🚀 Starting backend server..."
cd backend
npm run dev
cd ..
