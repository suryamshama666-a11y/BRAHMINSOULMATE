# 🚀 Deploy to Railway - Step by Step

## ✅ Prerequisites Complete
- ✅ Code pushed to GitHub: https://github.com/suryamshama666-a11y/BRAHMINSOULMATE
- ✅ Supabase database configured with all tables
- ✅ Backend environment variables ready

---

## 🎯 Deploy Backend to Railway (5 minutes)

### Step 1: Sign Up for Railway
1. Go to: https://railway.app/
2. Click **"Start a New Project"**
3. Sign in with GitHub (use account: **suryamshama666-a11y**)
4. Authorize Railway to access your repositories

### Step 2: Deploy from GitHub
1. Click **"Deploy from GitHub repo"**
2. Select repository: **BRAHMINSOULMATE**
3. Railway will detect it's a Node.js project
4. Click **"Deploy Now"**

### Step 3: Configure Environment Variables
In Railway dashboard, go to your project → **Variables** tab and add:

```bash
# Supabase Configuration
SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MjU2NzcsImV4cCI6MjA2MDMwMTY3N30.Ry_Ks-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY_FROM_backend/.env.local>

# Node Environment
NODE_ENV=production
PORT=3001

# JWT Secret (generate a random string)
JWT_SECRET=<GENERATE_RANDOM_STRING>

# Optional: Email Service (for later)
# SENDGRID_API_KEY=your_sendgrid_key
# TWILIO_ACCOUNT_SID=your_twilio_sid
# TWILIO_AUTH_TOKEN=your_twilio_token
```

**To generate JWT_SECRET**, run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Configure Build Settings
Railway should auto-detect, but verify:
- **Root Directory**: `/backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

If not auto-detected, add these in **Settings** → **Build**

### Step 5: Get Your Backend URL
1. After deployment completes (2-3 minutes)
2. Railway will provide a URL like: `https://brahminsoulmate-production.up.railway.app`
3. **Copy this URL** - you'll need it for frontend

### Step 6: Test Backend
Visit: `https://your-railway-url.railway.app/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-15T...",
  "uptime": 123.45,
  "environment": "production"
}
```

---

## 🌐 Deploy Frontend to Vercel (5 minutes)

### Step 1: Sign Up for Vercel
1. Go to: https://vercel.com/
2. Click **"Sign Up"**
3. Sign in with GitHub (use account: **suryamshama666-a11y**)

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import **BRAHMINSOULMATE** repository
3. Vercel will detect it's a Vite/React project

### Step 3: Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Add Environment Variables
In Vercel project settings → **Environment Variables**:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MjU2NzcsImV4cCI6MjA2MDMwMTY3N30.Ry_Ks-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw

# Backend API URL (from Railway Step 5)
VITE_API_URL=https://your-railway-url.railway.app

# Razorpay (for payments - add later)
# VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will provide a URL like: `https://brahminsoulmate.vercel.app`

### Step 6: Test Frontend
1. Visit your Vercel URL
2. You should see the landing page
3. Try signing up/logging in

---

## 💰 Cost Summary

### Current Setup (Starting Out)
- **Supabase**: FREE (500MB database, 50K users)
- **Railway**: $5/month (backend server)
- **Vercel**: FREE (100GB bandwidth, unlimited sites)
- **Total**: **$5/month**

### When You Grow (50K+ users)
- **Supabase Pro**: $25/month (8GB database, unlimited users)
- **Railway**: $20/month (more resources)
- **Vercel Pro**: $20/month (1TB bandwidth)
- **Total**: **$65/month** (but you'll have revenue by then!)

---

## 🔧 Post-Deployment Setup

### 1. Update CORS Settings
In `backend/src/server.ts`, update CORS to allow your Vercel domain:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://brahminsoulmate.vercel.app', // Add your Vercel URL
  ],
  credentials: true
}));
```

Commit and push:
```bash
git add backend/src/server.ts
git commit -m "Update CORS for production"
git push origin master
```

Railway will auto-deploy the update.

### 2. Set Up Custom Domain (Optional)
**Railway (Backend)**:
- Settings → Domains → Add custom domain
- Add CNAME record: `api.yourdomain.com` → Railway URL

**Vercel (Frontend)**:
- Settings → Domains → Add domain
- Follow DNS instructions

### 3. Enable Payments (Later)
1. Sign up for Razorpay: https://razorpay.com/
2. Get API keys from dashboard
3. Add to Railway and Vercel environment variables
4. Redeploy both

---

## 🎉 You're Live!

Your app is now running at:
- **Frontend**: https://brahminsoulmate.vercel.app
- **Backend**: https://your-railway-url.railway.app
- **Database**: Supabase (already configured)

### Next Steps:
1. ✅ Test all features (signup, login, profiles, messaging)
2. ✅ Set up custom domain
3. ✅ Configure payment gateway (Razorpay)
4. ✅ Add email service (SendGrid)
5. ✅ Set up monitoring (Railway has built-in metrics)

---

## 🆘 Troubleshooting

### Backend won't start
- Check Railway logs: Dashboard → Deployments → View Logs
- Verify all environment variables are set
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is correct

### Frontend can't connect to backend
- Check `VITE_API_URL` in Vercel environment variables
- Verify CORS settings in backend
- Check Railway backend is running (visit `/health` endpoint)

### Database errors
- Verify Supabase credentials in Railway
- Check Supabase dashboard for connection limits
- Review RLS policies if getting permission errors

---

## 📞 Support

If you get stuck:
1. Check Railway logs for backend errors
2. Check Vercel logs for frontend build errors
3. Check browser console for API errors
4. Verify all environment variables match

**Railway Dashboard**: https://railway.app/dashboard
**Vercel Dashboard**: https://vercel.com/dashboard
**Supabase Dashboard**: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor
