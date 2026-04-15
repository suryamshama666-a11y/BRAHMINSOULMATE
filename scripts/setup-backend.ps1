# PowerShell script to set up Brahmin Soulmate Backend

Write-Host "🚀 Setting up Brahmin Soulmate Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path "backend\.env.local")) {
    Write-Host "❌ No .env.local file found in backend/" -ForegroundColor Red
    Write-Host "Creating backend\.env.local from example..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env.local"
    Write-Host ""
    Write-Host "📝 Please edit backend\.env.local with your Supabase credentials:" -ForegroundColor Yellow
    Write-Host "   - SUPABASE_URL: https://your-project.supabase.co"
    Write-Host "   - SUPABASE_SERVICE_ROLE_KEY: your_service_role_key"
    Write-Host "   - VITE_SUPABASE_URL: https://your-project.supabase.co"
    Write-Host "   - VITE_SUPABASE_ANON_KEY: your_anon_key"
    Write-Host ""
    Write-Host "Get these from: https://app.supabase.com/project/_/settings/api" -ForegroundColor Yellow
    exit 1
}

# Check if Supabase credentials are configured
if (Get-Content "backend\.env.local" | Select-String "your-project.supabase.co") {
    Write-Host "❌ Supabase credentials not configured in backend\.env.local" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please edit backend\.env.local and replace:" -ForegroundColor Yellow
    Write-Host "   VITE_SUPABASE_URL=https://your-project.supabase.co"
    Write-Host "   VITE_SUPABASE_ANON_KEY=your_anon_key_here"
    Write-Host "   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
    Write-Host ""
    Write-Host "Get these from: https://app.supabase.com/project/_/settings/api" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment file configured" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

Write-Host ""
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
Set-Location backend
npx ts-node scripts/migrate.ts up
Set-Location ..

Write-Host ""
Write-Host "✅ Migrations completed" -ForegroundColor Green
Write-Host ""

# Start backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Set-Location backend
npm run dev
Set-Location ..
