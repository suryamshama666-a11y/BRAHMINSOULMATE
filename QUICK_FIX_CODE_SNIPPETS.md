# 🔧 QUICK FIX CODE SNIPPETS
## Copy-Paste Ready Solutions for Critical Issues

---

## 1️⃣ CSRF PROTECTION

### Install
```bash
npm install csurf cookie-parser
npm install --save-dev @types/csurf
```

### backend/src/server.ts
```typescript
import csrf from 'csurf';

// After cookieParser middleware (around line 150)
app.use(cookieParser());

// Add CSRF protection
const csrfProtection = csrf({ 
  cookie: false,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

app.use(csrfProtection);

// Add CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### src/lib/api.ts
```typescript
class API {
  private csrfToken: string | null = null;

  async getCsrfToken() {
    if (!this.csrfToken) {
      const response = await fetch('/api/csrf-token');
      const data = await response.json();
      this.csrfToken = data.csrfToken;
    }
    return this.csrfToken;
  }

  async post(url: string, data: any, options: any = {}) {
    const csrfToken = await this.getCsrfToken();
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async put(url: string, data: any, options: any = {}) {
    const csrfToken = await this.getCsrfToken();
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async delete(url: string, options: any = {}) {
    const csrfToken = await this.getCsrfToken();
    return fetch(url, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': csrfToken,
        ...options.headers,
      },
    });
  }
}
```

---

## 2️⃣ DEV BYPASS MODE FIX

### src/contexts/AuthContext.tsx
```typescript
// REPLACE THIS:
if (isDevBypassMode()) {
  setUser(getDevUser() as unknown as User);
  setProfile(getDevProfile() as unknown as UserProfile);
  setLoading(false);
  return;
}

// WITH THIS:
if (import.meta.env.DEV && isDevBypassMode()) {
  setUser(getDevUser() as unknown as User);
  setProfile(getDevProfile() as unknown as UserProfile);
  setLoading(false);
  return;
}
```

### src/config/dev.ts
```typescript
export function isDevBypassMode(): boolean {
  if (import.meta.env.DEV) {
    return process.env.VITE_DEV_BYPASS_AUTH === 'true';
  }
  return false;  // Always false in production
}
```

---

## 3️⃣ REQUEST CORRELATION IDS

### backend/src/middleware/correlationId.ts (NEW FILE)
```typescript
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface CorrelatedRequest extends Request {
  id: string;
}

export function correlationIdMiddleware(
  req: CorrelatedRequest,
  res: Response,
  next: NextFunction
): void {
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  req.id = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  res.locals.correlationId = correlationId;
  next();
}
```

### backend/src/server.ts
```typescript
import { correlationIdMiddleware } from './middleware/correlationId';

// Add early in middleware chain (after imports, before other middleware)
app.use(correlationIdMiddleware);

// Update morgan logging
app.use(morgan((tokens, req, res) => {
  const correlationId = (req as any).id || 'unknown';
  return [
    `[${correlationId}]`,
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms'
  ].join(' ');
}));
```

### src/lib/api.ts
```typescript
class API {
  private correlationId: string | null = null;

  private getCorrelationId(): string {
    if (!this.correlationId) {
      const stored = sessionStorage.getItem('correlation-id');
      if (stored) {
        this.correlationId = stored;
      } else {
        this.correlationId = this.generateUUID();
        sessionStorage.setItem('correlation-id', this.correlationId);
      }
    }
    return this.correlationId;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async request(url: string, options: any = {}) {
    const correlationId = this.getCorrelationId();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-correlation-id': correlationId,
      },
    });
  }
}
```

---

## 4️⃣ RATE LIMITING FIX

### backend/src/server.ts
```typescript
import rateLimit from 'express-rate-limit';

// Global limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return (req as any).user?.id || req.ip || 'unknown';
  },
});

// Auth limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
});

// Profile limiter
const profileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many profile views, please slow down',
});

// Message limiter
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many messages, please slow down',
});

// Payment limiter
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many payment attempts, please try again later',
});

// Apply limiters
app.use(globalLimiter);
app.post('/api/auth/login', authLimiter, authRoutes);
app.get('/api/profiles', profileLimiter, profileRoutes);
app.post('/api/messages', messageLimiter, messageRoutes);
app.post('/api/payments', paymentLimiter, paymentRoutes);
```

---

## 5️⃣ DATABASE INDEXES

### backend/src/migrations/20260410_add_missing_indexes.sql (NEW FILE)
```sql
-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_read 
  ON messages(receiver_id, read);

CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
  ON messages(sender_id, created_at DESC);

-- Profile views indexes
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at 
  ON profile_views(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_created 
  ON profile_views(viewer_id, created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
  ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON notifications(user_id, read);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_user_status 
  ON matches(user_id, status);

CREATE INDEX IF NOT EXISTS idx_matches_match_status 
  ON matches(match_id, status);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
  ON subscriptions(user_id, status);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_date 
  ON events(organizer_id, date DESC);

-- Analyze query performance
ANALYZE;
```

---

## 6️⃣ API VERSIONING

### backend/src/routes/index.ts (NEW FILE)
```typescript
import express from 'express';
import v1Routes from './v1';
import v2Routes from './v2';

const router = express.Router();

// V1 routes (legacy)
router.use('/v1', v1Routes);

// V2 routes (current)
router.use('/v2', v2Routes);

// Default to latest version
router.use('/', v2Routes);

export default router;
```

### backend/src/routes/v1/index.ts (NEW FILE)
```typescript
import express from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
// ... import other v1 routes

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
// ... register other v1 routes

export default router;
```

### backend/src/routes/v2/index.ts (NEW FILE)
```typescript
import express from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
// ... import other v2 routes

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
// ... register other v2 routes

export default router;
```

### backend/src/server.ts
```typescript
import apiRoutes from './routes';

// Register versioned routes
app.use('/api', apiRoutes);

// Now routes are:
// /api/v1/auth
// /api/v2/auth
// /api/auth (defaults to v2)
```

---

## 7️⃣ SOFT DELETE ENFORCEMENT

### backend/src/migrations/20260410_soft_delete_views.sql (NEW FILE)
```sql
-- Create view for active messages
CREATE OR REPLACE VIEW messages_active AS
SELECT * FROM messages WHERE deleted_at IS NULL;

-- Create view for active notifications
CREATE OR REPLACE VIEW notifications_active AS
SELECT * FROM notifications WHERE deleted_at IS NULL;

-- Create view for active profiles
CREATE OR REPLACE VIEW profiles_active AS
SELECT * FROM profiles WHERE deleted_at IS NULL;

-- Add RLS policies
CREATE POLICY "messages_soft_delete" ON messages
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "notifications_soft_delete" ON notifications
  FOR SELECT USING (deleted_at IS NULL);
```

### Update all queries
```typescript
// BEFORE
const messages = await supabase
  .from('messages')
  .select('*')
  .eq('receiver_id', userId);

// AFTER
const messages = await supabase
  .from('messages_active')  // Use view
  .select('*')
  .eq('receiver_id', userId);
```

---

## 8️⃣ N+1 QUERY FIX

### backend/src/services/profileService.ts
```typescript
// BEFORE (N+1 queries)
async getProfilesWithMatches(userIds: string[]) {
  const profiles = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  const profilesWithMatches = await Promise.all(
    profiles.map(async (profile) => {
      const matches = await supabase
        .from('matches')
        .select('*')
        .eq('user_id', profile.id);
      return { ...profile, matches };
    })
  );

  return profilesWithMatches;
}

// AFTER (1 query)
async getProfilesWithMatches(userIds: string[]) {
  const profiles = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  const matches = await supabase
    .from('matches')
    .select('*')
    .in('user_id', userIds);  // Batch query

  const profilesWithMatches = profiles.map(profile => ({
    ...profile,
    matches: matches.filter(m => m.user_id === profile.id)
  }));

  return profilesWithMatches;
}
```

---

## 9️⃣ CIRCUIT BREAKER

### Install
```bash
npm install opossum
npm install --save-dev @types/opossum
```

### backend/src/utils/circuitBreaker.ts (NEW FILE)
```typescript
import CircuitBreaker from 'opossum';

export function createCircuitBreaker<T>(
  fn: (...args: any[]) => Promise<T>,
  options: {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    name: string;
  }
) {
  return new CircuitBreaker(fn, {
    timeout: options.timeout || 3000,
    errorThresholdPercentage: options.errorThresholdPercentage || 50,
    resetTimeout: options.resetTimeout || 30000,
    name: options.name,
  });
}
```

### backend/src/services/paymentService.ts
```typescript
import { createCircuitBreaker } from '../utils/circuitBreaker';

const razorpayBreaker = createCircuitBreaker(
  async (paymentId: string) => {
    return razorpay.payments.fetch(paymentId);
  },
  {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    name: 'razorpay-fetch',
  }
);

async function getPaymentStatus(paymentId: string) {
  try {
    return await razorpayBreaker.fire(paymentId);
  } catch (error) {
    if (error.message === 'breaker is open') {
      return {
        status: 'pending',
        message: 'Payment service temporarily unavailable',
      };
    }
    throw error;
  }
}
```

---

## ✅ VERIFICATION COMMANDS

```bash
# 1. Check CSRF protection
curl -X POST http://localhost:3001/api/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
# Should return: 403 Forbidden

# 2. Check correlation IDs
curl -X GET http://localhost:3001/api/profiles \
  -H "Authorization: Bearer <token>"
# Check response headers for x-correlation-id

# 3. Check rate limiting
for i in {1..15}; do
  curl -X GET http://localhost:3001/api/profiles
done
# After 10 requests, should get 429 Too Many Requests

# 4. Check API versioning
curl -X GET http://localhost:3001/api/v1/profiles
curl -X GET http://localhost:3001/api/v2/profiles
# Both should work

# 5. Check database indexes
psql -c "SELECT indexname FROM pg_indexes WHERE tablename='messages';"
# Should show idx_messages_created_at
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] CSRF protection installed and tested
- [ ] Dev bypass mode fixed
- [ ] Request correlation IDs implemented
- [ ] Rate limiting updated
- [ ] Database indexes created
- [ ] API versioning implemented
- [ ] Soft delete views created
- [ ] N+1 queries fixed
- [ ] Circuit breaker implemented
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Smoke tests passed
- [ ] Deployed to production

---

**Total Implementation Time**: 20 hours  
**Difficulty**: Medium  
**Risk**: Low (all changes are additive)

