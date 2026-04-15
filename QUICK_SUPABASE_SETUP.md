# Quick Supabase Setup (5 Minutes) ⚡

## Step 1: Run the Migration (2 minutes)

1. **Open Supabase SQL Editor**:
   👉 https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/sql/new

2. **Copy the SQL**:
   - Open file: `SUPABASE_MIGRATION_READY.sql`
   - Select ALL (Ctrl+A)
   - Copy (Ctrl+C)

3. **Paste and Run**:
   - Paste into SQL Editor (Ctrl+V)
   - Click **"RUN"** button (bottom right)
   - Wait for "Success. No rows returned" message

✅ **Done!** Your database is now set up!

## Step 2: Get Your Credentials (1 minute)

1. **Go to API Settings**:
   👉 https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/settings/api

2. **Copy these 3 values**:
   - ✅ **Project URL**: `https://dotpqqfcamimrsdnvzor.supabase.co`
   - ✅ **anon public key**: (long string starting with `eyJ...`)
   - ✅ **service_role key**: (long string starting with `eyJ...`)

## Step 3: Update Environment Files (2 minutes)

### Frontend (`.env.local`)
```env
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
VITE_API_URL=http://localhost:3001/api
VITE_DEV_BYPASS_AUTH=false
```

### Backend (`backend/.env.local`)
```env
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
PORT=3001
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

## Step 4: Start Your App! 🚀

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

Visit: **http://localhost:8080**

## Verify It Works ✅

1. Click **"Register"**
2. Create a test account
3. Check if you can login
4. View your profile

If you see your profile, **YOU'RE DONE!** 🎉

## Troubleshooting

### "Invalid API key"
- Double-check you copied the **anon key** correctly
- Make sure there are no extra spaces

### "Failed to fetch"
- Check both `.env.local` files are updated
- Restart both frontend and backend servers

### "Table does not exist"
- Go back to Step 1 and run the migration SQL again
- Check for any error messages in SQL Editor

## What's Next?

Your app is now connected to Supabase! You can:

1. ✅ Register users
2. ✅ Login/Logout
3. ✅ Create profiles
4. ✅ Send messages
5. ✅ Upload photos (after setting up storage)

### Optional: Set Up Storage for Photos

1. Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/storage/buckets
2. Click "New bucket"
3. Name it: `avatars`
4. Make it **Public**
5. Click "Create bucket"

Repeat for:
- `photos` (profile galleries)
- `documents` (ID verification)

### Optional: Enable Social Login

**Google OAuth**:
1. Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/auth/providers
2. Enable "Google"
3. Add your Google OAuth credentials

**Facebook OAuth**:
1. Same page, enable "Facebook"
2. Add your Facebook App credentials

---

**Need help?** Check `SUPABASE_MIGRATION_GUIDE.md` for detailed instructions.

**Ready to deploy?** Your app is production-ready! Just deploy to Vercel/Netlify (frontend) and the backend is already handled by Supabase!
