# 🚀 Quick Development Setup

## Skip Authentication During Development

### Step 1: Create `.env.local` file in project root

```bash
VITE_DEV_BYPASS_AUTH=true
```

### Step 2: Restart your dev server

```bash
npm run dev
```

### Step 3: Done! 🎉

You can now access all pages without logging in.

---

## What This Does

- ✅ Skips login/authentication
- ✅ Uses a mock user automatically
- ✅ Access all protected routes
- ✅ Test features without signup

## Mock User Info

- **Email:** dev@test.com
- **Name:** Dev User
- **Type:** Premium User
- **Role:** User

## To Disable

Change `.env.local`:
```bash
VITE_DEV_BYPASS_AUTH=false
```

Or delete the `.env.local` file.

---

## ⚠️ Important

- Only works in development mode
- Automatically disabled in production
- Safe to use for testing

---

## Quick Commands

```bash
# Enable dev mode
echo "VITE_DEV_BYPASS_AUTH=true" > .env.local

# Disable dev mode  
echo "VITE_DEV_BYPASS_AUTH=false" > .env.local

# Restart server (required after env changes)
npm run dev
```

---

**That's it! Happy coding! 🎉**
