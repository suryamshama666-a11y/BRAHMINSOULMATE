# ✅ Deployment Checklist

## Pre-Deployment (Do This First)

- [ ] Test app locally (frontend + backend running)
- [ ] Verify Supabase connection works
- [ ] Create GitHub account (if needed)
- [ ] Push code to GitHub repository
- [ ] Review and update `.gitignore`
- [ ] Remove any console.logs or debug code
- [ ] Test user registration and login locally

---

## Frontend Deployment (Vercel)

### Setup
- [ ] Sign up for Vercel (https://vercel.com)
- [ ] Connect GitHub account
- [ ] Import your repository

### Configuration
- [ ] Set Framework Preset: **Vite**
- [ ] Set Build Command: `npm run build`
- [ ] Set Output Directory: `dist`
- [ ] Add environment variables:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_API_URL` (add after backend is deployed)

### Deploy
- [ ] Click Deploy button
- [ ] Wait for build to complete
- [ ] Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
- [ ] Test the deployed frontend

---

## Backend Deployment (Railway)

### Setup
- [ ] Sign up for Railway (https://railway.app)
- [ ] Connect GitHub account
- [ ] Create new project from GitHub repo
- [ ] Set Root Directory: `backend`

### Configuration
- [ ] Verify `package.json` has correct scripts:
  - [ ] `"start": "node dist/server.js"`
  - [ ] `"build": "tsc"`

### Environment Variables
Add these in Railway Variables tab:
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `FRONTEND_URL` (your Vercel URL)

### Deploy
- [ ] Railway auto-deploys on push
- [ ] Wait for build to complete
- [ ] Copy your Railway URL (e.g., `https://your-app.railway.app`)
- [ ] Test health endpoint: `https://your-app.railway.app/health`

---

## Update Frontend with Backend URL

- [ ] Go back to Vercel → Settings → Environment Variables
- [ ] Update `VITE_API_URL` to your Railway URL
- [ ] Redeploy frontend (Vercel → Deployments → Redeploy)

---

## Configure CORS

- [ ] Update `backend/src/server.ts` CORS origins
- [ ] Add your Vercel URL to allowed origins
- [ ] Commit and push changes
- [ ] Railway will auto-deploy

---

## Supabase Configuration

- [ ] Go to Supabase Auth Settings
- [ ] Set Site URL to your Vercel URL
- [ ] Add redirect URLs:
  - [ ] `https://your-app.vercel.app`
  - [ ] `https://your-app.vercel.app/auth/callback`
  - [ ] `https://your-app.vercel.app/**`

---

## Testing

### Frontend Tests
- [ ] Visit your Vercel URL
- [ ] Check browser console (no errors)
- [ ] Verify page loads correctly
- [ ] Check network tab (API calls working)

### Backend Tests
- [ ] Test health endpoint: `curl https://your-app.railway.app/health`
- [ ] Check Railway logs for errors
- [ ] Verify Supabase connection (no MOCK mode warnings)

### End-to-End Tests
- [ ] Register a new user
- [ ] Check Supabase dashboard for new user
- [ ] Login with the user
- [ ] Create/update profile
- [ ] Test core features (messaging, matching, etc.)

---

## Post-Deployment

### Monitoring
- [ ] Enable Vercel Analytics
- [ ] Monitor Railway metrics
- [ ] Check Supabase usage dashboard
- [ ] Set up error alerts

### Optional Enhancements
- [ ] Add custom domain
- [ ] Configure email service (SendGrid)
- [ ] Set up payment gateway (Razorpay)
- [ ] Enable Sentry for error tracking
- [ ] Set up automated backups
- [ ] Configure CDN for images

---

## 🎉 Deployment Complete!

Once all items are checked:
- ✅ Frontend is live on Vercel
- ✅ Backend is live on Railway
- ✅ Database is on Supabase
- ✅ All services are connected
- ✅ Users can register and login

**Your app is now live!** 🚀

---

## Quick Reference

### Your URLs:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.railway.app
- **Database**: https://dotpqqfcamimrsdnvzor.supabase.co

### Dashboards:
- **Vercel**: https://vercel.com/dashboard
- **Railway**: https://railway.app/dashboard
- **Supabase**: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor

### Support:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs
