# Unused Code Detection & Removal Report

**Generated:** 2025-01-13  
**Project:** Brahmin Soulmate Connect  
**Detection Method:** Manual analysis (knip not installed)

---

## 1. Detection Method

### Tools Used
- **Manual grep/search analysis** - No automated unused code detection tool (knip) is installed
- **TypeScript compiler settings** - `noUnusedLocals` and `noUnusedParameters` are set to `false` in `tsconfig.app.json`

### Recommendations
1. Install [knip](https://github.com/webpro/knip) for automated unused code detection:
   ```bash
   npm install -D knip
   npx knip
   ```

2. Enable TypeScript unused code checks in `tsconfig.app.json`:
   ```json
   {
     "compilerOptions": {
       "noUnusedLocals": true,
       "noUnusedParameters": true
     }
   }
   ```

---

## 2. Unused Pages (Frontend)

The following page files exist in `src/pages/` but are **NOT imported anywhere** in the application (including App.tsx routes):

| File | Status | Risk Level |
|------|--------|------------|
| `src/pages/Call.tsx` | ❌ Not imported | Low - Can remove |
| `src/pages/Etiquette.tsx` | ❌ Not imported | Low - Can remove |
| `src/pages/ForumPost.tsx` | ⚠️ Has imports | Medium - Has component usage |
| `src/pages/Index.tsx` | ❌ Not imported | Low - Can remove |
| `src/pages/Interests.tsx` | ⚠️ Has imports | Medium - Has component usage |
| `src/pages/Logout.tsx` | ⚠️ Has imports | Medium - Has component usage |
| `src/pages/MyConnections.tsx` | ⚠️ Has imports | Medium - Has component usage |
| `src/pages/NotFound.tsx` | ❌ Not imported | Low - Can remove |
| `src/pages/Online.tsx` | ⚠️ Has imports | Medium - Has component usage |
| `src/pages/ProfileSetup.tsx` | ❌ Not imported | Low - Can remove (replaced by ProfileSetupWizard) |
| `src/pages/Schedule.tsx` | ❌ Not imported | Low - Can remove |
| `src/pages/VideoCall.tsx` | ❌ Not imported | Low - Can remove |
| `src/pages/Signup.tsx` | ⚠️ Has imports | Medium - Duplicate of Register.tsx |

### Notes
- `ForumPost.tsx`, `Interests.tsx`, `Logout.tsx`, `MyConnections.tsx`, `Online.tsx`, `Signup.tsx` have internal imports but are not routed in App.tsx
- `ProfileSetup.tsx` appears to be replaced by `src/features/profile/components/ProfileSetupWizard.tsx`
- `Signup.tsx` appears to be a duplicate of `Register.tsx` (App.tsx routes `/signup` to `Register` component)

---

## 3. Unused Components (Frontend)

The following components exist but are **NOT imported anywhere**:

| File | Status | Notes |
|------|--------|-------|
| `src/components/AIMatchingDemo.tsx` | ❌ Not imported | Demo component, not used |
| `src/components/DarkModeToggle.tsx` | ❌ Not imported | Theme toggle not integrated |
| `src/components/LandingFeatures.tsx` | ❌ Not imported | Landing page features not used |
| `src/components/LoadingScreen.tsx` | ❌ Not imported | Loading screen not used |
| `src/components/NotificationSystem.tsx` | ❌ Not imported | Notification system not integrated |
| `src/components/OnlineStatus.tsx` | ❌ Not imported | Online status widget not used |
| `src/components/OptimizedImage.tsx` | ❌ Not imported | Image optimization not used |
| `src/components/OTPVerification.tsx` | ⚠️ Has internal refs | OTP UI exists but not routed |
| `src/components/ViewMoreProfiles.tsx` | ❌ Not imported | View more section not used |

---

## 4. Unused Hooks (Frontend)

| File | Status | Notes |
|------|--------|-------|
| `src/hooks/useDebounceClick.ts` | ❌ Not imported | Debounce click hook not used |
| `src/hooks/useErrorHandler.ts` | ❌ Not imported | Error handler hook not used |
| `src/hooks/useProfileInteractions.ts` | ⚠️ Duplicate | Duplicate of `src/features/profile/hooks/useProfileInteractions.ts` |
| `src/hooks/useQueryWithAuth.ts` | ❌ Not imported | Auth query wrapper not used |

---

## 5. Unused Services (Frontend)

| File | Status | Notes |
|------|--------|-------|
| `src/services/analyticsService.ts` | ❌ Not imported | Analytics service not integrated |
| `src/services/notificationService.ts` | ❌ Not imported | Push notification service not integrated |

---

## 6. Unused Data Files (Frontend)

| File | Status | Notes |
|------|--------|-------|
| `src/data/forumCategories.ts` | ❌ Not imported | Default forum categories not used |

---

## 7. Unused UI Components (Frontend)

The following Radix UI wrapper components exist but are **NOT imported anywhere**:

| File | Dependency | Notes |
|------|------------|-------|
| `src/components/ui/aspect-ratio.tsx` | `@radix-ui/react-aspect-ratio` | Not used |
| `src/components/ui/hover-card.tsx` | `@radix-ui/react-hover-card` | Not used |
| `src/components/ui/toggle.tsx` | `@radix-ui/react-toggle` | Only used by toggle-group |
| `src/components/ui/toggle-group.tsx` | `@radix-ui/react-toggle-group` | Not used externally |

---

## 8. Unused Dependencies

### Backend (package.json)

| Package | Status | Notes |
|---------|--------|-------|
| `agora-token` | ❌ Not used | Video call token generation not implemented |
| `twilio` | ❌ Not used | SMS/Voice not implemented |
| `express-validator` | ❌ Not used | Using `joi` and `zod` instead |

### Frontend (package.json)

| Package | Status | Notes |
|---------|--------|-------|
| `@radix-ui/react-aspect-ratio` | ❌ Not used | Component not used |
| `@radix-ui/react-hover-card` | ❌ Not used | Component not used |
| `@radix-ui/react-toggle` | ⚠️ Indirect | Only used by toggle-group |
| `@radix-ui/react-toggle-group` | ❌ Not used | Component not used |

---

## 9. Implementation Summary

### Files Safe to Remove (Low Risk)

**Pages:**
- `src/pages/Call.tsx`
- `src/pages/Etiquette.tsx`
- `src/pages/Index.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/ProfileSetup.tsx`
- `src/pages/Schedule.tsx`
- `src/pages/VideoCall.tsx`

**Components:**
- `src/components/AIMatchingDemo.tsx`
- `src/components/DarkModeToggle.tsx`
- `src/components/LandingFeatures.tsx`
- `src/components/LoadingScreen.tsx`
- `src/components/NotificationSystem.tsx`
- `src/components/OnlineStatus.tsx`
- `src/components/OptimizedImage.tsx`
- `src/components/ViewMoreProfiles.tsx`

**Hooks:**
- `src/hooks/useDebounceClick.ts`
- `src/hooks/useErrorHandler.ts`
- `src/hooks/useQueryWithAuth.ts`

**Services:**
- `src/services/analyticsService.ts`
- `src/services/notificationService.ts`

**Data:**
- `src/data/forumCategories.ts`

**UI Components:**
- `src/components/ui/aspect-ratio.tsx`
- `src/components/ui/hover-card.tsx`
- `src/components/ui/toggle.tsx`
- `src/components/ui/toggle-group.tsx`

### Files to Review Before Removal (Medium Risk)

| File | Reason |
|------|--------|
| `src/pages/ForumPost.tsx` | Has component imports, may be dynamically routed |
| `src/pages/Interests.tsx` | Has component imports |
| `src/pages/Logout.tsx` | Has auth hook usage |
| `src/pages/MyConnections.tsx` | Has component imports |
| `src/pages/Online.tsx` | Has component imports |
| `src/pages/Signup.tsx` | Duplicate of Register, but has imports |
| `src/components/OTPVerification.tsx` | OTP functionality may be planned |
| `src/hooks/useProfileInteractions.ts` | Duplicate - remove after confirming features version is used |

---

## 10. Risk Notes

### Items That Look Unused But Should Be Kept

1. **`backend/src/config/redis.ts`** - Used by rate limiter and routes, even though `ioredis` shows no direct imports
2. **`backend/src/middleware/validation.ts`** - Uses `joi` for validation, keep both
3. **`src/components/ui/toggle.tsx`** - Required by `toggle-group.tsx` even though neither is externally used
4. **Test files** - All `__tests__` directories and `*.test.*` files should be kept
5. **Configuration files** - All config files in `src/config/` should be kept
6. **Type definition files** - All `*.d.ts` and type files should be kept

### Dynamic Imports to Consider

The application uses React.lazy for dynamic imports. The following patterns were verified:
- All lazy imports in `App.tsx` are routed
- No dynamic `import()` calls found outside of React.lazy

---

## 11. Recommended Actions

### Immediate Actions (Safe)

1. Remove unused page files (Call, Etiquette, Index, NotFound, ProfileSetup, Schedule, VideoCall)
2. Remove unused components (AIMatchingDemo, DarkModeToggle, LandingFeatures, LoadingScreen, NotificationSystem, OnlineStatus, OptimizedImage, ViewMoreProfiles)
3. Remove unused hooks (useDebounceClick, useErrorHandler, useQueryWithAuth)
4. Remove unused services (analyticsService, notificationService)
5. Remove duplicate `src/hooks/useProfileInteractions.ts` (keep features version)

### After Verification

1. Remove unused UI components (aspect-ratio, hover-card, toggle, toggle-group)
2. Remove unused npm dependencies:
   - Backend: `agora-token`, `twilio`, `express-validator`
   - Frontend: `@radix-ui/react-aspect-ratio`, `@radix-ui/react-hover-card`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`

### Before Removal (Review Required)

1. `src/pages/ForumPost.tsx` - Check if forum feature is planned
2. `src/pages/Interests.tsx` - Check if different from MyInterests
3. `src/pages/Logout.tsx` - Verify logout is handled elsewhere
4. `src/pages/MyConnections.tsx` - Check if connections feature is planned
5. `src/pages/Online.tsx` - Check if different from OnlineProfiles
6. `src/pages/Signup.tsx` - Confirm Register.tsx is the canonical signup
7. `src/components/OTPVerification.tsx` - Check if OTP is planned

---

## 12. Estimated Impact

| Category | Files to Remove | Lines of Code (Est.) |
|----------|-----------------|---------------------|
| Pages | 7-13 | ~2,000-3,500 |
| Components | 8-9 | ~1,500-2,000 |
| Hooks | 3-4 | ~200-300 |
| Services | 2 | ~800 |
| UI Components | 4 | ~200 |
| **Total** | **24-32 files** | **~4,700-6,800 lines** |

---

## 13. Verification Steps

After removing files, run:

```bash
# Type check
npm run typecheck

# Build
npm run build

# Run tests
npm test

# Backend type check
cd backend && npm run build
```

---

## 14. Pre-existing TypeScript Errors

**Note:** The codebase currently has 36 TypeScript errors in 12 files. These are pre-existing issues unrelated to unused code detection. Key issues include:

1. **Type mismatches in event handling** - `CreateEventModal.tsx`, `useEvents.ts`
2. **Missing service methods** - `ChatWindow.tsx` references methods not in `MessagesService`
3. **Type incompatibilities** - `useVDates.ts`, `useCompatibility.ts`, `useAdvancedSearch.ts`
4. **Implicit any types** - `useUserActivities.ts`, `ChatWindow.tsx`

These should be addressed separately from unused code removal.

---

## 15. Summary

| Category | Count | Action |
|----------|-------|--------|
| Unused Pages (Safe to Remove) | 7 | Remove immediately |
| Unused Pages (Review First) | 6 | Verify before removal |
| Unused Components | 9 | Remove immediately |
| Unused Hooks | 4 | Remove immediately |
| Unused Services | 2 | Remove immediately |
| Unused UI Components | 4 | Remove immediately |
| Unused Backend Dependencies | 3 | Remove from package.json |
| Unused Frontend Dependencies | 4 | Remove from package.json |
| **Total Files to Remove** | **24-32** | |
| **Estimated Lines Removed** | **~4,700-6,800** | |

---

*Report generated by Unused Code Detection Agent*
