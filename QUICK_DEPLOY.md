# ⚡ Quick Deploy - 15 Minutes

Follow these steps to deploy your app in ~15 minutes.

---

## 🚀 Step 1: Push to GitHub (2 minutes)

```bash
# If you haven't already
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/brahmin-soulmate.git
git branch -M main
git push -u origin main
```

---

## 🎨 Step 2: Deploy Frontend on Vercel (5 minutes)

### Quick Steps:
1. Go to https://vercel.com → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwOTgsImV4cCI6MjA5MTc3NzA5OH0.HeuiUzU1Yau1dJe-BogCkK2zKAnjI3LqVkdg237oBPU
   VITE_API_URL=https://TEMP.railway.app/api
   ```
   (We'll update `VITE_API_URL` after deploying backend)
6. Click **Deploy**
7. **Copy your Vercel URL** (e.g., `https://brahmin-soulmate-xyz.vercel.app`)

---

## 🖥️ Step 3: Deploy Backend on Railway (5 minutes)

### Quick Steps:
1. Go to https://railway.app → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Configure:
   - Root Directory: `backend`
5. Add Environment Variables (click **Variables** tab):
   ```
   NODE_ENV=production
   PORT=3001
   SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIwMTA5OCwiZXhwIjoyMDkxNzc3MDk4fQ.qu8jdzApXPziR0Z8Z89dXzPEJBEt6eGQVE7ajei4W9c
   VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwOTgsImV4cCI6MjA5MTc3NzA5OH0.HeuiUzU1Yau1dJe-BogCkK2zKAnjI3LqVkdg237oBPU
   FRONTEND_URL=https://brahmin-soulmate-xyz.vercel.app
   ```
   (Replace `FRONTEND_URL` with your actual Vercel URL from Step 2)
6. Railway will auto-deploy
7. **Copy your Railway URL** (e.g., `https://brahmin-backend-xyz.railway.app`)

---

## 🔄 Step 4: Update Frontend with Backend URL (2 minutes)

1. Go back to Vercel → Your Project → **Settings** → **Environment Variables**
2. Find `VITE_API_URL` and click **Edit**
3. Update to your Railway URL:
   ```
   VITE_API_URL=https://brahmin-backend-xyz.railway.app/api
   ```
4. Go to **Deployments** tab → Click **⋯** on latest deployment → **Redeploy**

---

## 🔐 Step 5: Configure CORS (1 minute)

Update `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://brahmin-soulmate-xyz.vercel.app',  // Your Vercel URL
  ],
  credentials: true
}));
```

Commit and push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

Railway will auto-deploy the changes.

---

## ✅ Step 6: Configure Supabase (1 minute)

1. Go to: https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor/auth/url-configuration
2. Set **Site URL**: `https://brahmin-soulmate-xyz.vercel.app`
3. Add **Redirect URLs**:
   ```
   https://brahmin-soulmate-xyz.vercel.app
   https://brahmin-soulmate-xyz.vercel.app/auth/callback
   https://brahmin-soulmate-xyz.vercel.app/**
   ```
4. Click **Save**

---

## 🧪 Step 7: Test Your Deployment (2 minutes)

### Test Backend:
```bash
curl https://brahmin-backend-xyz.railway.app/health
```
Should return: `{"status":"ok",...}`

### Test Frontend:
1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for errors
4. Try registering a new user
5. Check Supabase dashboard for the new user

---

## 🎉 Done!

Your app is now live:
- **Frontend**: https://brahmin-soulmate-xyz.vercel.app
- **Backend**: https://brahmin-backend-xyz.railway.app
- **Database**: Supabase (already configured)

---

## 📊 Monitor Your App

### Vercel Dashboard:
- https://vercel.com/dashboard
- View deployments, analytics, logs

### Railway Dashboard:
- https://railway.app/dashboard
- View metrics, logs, usage

### Supabase Dashboard:
- https://supabase.com/dashboard/project/dotpqqfcamimrsdnvzor
- View users, tables, API usage

---

## 🆘 Troubleshooting

### Frontend not loading:
- Check Vercel deployment logs
- Verify environment variables are set
- Check browser console for errors

### Backend errors:
- Check Railway logs
- Verify all environment variables
- Test health endpoint

### CORS errors:
- Verify Vercel URL is in CORS origins
- Redeploy backend after CORS changes

### Database connection issues:
- Verify Supabase credentials
- Check Railway logs for connection errors
- Ensure service_role key is correct

---

## 💡 Pro Tips

1. **Auto-deploy**: Both Vercel and Railway auto-deploy when you push to GitHub
2. **Preview deployments**: Vercel creates preview URLs for pull requests
3. **Logs**: Check Railway logs for backend issues
4. **Analytics**: Enable Vercel Analytics for free insights
5. **Custom domain**: Add your own domain in Vercel/Railway settings

---

## 📚 Full Documentation

For detailed information, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

**Your app is live!** 🚀
