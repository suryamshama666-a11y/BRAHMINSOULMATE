# ✅ Railway Deployment - Fixed Configuration

## What Was Fixed
The initial Railway deployment failed because it tried to deploy the frontend (Vite) instead of the backend (Node.js Express). I've added configuration files to tell Railway to deploy the backend correctly.

## Files Added
- `nixpacks.toml` - Tells Railway to use Node.js 22 and deploy from `/backend` folder
- `railway.toml` - Specifies build and start commands for the backend

## Next Steps

### 1. Railway Will Auto-Deploy
Since you connected Railway to your GitHub repository, it should automatically detect the new commit and redeploy. Check your Railway dashboard:
- https://railway.app/dashboard
- Look for your project
- Check the deployment logs

### 2. If Auto-Deploy Didn't Trigger
Manually trigger a new deployment:
1. Go to Railway dashboard
2. Click on your project
3. Click "Deploy" → "Redeploy"

### 3. Add Environment Variables
Once the deployment starts, add these environment variables in Railway:

**Go to**: Project → Variables tab

```bash
# Supabase Configuration
SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MjU2NzcsImV4cCI6MjA2MDMwMTY3N30.Ry_Ks-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw
SUPABASE_SERVICE_ROLE_KEY=<GET_FROM_backend/.env.local>

# Node Environment
NODE_ENV=production
PORT=3001

# JWT Secret (generate random string)
JWT_SECRET=<GENERATE_RANDOM_64_CHAR_STRING>
```

**To get SUPABASE_SERVICE_ROLE_KEY**:
```bash
# On your local machine, run:
cat backend/.env.local | grep SUPABASE_SERVICE_ROLE_KEY
```

**To generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Verify Deployment
After deployment completes (2-3 minutes):

1. Railway will give you a URL like: `https://brahminsoulmate-production.up.railway.app`
2. Test the health endpoint: `https://your-url.railway.app/health`
3. You should see:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-15T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 5. Deploy Frontend to Vercel
Once backend is running, deploy the frontend:

1. Go to https://vercel.com/
2. Sign in with GitHub (account: suryamshama666-a11y)
3. Click "Add New..." → "Project"
4. Import **BRAHMINSOULMATE** repository
5. Configure:
   - **Framework**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
```bash
VITE_SUPABASE_URL=https://dotpqqfcamimrsdnvzor.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdHBxcWZjYW1pbXJzZG52em9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MjU2NzcsImV4cCI6MjA2MDMwMTY3N30.Ry_Ks-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw-Yz0Uw
VITE_API_URL=<YOUR_RAILWAY_BACKEND_URL>
```

7. Click "Deploy"

## Expected Build Output
Railway should now show:
```
✓ Detected Node.js backend
✓ Installing dependencies from backend/package.json
✓ Building TypeScript
✓ Starting server on port 3001
✓ Deployment successful
```

## Troubleshooting

### If deployment still fails:
1. Check Railway logs for specific errors
2. Verify `backend/package.json` has correct scripts:
   - `"build": "tsc"`
   - `"start": "node dist/server.js"`
3. Make sure all environment variables are set

### If backend starts but crashes:
- Check for missing environment variables
- Verify Supabase credentials are correct
- Check Railway logs for error messages

## Cost Reminder
- **Railway**: $5/month (backend server)
- **Vercel**: FREE (frontend hosting)
- **Supabase**: FREE (database, up to 50K users)
- **Total**: $5/month

## What's Next
After both are deployed:
1. Test signup/login flow
2. Test profile creation
3. Test messaging
4. Set up custom domain (optional)
5. Configure payment gateway (Razorpay - later)
6. Set up email service (SendGrid - later)

Your app will be live at:
- **Frontend**: https://brahminsoulmate.vercel.app
- **Backend**: https://your-railway-url.railway.app
- **Database**: Supabase (already configured)
