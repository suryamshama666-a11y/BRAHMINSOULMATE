# Supabase Migration Guide 🚀

## Your Supabase Project
**Project URL**: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor
**Project ID**: dotpqqfcamimrsdnvzor

## Step 1: Get Your Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/settings/api

2. Copy these values:
   - **Project URL**: `https://dotpqqfcamimrsdnvzor.supabase.co`
   - **Anon/Public Key**: Found under "Project API keys" → "anon public"
   - **Service Role Key**: Found under "Project API keys" → "service_role" (⚠️ Keep secret!)

## Step 2: Update Environment Files

### Frontend Environment (`.env.local`)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Development Mode
VITE_DEV_BYPASS_AUTH=false
```

### Backend Environment (`backend/.env.local`)
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Settings
PORT=3001
FRONTEND_URL=http://localhost:8080
NODE_ENV=development

# Razorpay Configuration (Payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# Vedic astrology API (Horoscope Matching)
VEDIC_ASTRO_API_KEY=your_vedic_api_key_here

# SendGrid Configuration (Email)
SENDGRID_API_KEY=SG.your_sendgrid_key_here
SENDGRID_FROM_EMAIL=noreply@brahminsoulmate.com

# Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Agora Configuration (Video Calls)
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_certificate_here

# Sentry Configuration (Monitoring - Optional)
SENTRY_DSN=https://your_sentry_dsn@o0.ingest.sentry.io/0
```

## Step 3: Run Database Migrations

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/editor

2. Click "New Query"

3. Copy and paste the migration SQL from `backend/src/migrations/20260413_fix_schema_consistency.sql`

4. Click "Run" to execute

### Option B: Using Migration Script

```bash
cd backend
npm run migrate
```

## Step 4: Enable Authentication Providers

1. Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/auth/providers

2. Enable these providers:
   - ✅ **Email** (already enabled by default)
   - ✅ **Google OAuth** (optional, for social login)
   - ✅ **Facebook OAuth** (optional, for social login)

### For Google OAuth:
1. Create OAuth credentials at: https://console.cloud.google.com/apis/credentials
2. Add authorized redirect URI: `https://dotpqqfcamimrsdnvzor.supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret to Supabase

### For Facebook OAuth:
1. Create app at: https://developers.facebook.com/apps
2. Add OAuth redirect URI: `https://dotpqqfcamimrsdnvzor.supabase.co/auth/v1/callback`
3. Copy App ID and App Secret to Supabase

## Step 5: Configure Storage for Photos

1. Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/storage/buckets

2. Create these buckets:
   - **avatars** (for profile photos)
   - **documents** (for ID verification, etc.)
   - **photos** (for profile photo galleries)

3. Set bucket policies:
   ```sql
   -- Allow authenticated users to upload their own photos
   CREATE POLICY "Users can upload their own photos"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow public read access to photos
   CREATE POLICY "Public can view photos"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

## Step 6: Set Up Row Level Security (RLS)

Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/auth/policies

Enable RLS on all tables and add policies:

```sql
-- Example: Users can only see their own profile data
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

## Step 7: Test the Connection

### Test Backend Connection
```bash
cd backend
npm run dev
```

Expected output:
```
✅ Connected to Supabase
🚀 Server running on port 3001
```

### Test Frontend Connection
```bash
npm run dev
```

Visit: http://localhost:8080

Try to:
1. Register a new account
2. Login
3. View your profile

## Step 8: Deploy to Production

### Frontend (Vercel/Netlify)

**Vercel**:
```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (your backend URL)

**Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Backend (Railway/Render/Heroku)

**Railway**:
```bash
cd backend
railway init
railway up
```

Add all environment variables from `backend/.env.local`

## Troubleshooting

### Issue: "Invalid API key"
**Solution**: Double-check you copied the correct anon key from Supabase dashboard

### Issue: "Failed to fetch"
**Solution**: 
1. Check CORS settings in Supabase
2. Verify your frontend URL is whitelisted
3. Check network tab for actual error

### Issue: "Row Level Security policy violation"
**Solution**: 
1. Ensure RLS policies are set up correctly
2. Check user is authenticated
3. Verify policy conditions match your use case

### Issue: "Migration failed"
**Solution**:
1. Check SQL syntax in migration file
2. Ensure no conflicting table names
3. Run migrations one at a time

## Verification Checklist

- [ ] Supabase project created
- [ ] Credentials copied to `.env.local` files
- [ ] Database migrations run successfully
- [ ] Authentication providers enabled
- [ ] Storage buckets created
- [ ] RLS policies configured
- [ ] Backend connects successfully
- [ ] Frontend connects successfully
- [ ] Can register new user
- [ ] Can login
- [ ] Can view profile
- [ ] Can upload photos
- [ ] Real-time features work

## Next Steps

1. **Set up email templates**: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/auth/templates
2. **Configure email settings**: Add SMTP or use Supabase's built-in email
3. **Set up backups**: Enable automatic backups in project settings
4. **Monitor usage**: Check database size and API calls
5. **Upgrade plan if needed**: Free tier has limits (500MB DB, 2GB bandwidth)

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Your Project Dashboard**: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor

## Security Reminders

⚠️ **NEVER commit these to Git**:
- Service Role Key
- Database password
- API secrets
- OAuth client secrets

✅ **Always use**:
- Environment variables
- `.gitignore` for `.env.local` files
- Separate keys for development/production

---

Your Supabase project is ready! Follow these steps and your matrimony app will be live! 🎉
