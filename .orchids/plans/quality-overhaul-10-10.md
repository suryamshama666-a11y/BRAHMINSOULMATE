# Brahmin Soulmate Connect - Quality Overhaul to 10/10

## Requirements
Transform the codebase from its current state (avg 4/10) to production-ready (10/10) across all quality dimensions: Architecture, Security, Code Quality, TypeScript, Performance, Maintainability, and Testing.

## Current State Analysis

### Critical Issues Identified
1. **Security (3/10)**: Dev auth bypass ships to production, service role key exposure risk, fallback dummy credentials
2. **TypeScript (3/10)**: `strictNullChecks: false`, `noImplicitAny: false` in root config conflicts with `tsconfig.app.json`
3. **Architecture (5/10)**: Two separate Supabase clients, duplicate auth implementations, scattered patterns
4. **Code Quality (4/10)**: 100+ lines of mock data in Dashboard.tsx, stub functions, hardcoded stats
5. **Maintainability (4/10)**: Dead files, backup files, unused dependencies, no clear data layer
6. **Performance (6/10)**: Good lazy loading but bloated dashboard
7. **Testing (5/10)**: 18 test files exist but unclear coverage, no CI enforcement

### Key Files Requiring Changes
- `tsconfig.json` - Enable strict mode
- `src/config/dev.ts` - Make dev bypass build-time only
- `src/contexts/AuthContext.tsx` - Implement social OAuth, remove stubs
- `src/integrations/supabase/client.ts` - Fail fast on missing credentials
- `src/lib/supabase.ts` - Consolidate with client.ts
- `src/pages/Dashboard.tsx` - Extract mock data, fetch real stats
- `eslint.config.js` - Enable unused vars rule
- `backend/src/server.ts` - Lower Sentry sample rate, fix CORS

---

## Implementation Phases

### Phase 1: Security Hardening (Critical)
- Remove runtime dev bypass - use build-time dead code elimination with `import.meta.env.DEV` constant
- Move `SUPABASE_SERVICE_ROLE_KEY` out of root `.env` to `backend/.env` only
- Make Supabase client fail fast with clear error instead of dummy credentials
- Remove `VITE_DEV_BYPASS_AUTH` from `.env.local` or make it work only in dev builds
- Fix Razorpay placeholder credentials to throw on missing env vars
- Lower Sentry `tracesSampleRate` from 1.0 to 0.1 in production

### Phase 2: TypeScript Strict Mode
- Update `tsconfig.json` to enable `strictNullChecks: true` and `noImplicitAny: true`
- Remove conflicting settings that override `tsconfig.app.json`
- Fix all resulting type errors across the codebase (estimated 50-100 errors)
- Remove index signature `[key: string]: any` from `UserProfile` type
- Add proper types for all `as any` casts in AuthContext

### Phase 3: Architecture Consolidation
- Consolidate `src/lib/supabase.ts` and `src/integrations/supabase/client.ts` into single client
- Remove `src/services/authService.ts` - use only AuthContext
- Create proper data layer with clear boundaries:
  - `/src/api/` - API calls only
  - `/src/services/` - Business logic only
  - `/src/hooks/` - React hooks for data fetching
- Fix duplicate `use-mobile.ts` and `use-mobile.tsx` hooks

### Phase 4: Implement Google/Facebook OAuth
- Implement `signInWithGoogle` using Supabase OAuth:
  ```typescript
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) throw error;
  };
  ```
- Implement `signInWithFacebook` similarly
- Configure Supabase dashboard with OAuth credentials
- Update auth callback page to handle OAuth redirects
- Add proper error handling and loading states

### Phase 5: Dashboard & Data Cleanup
- Extract mock data from Dashboard.tsx to `/src/data/fixtures/` for dev only
- Create API endpoints for real stats:
  - Profile views count
  - Interests sent/received count
  - Message count
  - V-Dates count
- Replace hardcoded stats with actual API calls using React Query
- Remove random values for `subscription_type` and `matchPercentage`
- Implement proper data fetching with loading/error states

### Phase 6: Code Quality & Cleanup
- Delete dead files:
  - `src/pages/Search.tsx.backup`
  - `src/pages/Dashboard-backup.tsx`
  - `vite.config.ts.timestamp-*.mjs` (4 files)
  - `HOW_TO_SKIP_LOGIN.txt`
- Remove unused dependencies from package.json:
  - `@clerk/clerk-react`
  - `next-themes`
- Remove `'use client'` directive from Landing.tsx (not Next.js)
- Remove webpackChunkName comments (Vite uses Rollup)
- Enable `@typescript-eslint/no-unused-vars: "warn"` in eslint
- Implement remaining stub functions or remove buttons that use them

### Phase 7: Testing & Quality Gates
- Add test coverage reporting with vitest
- Achieve minimum 70% coverage on:
  - Auth flows
  - Payment flows
  - Profile operations
  - Matching algorithm
- Add integration tests for:
  - Login/Signup flows
  - Profile creation
  - Payment verification
- Configure pre-commit hooks with husky:
  - Run lint
  - Run typecheck
  - Run tests
- Add GitHub Actions CI workflow

### Phase 8: Performance & Backend Polish
- Fix race condition in `recordActivity` with upsert or transaction
- Fix error handler placement in backend (before 404 handler)
- Configure CORS for multiple origins (dev + production)
- Add proper environment validation on server startup
- Remove GPT Engineer script from dev-only.ts
- Lazy load Community page (currently direct import)

---

## File Change Summary

### Files to Create
- `.github/workflows/ci.yml` - CI pipeline
- `src/data/fixtures/mockProfiles.ts` - Extracted mock data
- `src/api/stats.ts` - Stats API calls
- `backend/.env.example` - Backend env template

### Files to Modify
- `tsconfig.json` - Enable strict mode
- `src/config/dev.ts` - Build-time only bypass
- `src/contexts/AuthContext.tsx` - Implement OAuth, remove stubs
- `src/integrations/supabase/client.ts` - Fail fast
- `src/pages/Dashboard.tsx` - Real data, extract mocks
- `eslint.config.js` - Enable unused vars
- `backend/src/server.ts` - Fix CORS, Sentry, error handler
- `package.json` - Remove unused deps, add husky

### Files to Delete
- `src/pages/Search.tsx.backup`
- `src/pages/Dashboard-backup.tsx`
- `src/lib/supabase.ts` (consolidate)
- `src/services/authService.ts` (consolidate)
- `src/hooks/use-mobile.ts` (duplicate)
- `vite.config.ts.timestamp-*.mjs` (4 files)
- `HOW_TO_SKIP_LOGIN.txt`
- `src/dev-only.ts`

---

## Expected Outcome

| Category | Before | After |
|---|---|---|
| Architecture | 5/10 | 10/10 |
| Security | 3/10 | 10/10 |
| Code Quality | 4/10 | 10/10 |
| TypeScript | 3/10 | 10/10 |
| Performance | 6/10 | 10/10 |
| Maintainability | 4/10 | 10/10 |
| Testing | 5/10 | 10/10 |

---

## Dependencies & Prerequisites
1. Supabase Google OAuth provider configured in dashboard
2. Supabase Facebook OAuth provider configured in dashboard
3. Backend environment properly separated
4. Team agreement on data layer patterns

## Risks & Mitigations
- **Risk**: TypeScript strict mode may surface 100+ errors
  - **Mitigation**: Phase incrementally, fix critical paths first
- **Risk**: OAuth requires Supabase dashboard config
  - **Mitigation**: Document setup steps, provide fallback to email-only auth
- **Risk**: Removing dev bypass may slow local development
  - **Mitigation**: Create proper dev seeding scripts with test accounts

## Estimated Effort
- Phase 1 (Security): 2-3 hours
- Phase 2 (TypeScript): 4-6 hours
- Phase 3 (Architecture): 3-4 hours
- Phase 4 (OAuth): 2-3 hours
- Phase 5 (Dashboard): 3-4 hours
- Phase 6 (Cleanup): 2-3 hours
- Phase 7 (Testing): 4-6 hours
- Phase 8 (Backend): 2-3 hours

**Total: 22-32 hours**
