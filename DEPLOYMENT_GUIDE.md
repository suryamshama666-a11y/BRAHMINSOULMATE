# 🚀 Deployment Guide - Brahmin Soulmate Connect

## Overview

Your app has 3 components to deploy:
1. **Frontend** (React/Vite) → Vercel/Netlify
2. **Backend** (Node.js/Express) → Railway/Render
3. **Database** (PostgreSQL) → Supabase ✅ (Already set up!)

---

## 📋 Pre-Deployment Checklist

### ✅ Already Complete:
- [x] Supabase database configured
- [x] All tables created
- [x] Row Level Security enabled
- [x] Environment variables configured locally

### 🔲 Before Deploying:
- [ ] Test app locally (both frontend and backend running)
- [ ] Commit all changes to Git
- [ ] Create GitHub repository (if not already done)
- [ ] Get domain name (optional, can use free subdomain)

---

## 🎯 Recommended Deployment Stack

### Option 1: Free Tier (Recommended for Testing)
- **Frontend**: Vercel (Free)
- **Backend**: Railway (Free $5 credit/month)
- **Database**: Supabase (Free tier) ✅

### Option 2: Production Ready
- **Frontend**: Vercel Pro ($20/month)
- **Backend**: Railway ($5-20/month based on usage)
- **Database**: Supabase Pro ($25/month)

---

## 📦 Step 1: Prepare for Deployment

### 1.1 Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/brahmin-soulmate-connect.git
git branch -M main
git push -u origin main
```

### 1.2 Update .gitignore

Make sure these are in `.gitignore`:
```
.env
.env.local
.env.production
node_modules/
dist/
build/
.DS_Store
```

---

## 🎨 Step 2: Deploy Frontend (Vercel)

### 2.1 Sign Up for Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository

### 2.2 Configure Build Settings

**Framework Preset**: Vite
**Root Directory**: `./` (leave as root)
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### 2.3 Add Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables**:

```env
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwOTgsImV4cCI6MjA5MTc3NzA5OH0.HeuiUzU1Yau1dJe-BogCkK2zKAnjI3LqVkdg237oBPU
VITE_API_URL=https://your-backend-url.railway.app/api
```

**Note**: Update `VITE_API_URL` after deploying backend (Step 3)

### 2.4 Deploy

Click **Deploy** and wait for build to complete.

Your frontend will be live at: `https://your-project.vercel.app`

---

## 🖥️ Step 3: Deploy Backend (Railway)

### 3.1 Sign Up for Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

### 3.2 Configure Backend Service

1. Railway will auto-detect Node.js
2. Set **Root Directory**: `backend`
3. Railway will use `npm start` by default

### 3.3 Add Start Script

Make sure `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "nodemon src/server.ts"
  }
}
```

### 3.4 Add Environment Variables

In Railway dashboard, go to **Variables** tab:

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIwMTA5OCwiZXhwIjoyMDkxNzc3MDk4fQ.qu8jdzApXPziR0Z8Z89dXzPEJBEt6eGQVE7ajei4W9c
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwOTgsImV4cCI6MjA5MTc3NzA5OH0.HeuiUzU1Yau1dJe-BogCkK2zKAnjI3LqVkdg237oBPU
FRONTEND_URL=https://your-project.vercel.app

# Optional (add later)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
SENDGRID_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

### 3.5 Build and Deploy

Railway will automatically:
1. Install dependencies
2. Build TypeScript (`npm run build`)
3. Start server (`npm start`)

Your backend will be live at: `https://your-project.railway.app`

### 3.6 Update Frontend Environment

Go back to Vercel → Settings → Environment Variables:

Update `VITE_API_URL` to your Railway URL:
```env
VITE_API_URL=https://your-project.railway.app/api
```

Redeploy frontend for changes to take effect.

---

## 🔐 Step 4: Configure CORS

Update `backend/src/server.ts` CORS configuration:

```typescript
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://your-project.vercel.app',  // Add your Vercel URL
    'https://your-custom-domain.com'    // Add custom domain if you have one
  ],
  credentials: true
}));
```

Commit and push changes - Railway will auto-deploy.

---

## 🌐 Step 5: Configure Supabase for Production

### 5.1 Update Supabase Auth Settings

Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/auth/url-configuration

**Site URL**: `https://your-project.vercel.app`

**Redirect URLs** (add these):
```
https://your-project.vercel.app
https://your-project.vercel.app/auth/callback
https://your-project.vercel.app/**
```

### 5.2 Enable Email Confirmations (Optional)

Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/auth/templates

Configure email templates for:
- Confirmation emails
- Password reset
- Magic links

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Frontend

1. Visit your Vercel URL
2. Check browser console for errors
3. Verify Supabase connection

### 6.2 Test Backend

```bash
# Health check
curl https://your-project.railway.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 6.3 Test Full Flow

1. Register a new user
2. Check Supabase dashboard for new user
3. Login with the user
4. Test profile creation
5. Test messaging (if applicable)

---

## 🔧 Step 7: Custom Domain (Optional)

### 7.1 Frontend Domain (Vercel)

1. Go to Vercel → Settings → Domains
2. Add your domain (e.g., `brahminsoulmate.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### 7.2 Backend Domain (Railway)

1. Go to Railway → Settings → Domains
2. Add custom domain (e.g., `api.brahminsoulmate.com`)
3. Update DNS records
4. Update frontend `VITE_API_URL` to new domain

---

## 📊 Step 8: Monitoring & Analytics

### 8.1 Vercel Analytics

Enable in Vercel dashboard:
- Web Analytics (free)
- Speed Insights (free)

### 8.2 Railway Metrics

Monitor in Railway dashboard:
- CPU usage
- Memory usage
- Request logs
- Deployment history

### 8.3 Supabase Monitoring

Monitor in Supabase dashboard:
- Database size
- API requests
- Active connections
- Query performance

---

## 🚨 Troubleshooting

### Frontend Issues

**Build fails:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run type-check
```

**Environment variables not working:**
- Make sure they start with `VITE_`
- Redeploy after adding variables
- Check browser console for actual values

### Backend Issues

**Port binding error:**
```typescript
// Make sure server.ts uses Railway's PORT
const PORT = process.env.PORT || 3001;
```

**Database connection fails:**
- Verify Supabase credentials
- Check Railway logs
- Ensure service_role key is set

**CORS errors:**
- Add Vercel URL to CORS origins
- Redeploy backend after changes

---

## 💰 Cost Estimate

### Free Tier (Good for Testing):
- Vercel: Free
- Railway: $5 credit/month (free for ~1 month)
- Supabase: Free (500MB database, 50,000 monthly active users)
- **Total**: ~$0-5/month

### Production Tier:
- Vercel Pro: $20/month
- Railway: $5-20/month (based on usage)
- Supabase Pro: $25/month
- **Total**: ~$50-65/month

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs

---

## 🎉 Next Steps After Deployment

1. ✅ Set up custom domain
2. ✅ Configure email service (SendGrid)
3. ✅ Set up payment gateway (Razorpay)
4. ✅ Enable monitoring and alerts
5. ✅ Set up backup strategy
6. ✅ Configure CDN for images
7. ✅ Set up error tracking (Sentry)
8. ✅ Create deployment documentation

---

## 🆘 Need Help?

If you encounter issues:
1. Check Railway/Vercel logs
2. Check Supabase logs
3. Test locally first
4. Verify all environment variables
5. Check CORS configuration

**Your app is ready to deploy!** 🚀
