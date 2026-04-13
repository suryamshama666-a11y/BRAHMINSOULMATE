# useEffect Refactoring Plan

## Audit Summary: 212 useEffect Usages Found

---

## ✅ PHASE 1 COMPLETE: Derived State Anti-Patterns Fixed

### Files Refactored (6 files):

| File | Change | Risk |
|------|---------|------|
| ✅ `src/pages/InterestsReceived.tsx` | Removed `useEffect(() => setCurrentPage(1), [filters])` | Low |
| ✅ `src/pages/MyFavorites.tsx` | Removed `useEffect(() => setCurrentPage(1), [filters])` | Low |
| ✅ `src/pages/MyInterests.tsx` | Removed `useEffect(() => setCurrentPage(1), [filters])` | Low |
| ✅ `src/pages/Search.tsx` | Removed `useEffect(() => setItemsPerPage(...), [options])` | Low |
| ✅ `src/pages/Online.tsx` | Removed `useEffect(() => setItemsPerPage(...), [])` | Low |
| ✅ `src/pages/NewMembers.tsx` | Removed `useEffect(() => setItemsPerPage(...), [])` | Low |

### Pattern Applied:
```typescript
// ❌ BEFORE (Anti-pattern)
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, sortBy, itemsPerPage, statusFilter, dateFilter]);

// ✅ AFTER (Inline Handler)
const handleSearchChange = (value: string) => {
  setSearchTerm(value);
  setCurrentPage(1);
};
```

---

## 🟡 PHASE 2: API Call Migration (MEDIUM RISK)
These fetch data on mount and should use `useQuery`:

| File | Pattern | Risk |
|------|---------|------|
| `src/hooks/useSuccessStories.ts` | Fetch on mount | Medium |
| `src/hooks/useEvents.ts` | Fetch on mount | Medium |
| `src/hooks/useNotifications.ts` | Fetch on mount | Medium |
| `src/hooks/useSubscription.ts` | Fetch on mount | Medium |
| `src/hooks/useCompatibility.ts` | Fetch on mount | Medium |
| `src/pages/SuccessStories.tsx` | Fetch on mount | Medium |
| `src/pages/Events.tsx` | Fetch on mount | Medium |
| `src/pages/Dashboard.tsx` | Fetch on mount | Medium |
| `src/pages/Community.tsx` | Fetch on mount | Medium |
| `src/pages/VDates.tsx` | Fetch on mount | Medium |
| `src/pages/WhoViewedYou.tsx` | Fetch on mount | Medium |
| `src/pages/YouViewed.tsx` | Fetch on mount | Medium |
| `src/pages/OnlineProfiles.tsx` | Fetch on mount | Medium |
| `src/pages/Online.tsx` | Fetch on mount | Medium |
| `src/pages/NewMembers.tsx` | Fetch on mount | Medium |
| `src/pages/EventDetails.tsx` | Fetch on mount | Medium |
| `src/pages/ForumPost.tsx` | Fetch on mount | Medium |
| `src/components/FeaturedProfiles.tsx` | Fetch on mount | Medium |

---

## 🟢 KEEP: Real-time Subscriptions (Legitimate useEffect)
These subscribe to external events and must remain:

| File | Purpose | Comment |
|------|---------|---------|
| `src/hooks/useRealTimeMessages.ts` | Supabase real-time | `// effect:audited — Real-time Supabase subscription` |
| `src/hooks/useInterests.ts` | Interest exchanges | `// effect:audited — Real-time Supabase subscription` |
| `src/hooks/usePresence.ts` | User presence | `// effect:audited — Real-time Supabase subscription` |
| `src/hooks/useTypingIndicator.ts` | Typing status | `// effect:audited — Real-time Supabase subscription` |
| `src/contexts/NotificationContext.tsx` | Notifications | `// effect:audited — Real-time Supabase subscription` |
| `src/hooks/messaging/useRealTimeSubscription.ts` | Messages | `// effect:audited — Real-time Supabase subscription` |
| `src/contexts/AuthContext.tsx` | Auth state | `// effect:audited — Auth state listener` |
| `src/hooks/useSupabaseAuth.ts` | Auth state | `// effect:audited — Auth state listener` |

---

## 🟢 KEEP: Event Listeners (Legitimate useEffect)
These attach to DOM/browser events and must remain:

| File | Purpose | Comment |
|------|---------|---------|
| `src/components/Navbar.tsx` | Scroll listener | `// effect:audited — Scroll event listener` |
| `src/pages/Landing.tsx` | Scroll listener | `// effect:audited — Scroll event listener` |
| `src/hooks/use-mobile.tsx` | Media query | `// effect:audited — Media query listener` |
| `src/hooks/useNetworkStatus.ts` | Online/offline | `// effect:audited — Network status listener` |
| `src/components/ui/dropdown-menu.tsx` | Click outside | `// effect:audited — Click outside listener` |
| `src/components/ui/sidebar.tsx` | Keyboard shortcut | `// effect:audited — Keyboard event listener` |
| `src/pages/PhotoManagement.tsx` | Keyboard nav | `// effect:audited — Keyboard event listener` |
| `src/components/CookieConsent.tsx` | LocalStorage | `// effect:audited — Initialize from localStorage` |

---

## 🟢 KEEP: Timers/Intervals (Legitimate useEffect)
These manage timers and must remain:

| File | Purpose | Comment |
|------|---------|---------|
| `src/features/voice-call/useVoiceCall.ts` | Duration timer | `// effect:audited — Call duration timer` |
| `src/features/video-call/useVideoCall.ts` | Duration timer | `// effect:audited — Call duration timer` |
| `src/features/messages/PhoneCallModal.tsx` | Duration timer | `// effect:audited — Call duration timer` |
| `src/features/messages/VideoCallModal.tsx` | Duration timer | `// effect:audited — Call duration timer` |
| `src/components/animations/HeartsAnimation.tsx` | Animation | `// effect:audited — Animation timing` |

---

## 🟢 KEEP: DOM Manipulation (Legitimate useEffect)
These interact with DOM APIs and must remain:

| File | Purpose | Comment |
|------|---------|---------|
| `src/contexts/ThemeContext.tsx` | Theme class | `// effect:audited — DOM class manipulation` |
| `src/components/DarkModeToggle.tsx` | Theme toggle | `// effect:audited — DOM class manipulation` |
| `src/components/ui/carousel.tsx` | Carousel API | `// effect:audited — External library integration` |
| `src/components/vdates/VideoCall.tsx` | Jitsi script | `// effect:audited — External script loading` |

---

## 🟢 KEEP: Navigation/Redirect (Legitimate useEffect)
These handle auth redirects and must remain:

| File | Purpose | Comment |
|------|---------|---------|
| `src/pages/auth/callback.tsx` | OAuth callback | `// effect:audited — OAuth callback handler` |
| `src/pages/Logout.tsx` | Logout logic | `// effect:audited — Logout handler` |
| `src/pages/ResetPassword.tsx` | Token parsing | `// effect:audited — URL token parsing` |
| `src/pages/Register.tsx` | Auth redirect | `// effect:audited — Auth redirect` |
| `src/components/ProtectedRoute.tsx` | Last active | `// effect:audited — Update last active timestamp` |

---

## Modern Patterns Reference

### ✅ Derived State (Use this instead)
```typescript
// Instead of:
useEffect(() => setCurrentPage(1), [filter1, filter2]);

// Use inline in handler:
const handleFilterChange = (newFilter) => {
  setFilter(newFilter);
  setCurrentPage(1); // Reset page inline
};
```

### ✅ Data Fetching (Use this instead)
```typescript
// Instead of:
const [data, setData] = useState([]);
useEffect(() => {
  fetchData().then(setData);
}, []);

// Use:
const { data = [] } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData
});
```

### ✅ Custom Hooks (For complex logic)
```typescript
// Extract complex logic into custom hooks
const useCallTimer = (isActive: boolean) => {
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, [isActive]);
  return duration;
};
```

---

## Implementation Plan

### Phase 1: Derived State Fixes (LOW RISK) ✅ COMPLETE
Fix the 6 anti-patterns where useEffect resets pagination state.

### Phase 2: API Call Migration (MEDIUM RISK) - PENDING
Migrate fetch-on-mount patterns to useQuery.

### Phase 3: Audit Comments (LOW RISK) - PENDING
Add `// effect:audited` comments to all legitimate useEffects.