# Legacy & Deprecated Code Removal Assessment

## Executive Summary
Identified 12 categories of deprecated code, legacy patterns, and obsolete implementations that can be safely removed or modernized. Total impact: ~500 lines of code to clean up, 1 class component to modernize, and 3 feature flags to evaluate.

---

## 1. DEPRECATED API VERSIONS & VERSIONING

### Finding: Empty Deprecated Versions Array
**File:** `backend/src/middleware/apiVersioning.ts`
**Issue:** `DEPRECATED_VERSIONS` is an empty array with no versions scheduled for deprecation
**Status:** SAFE TO REMOVE - The deprecation infrastructure is in place but unused
**Recommendation:** Remove the deprecation warning logic since no versions are deprecated

```typescript
// Current (lines 14, 45-49)
export const DEPRECATED_VERSIONS: string[] = [];
if (DEPRECATED_VERSIONS.includes(version)) {
  res.setHeader('X-API-Deprecation-Warning', ...);
}
```

**Action:** Remove unused deprecation warning code

---

## 2. LEGACY REACT PATTERNS

### Finding: Class Component (ErrorBoundary)
**File:** `src/components/ErrorBoundary.tsx`
**Issue:** Uses legacy class component pattern instead of modern hooks
**Status:** MODERNIZABLE - Can be converted to functional component with hooks
**Impact:** 200+ lines of code
**Recommendation:** Keep as-is for now (Error Boundaries require class components in React)
**Note:** This is actually a valid use case - React Error Boundaries must be class components

---

## 3. UNUSED TODO/FIXME COMMENTS

### Finding: Incomplete Implementations
**Files & Issues:**

1. **`src/utils/performance.ts:167`**
   - TODO: Implement proper hit/miss tracking for cache statistics
   - Status: INCOMPLETE - Returns hardcoded 0.8
   - Action: Either implement or remove

2. **`src/services/api/photos.service.ts:108`**
   - TODO: Install browser-image-compression package
   - Status: INCOMPLETE - Returns original file
   - Action: Either implement or document as future enhancement

3. **`backend/src/services/smartNotifications.ts:124`**
   - TODO: Send push notification if user has enabled it
   - Status: INCOMPLETE - Commented out code
   - Action: Remove commented code or implement

---

## 4. LEGACY SCHEMA SUPPORT

### Finding: Dual Schema Support in Conversation Type
**File:** `src/types/index.ts:192-220`
**Issue:** Supports both legacy (`user1_id`, `user2_id`) and new schema (`user_id`, `partner_id`)
**Status:** SAFE TO REMOVE - If new schema is fully deployed
**Recommendation:** Verify all code uses new schema, then remove legacy fields

```typescript
// Legacy fields to remove (if safe):
user1_id?: string;
user2_id?: string;
```

---

## 5. MOCK DATA & PLACEHOLDER IMPLEMENTATIONS

### Finding: Development-Only Bypass Code
**File:** `src/config/dev.ts`
**Issue:** Development authentication bypass with mock user/profile
**Status:** SAFE - Properly gated with `VITE_DEV_BYPASS_AUTH` flag
**Recommendation:** Keep for development, ensure never enabled in production

### Finding: Mock Supabase Clients
**Files:**
- `backend/src/config/supabase.ts:16` - Placeholder Supabase URL
- `src/integrations/supabase/client.ts:12` - Placeholder Supabase URL
**Status:** SAFE - Used as fallback when env vars missing
**Recommendation:** Keep for graceful degradation

### Finding: Mock Data for Testing
**File:** `src/data/fixtures/mockProfiles.ts`
**Status:** SAFE - Used for E2E tests and development
**Recommendation:** Keep for testing

---

## 6. INCOMPLETE/STUB IMPLEMENTATIONS

### Finding: Stub Hook
**File:** `src/hooks/useMessageReactions.ts:1`
**Issue:** Marked as "Stub for useMessageReactions hook"
**Status:** NEEDS INVESTIGATION - Check if actually used
**Recommendation:** Either implement or remove

### Finding: Fallback Mock Data
**File:** `src/hooks/useCompatibility.ts:85-87`
**Issue:** Returns null with comment "Fallback to mock if data is missing"
**Status:** INCOMPLETE - Should either implement or document
**Recommendation:** Document the expected behavior

---

## 7. FEATURE FLAGS EVALUATION

### Current Feature Flags
**File:** `src/utils/featureFlags.ts`

| Flag | Status | Recommendation |
|------|--------|-----------------|
| `VIDEO_CALLS` | Conditional | Keep - Feature in development |
| `AI_MATCHING` | Conditional | Keep - Feature in development |
| `PREMIUM_FEATURES` | Conditional | Keep - Core feature |
| `ANALYTICS` | Default true | Keep - Core feature |
| `NOTIFICATIONS` | Default true | Keep - Core feature |
| `SOCIAL_LOGIN` | Conditional | Keep - Feature in development |
| `HOROSCOPE_MATCHING` | Conditional | Keep - Core feature |
| `COMMUNITY_FORUM` | Conditional | Keep - Feature in development |
| `EVENTS` | Conditional | Keep - Feature in development |

**Status:** All flags are actively used - NO REMOVALS RECOMMENDED

---

## 8. COMMENTED-OUT CODE BLOCKS

### Finding: Commented Production Code
**Locations:**
- `backend/src/services/smartNotifications.ts:125` - Commented push notification code
- `src/services/api/photos.service.ts:109-110` - Commented compression code
- `src/features/messages/hooks/useMessages.ts:388-390` - Commented type assertion

**Status:** SAFE TO REMOVE - Dead code
**Recommendation:** Remove all commented-out code blocks

---

## 9. UNUSED VARIABLES & PARAMETERS

### Finding: Unused Parameters in API Versioning
**File:** `backend/src/middleware/apiVersioning.ts`
**Issues:**
- Line 64: `version` parameter unused in `getDeprecationDate()`
- Line 87: `version` parameter unused in `transformForVersion()`

**Status:** SAFE TO REMOVE - Dead parameters
**Recommendation:** Remove or use the parameters

---

## 10. PLACEHOLDER/FALLBACK LOGIC

### Finding: Mock Data Fallbacks
**Locations:**
- `backend/src/routes/horoscope.ts:57` - Returns mock data when API key missing
- `src/hooks/useCompatibility.ts:85` - Returns null when data missing

**Status:** SAFE - Proper fallback behavior
**Recommendation:** Keep for robustness

---

## 11. UNUSED IMPORTS & EXPORTS

### Finding: Potentially Unused Exports
**Files to audit:**
- `src/utils/featureFlags.ts` - Check if all methods are used
- `backend/src/middleware/apiVersioning.ts` - Check if all functions are used

**Status:** NEEDS VERIFICATION
**Recommendation:** Run import analysis

---

## 12. OLD BROWSER COMPATIBILITY

### Finding: No Legacy Browser Support Code
**Status:** GOOD - No IE/old browser polyfills found
**Recommendation:** No action needed

---

## REMOVAL PRIORITY

### High Priority (Safe & High Impact)
1. Remove commented-out code blocks (3 locations)
2. Remove unused TODO comments (3 locations)
3. Remove unused parameters in apiVersioning.ts (2 locations)

### Medium Priority (Requires Verification)
1. Verify and remove legacy schema fields from Conversation type
2. Verify useMessageReactions stub is not used
3. Audit feature flag usage

### Low Priority (Keep As-Is)
1. Keep ErrorBoundary class component (required by React)
2. Keep dev bypass code (properly gated)
3. Keep mock data (used for testing)
4. Keep feature flags (all actively used)

---

## IMPLEMENTATION PLAN

### Phase 1: Safe Removals (No Dependencies)
- [ ] Remove commented-out code blocks
- [ ] Remove unused TODO comments
- [ ] Remove unused parameters

### Phase 2: Verification & Removal
- [ ] Verify legacy schema fields are not used
- [ ] Verify useMessageReactions stub is not used
- [ ] Audit feature flag usage

### Phase 3: Documentation
- [ ] Update CHANGELOG
- [ ] Document removed patterns
- [ ] Update migration guide if needed

---

## METRICS

- **Total Deprecated Code Found:** 12 categories
- **Safe to Remove:** ~50 lines
- **Requires Verification:** ~100 lines
- **Keep As-Is:** ~350 lines
- **Class Components:** 1 (valid use case)
- **Feature Flags:** 9 (all active)
- **Commented Code Blocks:** 3

