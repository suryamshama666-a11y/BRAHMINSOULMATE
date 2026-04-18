# Comment Quality Guidelines for Development Team

## Overview
This document establishes standards for code comments to maintain clarity, reduce noise, and improve maintainability.

---

## 1. Comment Philosophy

### Core Principle
**Comments should explain WHY, not WHAT. Code should be self-explanatory for WHAT.**

### The Rule of Thumb
If you need to read the comment to understand what the code does, the code needs to be clearer—not the comment.

---

## 2. Types of Comments

### ✅ GOOD: Explain Non-Obvious Decisions

```typescript
// ✅ GOOD: Explains why we use a specific approach
// We use a Set here instead of Array.includes() because we need O(1) lookup
// for performance-critical path with potentially thousands of items
const userIds = new Set(response.data.map(u => u.id));

// ✅ GOOD: Explains business logic
// Retry only on network errors, not on 4xx client errors
// 5xx errors are retried by the circuit breaker
if (error.status >= 500) {
  return retry();
}

// ✅ GOOD: Explains workaround
// Safari doesn't support AbortController in service workers,
// so we use a timeout-based cancellation instead
const timeoutId = setTimeout(() => controller.abort(), 5000);
```

### ❌ BAD: Obvious Code

```typescript
// ❌ BAD: The code is self-explanatory
// Increment the counter
counter++;

// ❌ BAD: Method name already says this
// Get the user data
const userData = getUserData();

// ❌ BAD: Obvious from context
// Check if user is authenticated
if (user) {
  // ...
}

// ❌ BAD: Repeats the code
// Set the loading state to true
setLoading(true);
```

---

## 3. Comment Categories

### 1. **Algorithm Explanation** ✅ KEEP
```typescript
// Implements Fisher-Yates shuffle for O(n) randomization
// We iterate backwards to avoid index shifting issues
for (let i = array.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [array[i], array[j]] = [array[j], array[i]];
}
```

### 2. **Warning/Caution** ✅ KEEP
```typescript
// WARNING: Modifying this regex will break profile URL parsing
// See: https://github.com/org/repo/issues/1234
const PROFILE_URL_REGEX = /^\/profile\/([a-z0-9-]+)$/;

// SECURITY: Never log user passwords or tokens
logger.info('User login attempt', { userId, email }); // ✅ Safe
```

### 3. **Workaround/Hack** ✅ KEEP
```typescript
// HACK: Supabase doesn't support batch updates, so we loop
// TODO: Replace with batch API when available (v2.0)
for (const id of userIds) {
  await updateUser(id, data);
}
```

### 4. **Complex Business Logic** ✅ KEEP
```typescript
// Users can only view profiles if:
// 1. They have an active subscription, OR
// 2. They're viewing their own profile, OR
// 3. The profile is marked as public
const canViewProfile = hasActiveSubscription || isOwnProfile || isPublic;
```

### 5. **Performance Notes** ✅ KEEP
```typescript
// Memoize this expensive calculation to avoid recalculating
// on every render. Dependency array is intentionally minimal.
const memoizedResult = useMemo(() => expensiveCalculation(data), [data.id]);
```

### 6. **Obvious Code** ❌ REMOVE
```typescript
// ❌ Remove these
// Initialize the array
const items = [];

// Loop through users
users.forEach(user => {
  // Add user to list
  list.push(user);
});

// Check if empty
if (items.length === 0) {
  // Return empty state
  return <EmptyState />;
}
```

---

## 4. Specific Patterns to Avoid

### Pattern 1: Commented-Out Code
```typescript
// ❌ BAD: Never commit commented-out code
// const oldImplementation = () => {
//   return fetch('/api/users');
// };

// ✅ GOOD: Use git history instead
// If you need the old code, check git blame or git log
```

### Pattern 2: Generic TODOs
```typescript
// ❌ BAD: Too vague
// TODO: Fix this

// ❌ BAD: No context
// TODO: Implement

// ✅ GOOD: Specific and actionable
// TODO: Replace with batch API when Supabase v2.0 is released
// See: https://github.com/supabase/supabase/issues/1234

// ✅ GOOD: Links to issue
// TODO: Add retry logic for failed uploads (Issue #456)
```

### Pattern 3: Redundant Comments
```typescript
// ❌ BAD: Comment repeats method name
// Get notification preferences
async getNotificationPreferences() { }

// ✅ GOOD: No comment needed (method name is clear)
async getNotificationPreferences() { }

// ✅ GOOD: Comment adds value
// Fetches from cache first, then falls back to API
async getNotificationPreferences() { }
```

### Pattern 4: Console Statements
```typescript
// ❌ BAD: Debug console.log in production code
console.log('User logged in:', user);

// ✅ GOOD: Use proper logger
logger.info('User logged in', { userId: user.id });

// ✅ GOOD: Only in development
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

---

## 5. JSDoc Standards

### When to Use JSDoc
- **Public APIs**: Functions exported from modules
- **Complex functions**: Non-obvious parameters or return types
- **Library code**: Reusable utilities

### When NOT to Use JSDoc
- **Obvious functions**: `const double = (x) => x * 2`
- **Internal functions**: Private helper functions
- **Simple getters/setters**: Self-explanatory

### Good JSDoc Examples

```typescript
/**
 * Calculates the compatibility score between two profiles.
 * 
 * @param profile1 - First user profile
 * @param profile2 - Second user profile
 * @returns Compatibility score from 0-100
 * 
 * @example
 * const score = calculateCompatibility(user1, user2);
 * // Returns: 85
 */
function calculateCompatibility(profile1: Profile, profile2: Profile): number {
  // Implementation
}

/**
 * Fetches user profile with caching.
 * 
 * Caches results for 5 minutes to reduce API calls.
 * Throws if user not found.
 * 
 * @param userId - The user ID to fetch
 * @returns User profile data
 * @throws {NotFoundError} If user doesn't exist
 */
async function getUserProfile(userId: string): Promise<UserProfile> {
  // Implementation
}
```

### Bad JSDoc Examples

```typescript
// ❌ BAD: Obvious JSDoc
/**
 * Gets the user
 * @param id - The id
 * @returns The user
 */
function getUser(id: string) { }

// ❌ BAD: Redundant JSDoc
/**
 * Sets the name
 * @param name - The name to set
 */
function setName(name: string) { }
```

---

## 6. Comment Maintenance

### Update Comments When Code Changes
```typescript
// ❌ BAD: Outdated comment
// Fetches from API (actually uses cache now)
async function getUser(id: string) {
  return cache.get(`user:${id}`);
}

// ✅ GOOD: Updated comment
// Fetches from cache first, then API
async function getUser(id: string) {
  return cache.get(`user:${id}`);
}
```

### Remove Obsolete Comments
```typescript
// ❌ BAD: Outdated workaround comment
// IE11 doesn't support Promise.finally()
// This can be removed once IE11 support is dropped
promise.then(success).catch(error);

// ✅ GOOD: Use modern syntax
promise.finally(() => cleanup());
```

---

## 7. Inline Comments vs. Block Comments

### Use Block Comments for Sections
```typescript
// ✅ GOOD: Block comment for section
// ============================================
// User Authentication Flow
// ============================================

async function authenticateUser(credentials) {
  // Implementation
}
```

### Use Inline Comments Sparingly
```typescript
// ✅ GOOD: Inline comment for non-obvious line
const result = data.filter(x => x.active).map(x => x.id); // Only active users

// ❌ BAD: Obvious inline comment
const count = items.length; // Get the length
```

---

## 8. Team Standards

### Code Review Checklist for Comments

- [ ] Comments explain WHY, not WHAT
- [ ] No commented-out code
- [ ] No generic TODOs without context
- [ ] No obvious comments (method name is clear)
- [ ] JSDoc only for public APIs
- [ ] Comments are up-to-date with code
- [ ] No console.log in production code
- [ ] Security/performance notes are present where needed

### Linting Rules

```json
{
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-commented-code": "error",
    "require-jsdoc": ["warn", { "require": { "FunctionDeclaration": true } }]
  }
}
```

---

## 9. Real-World Examples

### Example 1: Notification Service

**BEFORE (AI-generated noise):**
```typescript
// Initialize service worker
private async initializeServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Get current permission status
getPermissionStatus(): NotificationPermission {
  return Notification.permission;
}

// Subscribe to push notifications
async subscribeToPush(): Promise<PushSubscription | null> {
  // ...
}
```

**AFTER (Clean):**
```typescript
private async initializeServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

getPermissionStatus(): NotificationPermission {
  return Notification.permission;
}

async subscribeToPush(): Promise<PushSubscription | null> {
  // ...
}
```

### Example 2: Complex Logic

**BEFORE (No explanation):**
```typescript
const canViewProfile = hasActiveSubscription || isOwnProfile || isPublic;
```

**AFTER (Clear intent):**
```typescript
// Users can view profiles if they have an active subscription,
// are viewing their own profile, or the profile is public
const canViewProfile = hasActiveSubscription || isOwnProfile || isPublic;
```

---

## 10. Summary

| Aspect | Standard |
|--------|----------|
| **Comment Purpose** | Explain WHY, not WHAT |
| **Obvious Code** | No comments needed |
| **Complex Logic** | Add comments explaining approach |
| **Workarounds** | Always document with context |
| **TODOs** | Must be specific and actionable |
| **Console Logs** | Use logger, not console |
| **Commented Code** | Never commit |
| **JSDoc** | Only for public APIs |
| **Maintenance** | Update when code changes |

---

## Questions?

If you have questions about these guidelines, please:
1. Check this document first
2. Ask in code review
3. Update this document if needed

Remember: **Good code is self-documenting. Comments should add value, not noise.**
