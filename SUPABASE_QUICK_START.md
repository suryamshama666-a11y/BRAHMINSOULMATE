# ⚡ SUPABASE QUICK START
## 5-Minute Setup Guide

---

## 🎯 WHAT YOU'LL DO

1. Create Supabase project (2 min)
2. Get credentials (1 min)
3. Set environment variables (1 min)
4. Run database schema (1 min)

**Total: 5 minutes**

---

## 📋 STEP 1: CREATE PROJECT

### Go to Supabase
```
https://supabase.com
```

### Create New Project
1. Click **"New Project"**
2. Fill in:
   - **Project Name**: `brahmin-soulmate-connect`
   - **Database Password**: `YourStrongPassword123!`
   - **Region**: `ap-south-1` (India) or closest to you
3. Click **"Create new project"**
4. Wait 2-3 minutes for initialization

---

## 🔑 STEP 2: GET CREDENTIALS

### Copy These Values

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Key** (long string starting with `eyJ...`)
   - **Service Role Key** (long string starting with `eyJ...`)

---

## 🔧 STEP 3: SET ENVIRONMENT VARIABLES

### Create `.env.local` (Frontend)

In project root, create file `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Create `.env` (Backend)

In `backend/` folder, create file `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 🗄️ STEP 4: RUN DATABASE SCHEMA

### In Supabase Dashboard

1. Click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy entire content from `database/schema.sql`
4. Paste into editor
5. Click **Run**
6. Wait for completion ✅

---

## ✅ VERIFY IT WORKS

### Test Frontend

```bash
npm run dev
```

Open browser console - should see:
```
✅ Supabase connected
```

### Test Backend

```bash
cd backend
npm run verify-supabase
```

Should see:
```
✅ Connected to Supabase
✅ Database accessible
✅ Tables created
```

---

## 🎉 DONE!

Your Supabase is now set up and ready to use.

**Next**: Follow `DEPLOYMENT_CHECKLIST_FINAL.md` to deploy!

---

## 🆘 QUICK TROUBLESHOOTING

### "Cannot connect to Supabase"
- Check URL format: `https://xxxxx.supabase.co`
- Verify keys are correct
- Restart dev server

### "Database schema failed"
- Check SQL syntax
- Try running smaller chunks
- Check Supabase status page

### "RLS policy violation"
- Verify user is logged in
- Check policies in Supabase dashboard
- Restart browser

---

**Time**: 5 minutes  
**Difficulty**: Easy  
**Status**: Ready to go!

🚀 **You're all set!**
