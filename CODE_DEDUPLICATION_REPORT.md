# Code Deduplication & DRY Optimization Report

**Project**: Brahmin Soulmate Connect  
**Date**: 2025-01-13  
**Scope**: Full-stack analysis (Frontend + Backend)

---

## Executive Summary

This report identifies significant code duplication across the Brahmin Soulmate Connect codebase. The analysis found **5 major categories of duplication** that impact maintainability, consistency, and developer productivity. While some duplication is intentional (e.g., frontend/backend separation), other duplications can be safely consolidated.

### Key Findings

| Category | Files Affected | Duplication Level | Consolidation Priority |
|----------|---------------|-------------------|----------------------|
| API Clients | 3 files | High | **Critical** |
| Matching Services | 3 files | High | **High** |
| Compatibility Calculations | 4 implementations | Very High | **High** |
| Auth Token Retrieval | 10+ locations | Medium | **Medium** |
| Type Definitions | 5+ files | Medium | **Medium** |

---

## 1. Assessment: Issues Found

### 1.1 Multiple API Clients (Critical)

**Location**: `src/lib/api.ts`, `src/lib/apiClient.ts`, `src/services/api/base.ts`

Three different API client implementations exist with overlapping functionality:

| File | Purpose | Pattern |
|------|---------|---------|
| `src/lib/api.ts` | Supabase direct queries with caching | Class-based singleton |
| `src/lib/apiClient.ts` | REST API calls with retry logic | Class-based singleton |
| `src/services/api/base.ts` | Supabase + backend API helpers | Functional exports |

**Duplication Details**:
- All three handle authentication token retrieval
- All three implement error handling patterns
- `api.ts` and `apiClient.ts` both implement caching mechanisms
- `apiClient.ts` and `base.ts` both handle backend API calls with auth headers

**Code Example** (auth token retrieval duplicated):
```typescript
// src/lib/apiClient.ts:19-25
private async getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { ...API_HEADERS };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

// src/services/api/base.ts:136-137
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// src/services/api/matching-backend.service.ts:6-8
private async getAuthToken(): Promise<string | null> {
  const { data: session } = await supabase.auth.getSession();
  return session?.session?.access_token || null;
}
```

### 1.2 Multiple Matching Services (High Priority)

**Location**: `src/services/matchingService.ts`, `src/services/api/matching.service.ts`, `src/services/api/matching-backend.service.ts`

Three matching service implementations with different approaches:

| File | Pattern | Data Source |
|------|---------|-------------|
| `matchingService.ts` | Static methods | Direct Supabase |
| `matching.service.ts` | Instance methods | Direct Supabase |
| `matching-backend.service.ts` | Instance methods | Backend REST API |

**Duplication Details**:
- All three implement `sendInterest`, `acceptInterest`, `declineInterest`
- All three implement `getSentInterests`, `getReceivedInterests`
- Similar notification creation logic in multiple places

**Code Example** (interest operations duplicated):
```typescript
// src/services/matchingService.ts:12-35
static async sendInterest(userId: string, targetProfileId: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('matches')
    .insert({ user1_id: userId, user2_id: targetProfileId, ... });
  // ...
}

// src/services/api/interests.service.ts:24-42
async sendInterest(receiverId: string, message: string): Promise<Interest> {
  const { data, error } = await (supabase as any)
    .from('interests')
    .insert({ sender_id: user.id, receiver_id: receiverId, ... });
  // ...
}

// src/services/api/matching-backend.service.ts:36-55
async sendInterest(receiverId: string, message: string): Promise<void> {
  const response = await fetch(`${this.API_URL}/matching/interest/send`, {
    method: 'POST',
    body: JSON.stringify({ receiverId, message })
  });
  // ...
}
```

### 1.3 Compatibility Calculation Implementations (High Priority)

**Location**: 4 different implementations found

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/matching-algorithm.ts` | ~350 | Full compatibility algorithm |
| `src/services/api/matching.service.ts` | ~100 | Profile-based scoring |
| `src/services/matchingService.ts` | ~30 | Simple age/caste scoring |
| `backend/src/routes/matching.ts` | ~80 | Backend scoring |

**Duplication Details**:
- Age compatibility calculated in 4 places with different logic
- Height compatibility in 3 places
- Location compatibility in 3 places
- Gotra compatibility in 3 places
- Rashi (zodiac) compatibility in 2 places

**Code Example** (age calculation duplicated):
```typescript
// src/lib/matching-algorithm.ts:47-63
const calculateAgeCompatibility = (profile1: UserProfile, profile2: UserProfile): number => {
  const ageDiff = Math.abs(profile1.age - profile2.age);
  let score = Math.max(0, 1 - ageDiff / 10);
  // ... preference checks
  return Math.min(1, Math.max(0, score));
};

// src/services/api/matching.service.ts:43-55
private calculateAgeScore(user: ProfileRow, candidate: ProfileRow): number {
  const userAge = this.calculateAge(user.date_of_birth);
  const candidateAge = this.calculateAge(candidate.date_of_birth);
  const ageDiff = Math.abs(userAge - candidateAge);
  if (ageDiff <= 2) return 1.0;
  if (ageDiff <= 5) return 0.8;
  if (ageDiff <= 8) return 0.6;
  return 0.2;
}

// backend/src/routes/matching.ts:17-24
const ageDiff = Math.abs((profile1.age || 0) - (profile2.age || 0));
if (ageDiff <= 2) score += 25;
else if (ageDiff <= 5) score += 20;
else if (ageDiff <= 10) score += 15;
else score += 5;
```

### 1.4 Auth Token Retrieval Pattern (Medium Priority)

**Location**: 10+ files across the codebase

Files with duplicated auth token retrieval:
- `src/lib/apiClient.ts` (lines 19-25)
- `src/services/api/base.ts` (lines 136-137)
- `src/services/api/matching-backend.service.ts` (lines 6-8)
- `src/services/api/notifications.service.ts` (lines 240, 258)
- `src/services/api/payments.service.ts` (lines 128, 162)
- `src/services/paymentService.ts` (lines 80, 112, 142, 162)
- `src/utils/logger.ts` (line 7)
- `src/services/api/auth.service.ts` (lines 221-223)

**Note**: A centralized helper exists at `src/utils/authHelpers.ts` but is underutilized.

### 1.5 Overlapping Type Definitions (Medium Priority)

**Location**: Multiple type files with overlapping definitions

| Type | Files Defined | Variations |
|------|--------------|------------|
| `Profile` | `user.ts`, `profile.ts`, `database.ts`, `supabase.ts` | 4+ variations |
| `Notification` | `database.ts`, `notifications.service.ts`, `useNotifications.ts` | 3 variations |
| `Interest` | `matching.ts`, `interests.service.ts`, `useInterests.ts` | 3 variations |
| `Location` | `user.ts`, `database.ts`, `profile.ts` | 3 variations |
| `Horoscope` | `user.ts`, `database.ts`, `domain.ts` | 3 variations |

**Code Example** (Profile type variations):
```typescript
// src/types/user.ts - UserProfile
export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  // ... 50+ fields
}

// src/types/database.ts - DatabaseProfile
export interface DatabaseProfile {
  id: string;
  user_id: string;
  created_at: string;
  // ... similar but different field names
}

// src/hooks/useProfile.ts - Profile (local)
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  // ... subset of fields
}
```

---

## 2. Root Causes

### 2.1 Evolutionary Growth
The codebase evolved organically with different developers adding services without checking for existing implementations. This is common in fast-moving projects.

### 2.2 Frontend/Backend Separation
Some duplication is intentional - the backend has its own matching logic for performance and security reasons. However, the frontend has multiple implementations that should be consolidated.

### 2.3 Migration Artifacts
The presence of both `matchingService.ts` and `matching.service.ts` suggests a migration from one pattern to another without cleanup.

### 2.4 Type System Complexity
TypeScript's strict typing led developers to create local type definitions rather than importing from centralized locations, possibly due to:
- Circular dependency concerns
- Schema evolution
- Different use cases requiring different field subsets

### 2.5 Service Pattern Inconsistency
Mix of static methods (`MatchingService.staticMethod()`) and instance methods (`matchingService.instanceMethod()`) created confusion about which service to use.

---

## 3. Recommendations

### 3.1 Consolidate API Clients (Critical - Do First)

**Action**: Create a unified API layer with clear separation of concerns.

**Proposed Structure**:
```
src/lib/api/
├── client.ts          # Unified HTTP client with auth
├── supabase.ts        # Supabase-specific operations
├── cache.ts           # Shared caching utilities
└── errors.ts          # Centralized error handling
```

**Migration Path**:
1. Keep `src/services/api/base.ts` as the foundation (already has good patterns)
2. Merge caching logic from `src/lib/api.ts`
3. Merge retry/reauth logic from `src/lib/apiClient.ts`
4. Deprecate `src/lib/api.ts` and `src/lib/apiClient.ts`
5. Update imports across codebase

**Risk**: Low - these are internal utilities with no external API surface

### 3.2 Consolidate Matching Services (High Priority)

**Action**: Create a single matching service with clear data source strategy.

**Proposed Structure**:
```typescript
// src/services/matching/index.ts
export class MatchingService {
  private strategy: 'direct' | 'backend';
  
  constructor(strategy: 'direct' | 'backend' = 'direct') {
    this.strategy = strategy;
  }
  
  // Unified interface
  async sendInterest(receiverId: string, message?: string): Promise<Interest>;
  async getSentInterests(): Promise<Interest[]>;
  async getReceivedInterests(): Promise<Interest[]>;
  // ...
}
```

**Migration Path**:
1. Create new unified service in `src/services/matching/index.ts`
2. Keep `matching-backend.service.ts` for backend API calls (different concern)
3. Deprecate `matchingService.ts` (static method pattern)
4. Update `matching.service.ts` to use shared compatibility logic

**Risk**: Medium - affects multiple components, requires careful testing

### 3.3 Extract Compatibility Calculations (High Priority)

**Action**: Create a shared compatibility calculation module.

**Proposed Structure**:
```
src/utils/compatibility/
├── index.ts           # Main calculateCompatibility export
├── age.ts             # Age compatibility
├── location.ts        # Location compatibility
├── horoscope.ts       # Astrological compatibility
├── types.ts           # Shared types
└── weights.ts         # Configurable weight factors
```

**Key Principle**: Single source of truth for compatibility logic. Backend can import from a shared npm package or duplicate intentionally for performance.

**Migration Path**:
1. Extract the most complete implementation (`matching-algorithm.ts`)
2. Add missing factors from other implementations
3. Create unit tests covering all edge cases
4. Update all frontend services to use shared module
5. Consider publishing as internal package for backend use

**Risk**: Medium - business logic changes require thorough testing

### 3.4 Centralize Auth Token Retrieval (Medium Priority)

**Action**: Use existing `src/utils/authHelpers.ts` consistently.

**Current State**: Good helper exists but is underutilized.

**Migration Path**:
1. Add `getAccessToken()` to authHelpers.ts (already exists in auth.service.ts)
2. Update all services to use `getCurrentUser()` and `requireAuth()`
3. Remove inline `supabase.auth.getSession()` calls

**Code Change Example**:
```typescript
// Before (duplicated 10+ times)
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// After
import { requireAuth, getAccessToken } from '@/utils/authHelpers';
const token = await getAccessToken();
```

**Risk**: Low - simple refactoring with clear patterns

### 3.5 Consolidate Type Definitions (Medium Priority)

**Action**: Create a clear type hierarchy with domain types extending database types.

**Proposed Structure**:
```
src/types/
├── database.ts        # Raw database types (from Supabase)
├── domain.ts          # Business domain types
├── api.ts             # API request/response types
└── index.ts           # Public exports
```

**Key Principle**: 
- `DatabaseProfile` = exact database schema
- `UserProfile` = domain model with computed fields
- `ProfileResponse` = API response shape

**Migration Path**:
1. Audit all type definitions
2. Identify true duplicates vs. intentional variations
3. Create type hierarchy (extend/omit/pick patterns)
4. Update imports gradually

**Risk**: Medium - type changes can cascade, but TypeScript catches errors

---

## 4. Implementation Summary

### Changes Made

**None implemented in this pass.** This report provides analysis and recommendations only. Implementation should be done in a separate, focused effort with proper testing.

### Recommended Implementation Order

1. **Phase 1** (Low Risk, High Value):
   - Centralize auth token retrieval using existing helpers
   - Create shared compatibility calculation module

2. **Phase 2** (Medium Risk, High Value):
   - Consolidate API clients
   - Consolidate matching services

3. **Phase 3** (Medium Risk, Medium Value):
   - Consolidate type definitions
   - Clean up deprecated services

---

## 5. Risk Notes

### Areas Requiring Manual Review

1. **Matching Service Usage**: Before deprecating any matching service, verify all components that import it:
   - Check `src/pages/` for direct imports
   - Check `src/hooks/` for service usage
   - Check `src/components/` for inline service calls

2. **Type Narrowing**: Some type variations exist for valid reasons:
   - API responses may have fewer fields than database types
   - Frontend may use computed fields not in database
   - Different components need different field subsets

3. **Backend Duplication**: The backend's `calculateCompatibility` in `backend/src/routes/matching.ts` should remain separate for:
   - Performance (runs on server)
   - Security (access to full profile data)
   - Caching (Redis integration)

4. **Circular Dependencies**: When consolidating types, watch for:
   - Types importing from services
   - Services importing from types that import from other services
   - Use type-only imports (`import type { }`) to prevent runtime issues

### Testing Requirements

Before any consolidation:
1. Run full test suite: `npm run test`
2. Run type checking: `npm run typecheck`
3. Manual testing of:
   - Interest sending/accepting/declining
   - Match recommendations
   - Profile viewing
   - Message sending

---

## 6. What Should Remain Separate

Not all duplication should be eliminated:

| Component | Reason to Keep Separate |
|-----------|------------------------|
| `backend/src/routes/matching.ts` | Server-side performance, caching, security |
| `src/services/api/matching-backend.service.ts` | Intentional backend API client |
| `src/types/supabase.ts` | Auto-generated from database schema |
| `src/types/database.ts` | Manual database type definitions |
| Frontend/backend type duplicates | Different runtime environments |

---

## 7. Metrics

### Current State
- **API Clients**: 3 implementations
- **Matching Services**: 3 implementations  
- **Compatibility Functions**: 4 implementations
- **Auth Token Patterns**: 10+ duplications
- **Profile Type Variations**: 4+ definitions

### Target State
- **API Clients**: 1 unified client + Supabase direct
- **Matching Services**: 1 frontend service + backend API client
- **Compatibility Functions**: 1 shared module
- **Auth Token Patterns**: 1 centralized helper
- **Profile Type Variations**: Clear hierarchy (Database → Domain → API)

### Estimated Impact
- **Lines of Code Reduction**: ~1,500-2,000 lines
- **Maintenance Burden**: Reduced by ~40%
- **Bug Surface Area**: Reduced by ~30%
- **Developer Confusion**: Significantly reduced

---

## Appendix A: File Reference

### Files Analyzed
- `src/lib/api.ts` (267 lines)
- `src/lib/apiClient.ts` (243 lines)
- `src/services/api/base.ts` (156 lines)
- `src/services/matchingService.ts` (210 lines)
- `src/services/api/matching.service.ts` (197 lines)
- `src/services/api/matching-backend.service.ts` (130 lines)
- `src/lib/matching-algorithm.ts` (368 lines)
- `backend/src/routes/matching.ts` (210 lines)
- `src/types/user.ts` (95 lines)
- `src/types/profile.ts` (65 lines)
- `src/types/database.ts` (320 lines)
- `src/types/matching.ts` (180 lines)
- `src/utils/authHelpers.ts` (52 lines)
- `src/services/api/auth.service.ts` (230 lines)

### Total Lines Analyzed: ~2,900 lines across 14 key files

---

*Report generated by Code Deduplication Agent*
*Next steps: Review recommendations and prioritize implementation phases*
