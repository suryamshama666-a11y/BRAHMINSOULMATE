# PowerShell script to set up Supabase Database

Write-Host "🗄️  Setting up Supabase Database..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase credentials are configured
if (-not (Test-Path "backend\.env.local")) {
    Write-Host "❌ No backend\.env.local file found" -ForegroundColor Red
    Write-Host "Please run setup-backend.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Check if Supabase credentials are configured
if (Get-Content "backend\.env.local" | Select-String "your-project.supabase.co") {
    Write-Host "❌ Supabase credentials not configured in backend\.env.local" -ForegroundColor Red
    Write-Host "Please edit backend\.env.local first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment configured" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Cyan
Set-Location backend
npx ts-node scripts/migrate.ts up
Set-Location ..

Write-Host ""
Write-Host "✅ Database setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd backend && npm run dev"
Write-Host "2. Start frontend: npm run dev"
Write-Host "3. Visit: http://localhost:8080"
