# Development Mode Guide

## Authentication Bypass for Development

To make development easier, you can bypass authentication and use a mock user.

### Enable Dev Mode

1. **Create or update `.env.local`:**
```env
VITE_DEV_BYPASS_AUTH=true
```

2. **Restart your dev server:**
```bash
npm run dev
```

3. **You're done!** 🎉 You can now access all protected routes without logging in.

### What Happens in Dev Mode

When `VITE_DEV_BYPASS_AUTH=true`:

✅ **Authentication is bypassed** - No need to login
✅ **Mock user is used** - Predefined test user
✅ **All routes accessible** - No redirects to login
✅ **Mock profile data** - Realistic test data
✅ **Premium features enabled** - Test premium features

### Mock User Details

The mock user has these properties:

```typescript
{
  id: 'dev-user-123',
  email: 'dev@test.com',
  full_name: 'Dev User',
  age: 28,
  gender: 'male',
  city: 'Mumbai',
  state: 'Maharashtra',
  education: 'B.Tech',
  occupation: 'Software Engineer',
  subscription_type: 'premium',
  role: 'user'
}
```

### Customize Mock User

Edit `src/config/dev.ts` to customize the mock user:

```typescript
export const DEV_CONFIG = {
  MOCK_USER: {
    id: 'your-custom-id',
    email: 'your@email.com',
    // ... customize as needed
  },
  
  MOCK_PROFILE: {
    user_id: 'your-custom-id',
    full_name: 'Your Name',
    subscription_type: 'premium', // or 'free'
    role: 'admin', // or 'user'
    // ... customize as needed
  }
};
```

### Test Different User Types

You can quickly test different scenarios:

**Test as Free User:**
```typescript
MOCK_PROFILE: {
  subscription_type: 'free',
  role: 'user'
}
```

**Test as Admin:**
```typescript
MOCK_PROFILE: {
  subscription_type: 'premium',
  role: 'admin'
}
```

**Test as Unverified User:**
```typescript
MOCK_PROFILE: {
  verification_status: 'unverified'
}
```

### Console Indicators

When dev mode is active, you'll see console messages:

```
🔓 DEV MODE: Authentication bypassed
🔓 DEV MODE: Using mock user
```

### Disable Dev Mode

To go back to normal authentication:

1. **Update `.env.local`:**
```env
VITE_DEV_BYPASS_AUTH=false
```

Or simply remove the line.

2. **Restart dev server**

### Important Notes

⚠️ **NEVER enable this in production!**
- Dev bypass only works when `import.meta.env.DEV` is true
- Production builds automatically disable this
- The flag is checked in multiple places for safety

⚠️ **API calls still need real data**
- Mock user only bypasses authentication
- API calls to Supabase still need real database setup
- Some features may not work without proper backend

⚠️ **Testing authentication flows**
- To test login/register, disable dev mode
- To test protected routes, enable dev mode

### Use Cases

**Perfect for:**
- ✅ UI development
- ✅ Component testing
- ✅ Layout work
- ✅ Quick feature testing
- ✅ Demo preparation

**Not suitable for:**
- ❌ Testing authentication flows
- ❌ Testing user registration
- ❌ Testing password reset
- ❌ Testing session management

### Troubleshooting

**Dev mode not working?**
1. Check `.env.local` has `VITE_DEV_BYPASS_AUTH=true`
2. Restart dev server (Vite needs restart for env changes)
3. Check browser console for "🔓 DEV MODE" messages
4. Clear browser cache/localStorage

**Still seeing login page?**
1. Make sure you're in development mode (`npm run dev`)
2. Check that `import.meta.env.DEV` is true
3. Verify the env variable is set correctly

**Mock user not showing?**
1. Check `src/config/dev.ts` is properly configured
2. Verify imports in `AuthContext.tsx` and `ProtectedRoute.tsx`
3. Check browser console for errors

### Security

This feature is safe because:
- ✅ Only works in development mode
- ✅ Automatically disabled in production builds
- ✅ Requires explicit environment variable
- ✅ Console warnings when active
- ✅ No security risk in production

### Example Workflow

```bash
# 1. Enable dev mode
echo "VITE_DEV_BYPASS_AUTH=true" >> .env.local

# 2. Start dev server
npm run dev

# 3. Open browser - you're automatically "logged in"
# Navigate to any protected route: /dashboard, /matches, etc.

# 4. Develop your features without login hassle

# 5. When testing auth, disable dev mode
echo "VITE_DEV_BYPASS_AUTH=false" > .env.local

# 6. Restart server
npm run dev
```

### Quick Toggle Script

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:bypass": "VITE_DEV_BYPASS_AUTH=true vite",
    "dev:auth": "VITE_DEV_BYPASS_AUTH=false vite"
  }
}
```

Then use:
```bash
npm run dev:bypass  # Dev mode with auth bypass
npm run dev:auth    # Dev mode with real auth
```

---

**Happy developing! 🚀**

Remember: This is a development convenience feature. Always test with real authentication before deploying!
