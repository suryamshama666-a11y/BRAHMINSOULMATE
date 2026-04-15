# 🚀 Quick Start Guide

## Problem: Supabase Connection Timeout

The app was timing out connecting to Supabase because:
1. Missing or incorrect Supabase credentials
2. No `.env.local` file in backend folder
3. Supabase URL/key not configured

## Solution: Two Options

### Option 1: Use Mock Mode (For Development - No Backend Required)

The app now runs in **mock mode** automatically when Supabase credentials are missing. This allows you to:
- Test the frontend UI
- See the app structure
- Develop features without backend

**Just run:**
```bash
npm run dev
```

The app will start on `http://localhost:8080` with mock data.

### Option 2: Set Up Fresh Backend (For Full Functionality)

**Step 1: Create Supabase Project**
1. Go to https://supabase.com
2. Sign up and create a new project
3. Wait for project to be ready (~2 minutes)
4. Go to Project Settings → API
5. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon/public key` → `VITE_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

**Step 2: Configure Backend**
```bash
# Edit backend/.env.local with your Supabase credentials
# Replace these placeholder values:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

**Step 3: Run Setup Script**

Windows:
```powershell
.\scripts\setup-backend.ps1
```

Linux/Mac:
```bash
chmod +x scripts/setup-backend.sh
./scripts/setup-backend.sh
```

**Step 4: Start Backend**
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3001`

**Step 5: Start Frontend**
```bash
npm run dev
```

Frontend will run on `http://localhost:8080`

## Database Migrations

The setup script automatically runs migrations. If you need to run them manually:

```bash
cd backend
npx ts-node scripts/migrate.ts up
```

## Testing the Connection

Once backend is running, visit:
- `http://localhost:3001/health` - Should return `{"status":"OK"}`
- `http://localhost:8080` - Frontend should load

## Troubleshooting

### "Supabase connection timeout"
**Solution:** Check your `.env.local` file has correct credentials

### "Database connection failed"
**Solution:** 
1. Verify Supabase project is active
2. Check firewall allows connections to Supabase
3. Try running migrations manually

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

## What Works in Mock Mode

✅ Frontend UI and navigation  
✅ Profile cards and components  
✅ Search interface  
✅ Landing page  
❌ Real data from database  
❌ Authentication  
❌ Messaging  
❌ Payments  
❌ Real-time features  

## Next Steps

1. **For Development:** Use mock mode, build features
2. **For Production:** Set up real Supabase, run migrations
3. **For Testing:** Configure test database, run E2E tests

## Need Help?

Check these files:
- `QUICK_START.md` - This file
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `PRODUCTION_HARDENING_COMPLETE.md` - Production setup
