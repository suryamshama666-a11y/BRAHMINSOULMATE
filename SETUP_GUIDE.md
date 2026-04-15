# 🚀 Complete Setup Guide - Brahmin Soulmate Connect

## Problem: Supabase Connection Timeout

**Issue:** The app was timing out connecting to Supabase because:
1. Missing or incorrect Supabase credentials in `.env.local` files
2. No Supabase project configured
3. No database migrations run

**Solution:** This guide will help you set up a fresh backend with Supabase.

---

## Option 1: Quick Start (Mock Mode - No Backend Required)

If you just want to test the frontend UI without a real database:

```bash
npm run dev
```

The app will run on `http://localhost:8080` with mock data.

**What works in mock mode:**
- ✅ Frontend UI and navigation
- ✅ Profile cards and components
- ✅ Search interface
- ✅ Landing page
- ❌ Real database operations
- ❌ Authentication
- ❌ Messaging
- ❌ Payments

---

## Option 2: Full Setup (With Real Backend)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `brahmin-soulmate`
   - Database password: (create a strong password)
   - Region: (choose closest to you)
5. Wait for project to be ready (~2 minutes)
6. Go to **Project Settings** → **API**
7. Copy these values:
   - **Project URL** → `https://your-project.supabase.co`
   - **anon/public key** → `eyJhbGciOiJIUzI1NiIs...`
   - **service_role key** → `eyJhbGciOiJIUzI1NiIs...` (keep this secret!)

### Step 2: Configure Backend Environment

Edit `backend/.env.local` with your Supabase credentials:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Application Settings
PORT=3001
FRONTEND_URL=http://localhost:8080
NODE_ENV=development

# Razorpay Configuration (Payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# Other services (optional for now)
VEDIC_ASTRO_API_KEY=your_vedic_api_key_here
SENDGRID_API_KEY=SG.your_sendgrid_key_here
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
AGORA_APP_ID=your_agora_app_id_here
SENTRY_DSN=https://your_sentry_dsn@o0.ingest.sentry.io/0
```

**Important:** 
- Never commit `.env.local` to version control
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` secret!

### Step 3: Run Setup Script

**Windows:**
```powershell
# Make sure you're in the project root
.\scripts\setup-backend.ps1
```

**Linux/Mac:**
```bash
# Make the script executable
chmod +x scripts/setup-backend.sh

# Run the script
./scripts/setup-backend.sh
```

**Manual Setup (if script fails):**
```bash
# Install backend dependencies
cd backend
npm install

# Run database migrations
npx ts-node scripts/migrate.ts up

# Start backend server
npm run dev
```

### Step 4: Verify Backend is Running

Open a new terminal and test the backend:

```bash
curl http://localhost:3001/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2026-04-15T...",
  "uptime": 123.45,
  "environment": "development",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful"
    }
  }
}
```

### Step 5: Start Frontend

In the project root:

```bash
npm run dev
```

The frontend will start on `http://localhost:8080`

### Step 6: Test the Application

1. Open `http://localhost:8080` in your browser
2. You should see the landing page
3. Click "Register Free" to test registration
4. Fill in profile details
5. Start searching for matches

---

## Database Migrations

The setup script automatically runs migrations. Here's what it does:

1. Connects to Supabase using credentials from `.env.local`
2. Runs all pending migrations from `backend/src/migrations/`
3. Updates the database schema to the latest version

**Manual migration commands:**

```bash
# Run pending migrations
cd backend
npx ts-node scripts/migrate.ts up

# Check migration status
npx ts-node scripts/migrate.ts status

# Rollback last migration (use with caution!)
npx ts-node scripts/migrate.ts down
```

---

## Troubleshooting

### "Supabase connection timeout"

**Cause:** Supabase URL or key is incorrect

**Solution:**
1. Double-check `SUPABASE_URL` in `.env.local`
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Make sure there are no extra spaces or quotes
4. Restart the backend server after fixing

### "Database connection failed"

**Cause:** Supabase project not ready or firewall blocking

**Solution:**
1. Wait 2-3 minutes after creating Supabase project
2. Check Supabase dashboard for project status
3. Verify your IP isn't blocked
4. Try connecting from a different network

### "Port 3001 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### "Migration failed"

**Cause:** Database schema already exists or migration script error

**Solution:**
```bash
# Check migration status
cd backend
npx ts-node scripts/migrate.ts status

# If schema exists, you may need to reset
# WARNING: This will delete all data!
npx ts-node scripts/migrate.ts down
npx ts-node scripts/migrate.ts up
```

### "Environment validation failed"

**Cause:** Missing required environment variables

**Solution:** Edit `backend/.env.local` and ensure all required variables are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

---

## Testing the Application

### Backend Testing

```bash
# Health check
curl http://localhost:3001/health

# Readiness probe
curl http://localhost:3001/ready

# Circuit breaker status
curl http://localhost:3001/health/circuit-breakers
```

### Frontend Testing

1. Open `http://localhost:8080`
2. Test registration flow
3. Test login flow
4. Test profile creation
5. Test search functionality
6. Test messaging (if authenticated)

---

## Next Steps

After setup is complete:

1. **Test all features** - Make sure everything works
2. **Review security** - Check all environment variables are secure
3. **Set up monitoring** - Configure Sentry for error tracking
4. **Deploy to staging** - Test in a staging environment
5. **Deploy to production** - Follow production deployment guide

---

## Need Help?

Check these files:
- `QUICK_START.md` - Quick setup guide
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `PRODUCTION_HARDENING_COMPLETE.md` - Production setup
- `PROJECT_RATING_AND_REVIEW.md` - Project overview

---

## Summary

**Quick Fix (Mock Mode):**
```bash
npm run dev
```

**Full Setup:**
1. Create Supabase project
2. Configure `backend/.env.local`
3. Run `scripts/setup-backend.ps1` or `scripts/setup-backend.sh`
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `npm run dev`

**That's it!** Your app should now be running with a real Supabase connection.
