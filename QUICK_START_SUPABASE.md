# 🚀 Quick Start - Supabase Setup (5 Minutes)

## Step 1: Run the Migration (2 minutes)

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/sql/new
   ```

2. Open `SUPABASE_MIGRATION_READY.sql` in this project

3. Copy the entire file (Ctrl+A, Ctrl+C)

4. Paste into SQL Editor and click **RUN**

5. Wait for "Success. No rows returned" message

✅ **Database is now set up!**

---

## Step 2: Update Credentials (2 minutes)

### Option A: Interactive Script (Easiest)

```bash
node update-supabase-credentials.js
```

Follow the prompts and paste your credentials.

### Option B: Manual Update

1. Get credentials from:
   ```
   https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/settings/api
   ```

2. Copy these values:
   - **Project URL** (e.g., `https://dotpqqfcamimrsdnvzor.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

3. Update `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ... (paste your anon key)
   VITE_API_URL=http://localhost:3001/api
   VITE_DEV_BYPASS_AUTH=false
   ```

4. Update `backend/.env.local`:
   ```env
   VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ... (paste your anon key)
   SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (paste your service role key)
   
   PORT=3001
   FRONTEND_URL=http://localhost:8080
   NODE_ENV=development
   ```

---

## Step 3: Verify Setup (30 seconds)

```bash
node verify-supabase-connection.js
```

You should see:
```
✅ VITE_SUPABASE_URL is configured
✅ VITE_SUPABASE_ANON_KEY is configured
✅ SUPABASE_URL is configured
✅ SUPABASE_SERVICE_ROLE_KEY is configured
✅ Frontend and backend URLs match
✅ All Supabase configuration looks good!
```

---

## Step 4: Start Your App (30 seconds)

### Terminal 1 - Frontend:
```bash
npm run dev
```

### Terminal 2 - Backend:
```bash
cd backend
npm run dev
```

---

## ✅ You're Done!

Your app is now running with real Supabase database:

- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001
- **Database**: https://dotpqqfcamimrsdnvzor.supabase.co

### What Changed?

- ❌ **Before**: Mock Supabase client (no real data)
- ✅ **After**: Real Supabase database (persistent data)

### Test It:

1. Go to http://localhost:8080
2. Register a new account
3. Check Supabase dashboard:
   ```
   https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/auth/users
   ```
4. You should see your new user!

---

## 📊 Monitor Your Database

- **Tables**: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/editor
- **Users**: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/auth/users
- **Logs**: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/logs/explorer
- **API Docs**: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/api

---

## 🆘 Troubleshooting

### "Unauthorized" error
```bash
# Check credentials are correct (no extra spaces)
node verify-supabase-connection.js
```

### "Table does not exist"
```
# Re-run the migration in Supabase SQL Editor
# Verify tables exist in Table Editor
```

### Still seeing mock mode
```bash
# Restart both servers after updating .env.local files
# Check console logs for "✅ Connected to Supabase"
```

---

## 📚 Additional Resources

- **Full Guide**: `SUPABASE_MIGRATION_OPTIONS.md`
- **MCP Setup**: `MCP_SUPABASE_SETUP.md`
- **Migration SQL**: `SUPABASE_MIGRATION_READY.sql`
- **Complete Summary**: `SUPABASE_SETUP_COMPLETE.md`

---

**Need help?** Check the troubleshooting section or review the detailed guides above.
