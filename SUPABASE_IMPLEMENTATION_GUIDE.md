# 🔧 SUPABASE IMPLEMENTATION GUIDE
## Brahmin Soulmate Connect - Complete Setup

---

## 📊 CURRENT STATUS

### ✅ What's Already Done
- [x] Database schema defined (`database/schema.sql`)
- [x] Supabase client configured (`backend/src/config/supabase.ts`)
- [x] Migration script created (`backend/scripts/migrate.ts`)
- [x] Row-level security (RLS) policies defined
- [x] Storage buckets configured
- [x] TypeScript types defined

### ⏳ What Needs to Be Done
- [ ] Create Supabase project
- [ ] Get credentials (URL, keys)
- [ ] Run database schema
- [ ] Enable RLS policies
- [ ] Create storage buckets
- [ ] Configure authentication
- [ ] Test connections

---

## 🚀 STEP-BY-STEP SETUP

### Step 1: Create Supabase Project (5 minutes)

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: `brahmin-soulmate-connect`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users (e.g., `ap-south-1` for India)
5. Click "Create new project"
6. Wait for project to initialize (2-3 minutes)

### Step 2: Get Credentials (2 minutes)

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...` (public key)
   - **Service Role Key**: `eyJhbGc...` (secret key)

3. Create `.env.local` in project root:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

4. Create `.env` in `backend/` folder:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Step 3: Run Database Schema (10 minutes)

1. Go to Supabase dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy entire content from `database/schema.sql`
5. Paste into SQL editor
6. Click **Run**
7. Wait for completion (should see green checkmark)

**Expected Output:**
```
✅ All tables created
✅ Indexes created
✅ Triggers created
✅ RLS policies enabled
✅ Storage buckets created
```

### Step 4: Enable Authentication (5 minutes)

1. Go to **Authentication** → **Providers**
2. Enable these providers:
   - **Email** (default, already enabled)
   - **Google** (optional, for social login)
   - **Phone** (optional)

3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL**: `http://localhost:8080` (dev) or your production URL
5. Add **Redirect URLs**:
   - `http://localhost:8080/auth/callback`
   - `http://localhost:5173/auth/callback`
   - `https://your-domain.com/auth/callback`

### Step 5: Create Storage Buckets (3 minutes)

1. Go to **Storage** (left sidebar)
2. Create three buckets:
   - **profile-images** (public)
   - **event-images** (public)
   - **success-story-images** (public)

3. For each bucket:
   - Click bucket name
   - Go to **Policies**
   - Add policies from schema (already defined)

### Step 6: Test Connection (5 minutes)

```bash
# Test backend connection
cd backend
npm run verify-supabase

# Expected output:
# ✅ Connected to Supabase
# ✅ Database accessible
# ✅ Tables created
# ✅ RLS policies active
```

---

## 🔐 AUTHENTICATION SETUP

### Email Authentication (Already Configured)

Users can sign up with email/password. Supabase handles:
- Email verification
- Password reset
- Session management

### Google OAuth (Optional)

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add to Supabase:
   - **Settings** → **Authentication** → **Providers** → **Google**
   - Paste Client ID and Secret

### Phone Authentication (Optional)

1. Go to **Settings** → **Authentication** → **Providers** → **Phone**
2. Choose SMS provider (Twilio recommended)
3. Add credentials

---

## 📦 STORAGE SETUP

### Profile Images Bucket

```
Bucket: profile-images
Public: Yes
Max Size: 5MB per file
Allowed Types: jpg, jpeg, png, webp
```

**Policies:**
- Users can upload to their own folder
- Users can view all images
- Users can delete own images

### Event Images Bucket

```
Bucket: event-images
Public: Yes
Max Size: 10MB per file
Allowed Types: jpg, jpeg, png, webp
```

### Success Story Images Bucket

```
Bucket: success-story-images
Public: Yes
Max Size: 5MB per file
Allowed Types: jpg, jpeg, png, webp
```

---

## 🔒 ROW-LEVEL SECURITY (RLS)

### What's Configured

All tables have RLS enabled with policies:

**Profiles Table:**
- Users can view verified profiles
- Users can update own profile
- Users can insert own profile

**Messages Table:**
- Users can view own messages
- Users can send messages
- Users can update own messages

**Matches Table:**
- Users can view own matches
- Users can create matches
- Users can update own matches

**Notifications Table:**
- Users can view own notifications
- Users can update own notifications

### Verify RLS is Active

1. Go to **Authentication** → **Policies**
2. Check each table has policies enabled
3. Should see green checkmarks

---

## 🧪 TESTING CONNECTIONS

### Test Frontend Connection

```bash
# Start dev server
npm run dev

# Open browser console
# Should see: ✅ Supabase connected

# Try signing up
# Should create user in Supabase
```

### Test Backend Connection

```bash
# Test health endpoint
curl http://localhost:3001/health

# Expected response:
{
  "status": "OK",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful"
    }
  }
}
```

### Test Database Queries

```bash
# In Supabase SQL Editor, run:
SELECT COUNT(*) FROM profiles;

# Should return: 0 (empty table)
```

---

## 🚀 DEPLOYMENT CONFIGURATION

### Production Environment Variables

Set these in your deployment platform:

**Vercel (Frontend):**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Railway (Backend):**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Production Security

1. **Restrict RLS Policies**
   - Only allow authenticated users
   - Verify user ownership before updates

2. **Enable HTTPS**
   - Supabase enforces HTTPS
   - All connections encrypted

3. **Backup Strategy**
   - Supabase auto-backups daily
   - Enable point-in-time recovery

4. **Monitor Usage**
   - Go to **Settings** → **Usage**
   - Set up alerts for quota limits

---

## 📊 DATABASE SCHEMA OVERVIEW

### Core Tables

| Table | Purpose | Rows |
|-------|---------|------|
| `profiles` | User profiles | ~10K |
| `matches` | Interests/connections | ~50K |
| `messages` | Chat messages | ~100K |
| `notifications` | User notifications | ~50K |
| `subscriptions` | Payment subscriptions | ~5K |
| `events` | Community events | ~100 |
| `vdates` | Video dates | ~1K |
| `success_stories` | Success stories | ~100 |

### Supporting Tables

| Table | Purpose |
|-------|---------|
| `favorites` | Shortlisted profiles |
| `profile_views` | Profile view tracking |
| `blocked_users` | Blocked users |
| `user_activity` | Activity tracking |
| `push_subscriptions` | Push notifications |
| `notification_preferences` | User preferences |

---

## 🔧 COMMON OPERATIONS

### Add a New User

```sql
-- Supabase handles this via auth.users
-- Profile is auto-created via trigger
INSERT INTO profiles (user_id, name, age, gender, ...)
VALUES (auth.uid(), 'John', 28, 'male', ...);
```

### Query User's Matches

```sql
SELECT * FROM matches
WHERE user_id = auth.uid()
AND status = 'accepted';
```

### Get User's Messages

```sql
SELECT * FROM messages
WHERE sender_id = auth.uid()
OR receiver_id = auth.uid()
ORDER BY created_at DESC;
```

### Update Profile

```sql
UPDATE profiles
SET bio = 'New bio', updated_at = NOW()
WHERE user_id = auth.uid();
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot find module 'zodb'"
**Solution**: Already fixed - changed to `zod`

### Issue: "Supabase connection failed"
**Solution**: 
1. Check environment variables are set
2. Verify URL format: `https://xxxxx.supabase.co`
3. Check service role key is correct

### Issue: "RLS policy violation"
**Solution**:
1. Verify user is authenticated
2. Check RLS policies in Supabase dashboard
3. Ensure user_id matches auth.uid()

### Issue: "Storage bucket not found"
**Solution**:
1. Create buckets in Supabase dashboard
2. Verify bucket names match code
3. Check bucket is public

### Issue: "Email verification not working"
**Solution**:
1. Go to **Authentication** → **Email Templates**
2. Verify email template is configured
3. Check SMTP settings

---

## 📈 MONITORING & MAINTENANCE

### Monitor Database Performance

1. Go to **Settings** → **Database**
2. Check:
   - Connection count
   - Query performance
   - Storage usage

### Backup Strategy

1. Supabase auto-backups daily
2. Enable point-in-time recovery
3. Export data monthly

### Scale Database

1. Monitor storage usage
2. Archive old data if needed
3. Upgrade plan if approaching limits

---

## ✅ VERIFICATION CHECKLIST

- [ ] Supabase project created
- [ ] Credentials obtained
- [ ] Environment variables set
- [ ] Database schema imported
- [ ] RLS policies enabled
- [ ] Storage buckets created
- [ ] Authentication configured
- [ ] Frontend connection tested
- [ ] Backend connection tested
- [ ] Database queries working
- [ ] Email verification working
- [ ] Backups configured

---

## 🎯 NEXT STEPS

### Immediate (Today)
1. Create Supabase project
2. Get credentials
3. Set environment variables
4. Run database schema

### Short-term (This Week)
1. Enable authentication
2. Create storage buckets
3. Test connections
4. Deploy to staging

### Medium-term (This Month)
1. Configure production settings
2. Set up monitoring
3. Enable backups
4. Deploy to production

---

## 📞 SUPPORT

### Supabase Documentation
- https://supabase.com/docs
- https://supabase.com/docs/guides/database

### Common Issues
- https://supabase.com/docs/guides/troubleshooting

### Community
- Discord: https://discord.supabase.io
- GitHub: https://github.com/supabase/supabase

---

**Setup Time**: ~30 minutes  
**Difficulty**: Easy  
**Status**: Ready to implement

🚀 **Follow this guide to complete Supabase setup!**
