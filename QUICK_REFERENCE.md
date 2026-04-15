# 🚀 Quick Reference - Brahmin Soulmate Setup

## 🎯 Quick Fix (30 seconds)

**Problem:** App times out connecting to Supabase

**Solution:** App now runs in **mock mode** automatically!

```bash
npm run dev
```

Done! App runs on `http://localhost:8080` with mock data.

---

## 🏗️ Full Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait ~2 minutes for project to be ready
4. Go to **Project Settings** → **API**
5. Copy:
   - **Project URL** → `https://your-project.supabase.co`
   - **anon key** → `eyJhbGciOiJIUzI1NiIs...`
   - **service_role key** → `eyJhbGciOiJIUzI1NiIs...`

### Step 2: Configure Backend
Edit `backend/.env.local`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

### Step 3: Run Setup
```bash
# Windows
.\scripts\setup-backend.ps1

# Linux/Mac
chmod +x scripts/setup-backend.sh
./scripts/setup-backend.sh
```

### Step 4: Start App
```bash
# Backend (if not started by script)
cd backend
npm run dev

# Frontend
npm run dev
```

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend (mock mode) |
| `cd backend && npm run dev` | Start backend (mock mode) |
| `.\scripts\setup-backend.ps1` | Full backend setup (Windows) |
| `./scripts/setup-backend.sh` | Full backend setup (Linux/Mac) |
| `curl http://localhost:3001/health` | Test backend health |
| `npx ts-node scripts/migrate.ts up` | Run database migrations |

---

## 🧪 Testing

### Test Mock Mode
```bash
npm run dev
# Check browser console for "⚠️ Using MOCK Supabase client"
```

### Test Real Backend
```bash
# Backend should be running on port 3001
curl http://localhost:3001/health
# Should return: {"status":"OK"}
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/.env.local` | Backend Supabase credentials |
| `.env.local` | Frontend Supabase credentials |
| `scripts/setup-backend.ps1` | Windows setup script |
| `scripts/setup-backend.sh` | Linux/Mac setup script |
| `SETUP_GUIDE.md` | Complete setup guide |
| `QUICK_START.md` | Quick start guide |
| `backend/SETUP.md` | Backend-specific guide |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Supabase timeout | Check `.env.local` has correct credentials |
| Port 3001 in use | `netstat -ano \| findstr :3001` then `taskkill /PID <PID> /F` |
| Migration failed | Run `npx ts-node scripts/migrate.ts up` manually |
| Missing env vars | Edit `.env.local` and add required variables |

---

## 📚 Documentation

- **Main Guide:** `SETUP_GUIDE.md` - Complete setup instructions
- **Quick Start:** `QUICK_START.md` - Quick setup
- **Backend Guide:** `backend/SETUP.md` - Backend-specific
- **Fix Summary:** `BACKEND_FIX_SUMMARY.md` - What was fixed

---

## ✅ What Works Now

| Feature | Mock Mode | Real Backend |
|---------|-----------|--------------|
| Frontend UI | ✅ | ✅ |
| Navigation | ✅ | ✅ |
| Profile Cards | ✅ | ✅ |
| Search Interface | ✅ | ✅ |
| Landing Page | ✅ | ✅ |
| Real Database | ❌ | ✅ |
| Authentication | ❌ | ✅ |
| Messaging | ❌ | ✅ |
| Payments | ❌ | ✅ |
| Real-time | ❌ | ✅ |

---

## 🎯 Next Steps

1. **Development:** Use mock mode, build features
2. **Testing:** Configure test Supabase project
3. **Production:** Configure production Supabase project
4. **Deploy:** Follow `DEPLOYMENT_GUIDE.md`

---

## 💡 Pro Tips

1. **Keep `.env.local` secret** - Never commit to version control
2. **Use different projects** - Separate dev/test/prod Supabase projects
3. **Test health endpoint** - `curl http://localhost:3001/health`
4. **Check logs** - Backend logs show connection status
5. **Mock mode is fine** - Perfect for development and testing

---

## 🆘 Need Help?

1. Check `SETUP_GUIDE.md` for detailed instructions
2. Check `QUICK_START.md` for quick setup
3. Check `backend/SETUP.md` for backend-specific help
4. Check `BACKEND_FIX_SUMMARY.md` for what was fixed

---

**That's it! Your app should now be running!** 🎉

**Quick Command:** `npm run dev`

**Full Setup:** Follow steps above

**Questions?** Check the documentation files listed above
