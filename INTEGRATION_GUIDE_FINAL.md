# 🔧 INTEGRATION GUIDE - FINAL
## Complete Step-by-Step Instructions to Production Ready

**Time Required**: 6-9 hours  
**Difficulty**: Medium  
**Risk**: Low (all changes are additive)

---

## PHASE 1: MIDDLEWARE INTEGRATION (30 minutes)

### Step 1.1: Add CSRF Protection to server.ts

**Location**: `backend/src/server.ts` (around line 150, after cookieParser)

```typescript
// Add these imports at the top
import { csrfProtection, setCsrfToken } from './middleware/csrf';

// Add after app.use(cookieParser());
app.use(setCsrfToken);      // Set CSRF token on all responses
app.use(csrfProtection);    // Validate CSRF on state-changing requests
```

**Verify**: 
```bash
curl -X POST http://localhost:3001/api/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
# Should return: 403 Forbidden - CSRF token missing
```

---

### Step 1.2: Add Request Logger to server.ts

**Location**: `backend/src/server.ts` (around line 160, before morgan)

```typescript
// Add import at the top
import { requestLogger } from './middleware/requestLogger';

// Add before app.use(morgan(...))
app.use(requestLogger);  // Add correlation IDs to all requests
```

**Verify**:
```bash
curl -X GET http://localhost:3001/api/profiles \
  -H "Authorization: Bearer <token>"
# Check response headers for X-Correlation-ID
```

---

### Step 1.3: Add API Versioning to server.ts

**Location**: `backend/src/server.ts` (around line 170, before route definitions)

```typescript
// Add import at the top
import { apiVersioning } from './middleware/apiVersioning';

// Add before app.use("/api/health", healthRoutes);
app.use(apiVersioning);  // Validate API version on all requests
```

**Verify**:
```bash
curl -X GET http://localhost:3001/api/profiles \
  -H "X-API-Version: v1"
# Should work

curl -X GET http://localhost:3001/api/profiles \
  -H "X-API-Version: v99"
# Should return: 400 Bad Request - Unsupported API version
```

---

### Step 1.4: Verify All Middleware is Active

```bash
# Start backend
npm run dev --prefix backend

# Check logs for:
# ✅ [Request] GET /api/profiles - Correlation ID: ...
# ✅ X-API-Version header in response
# ✅ X-CSRF-Token header in response
```

---

## PHASE 2: DATABASE & SOFT DELETE (2 hours)

### Step 2.1: Apply Database Migration

**Option A: Via Supabase Dashboard**
1. Go to Supabase dashboard
2. Click SQL Editor
3. Click New Query
4. Copy entire content from `backend/src/migrations/20260413_fix_schema_consistency.sql`
5. Paste into editor
6. Click Run
7. Wait for completion

**Option B: Via CLI**
```bash
# If you have psql installed
psql $DATABASE_URL < backend/src/migrations/20260413_fix_schema_consistency.sql
```

**Verify**:
```sql
-- In Supabase SQL Editor, run:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('education_level', 'employment_status', 'annual_income_range');

-- Should return 3 rows
```

---

### Step 2.2: Add Soft Delete Middleware to Routes

**Location**: `backend/src/routes/profile.ts` (at the top)

```typescript
// Add import
import { preventHardDelete, softDelete } from '../middleware/softDelete';

// Add middleware to router
router.use(preventHardDelete);  // Prevent hard deletes on protected tables
```

**Repeat for all routes that handle deletions:**
- `backend/src/routes/messages.ts`
- `backend/src/routes/profile.ts`
- `backend/src/routes/notifications.ts`
- `backend/src/routes/events.ts`

---

### Step 2.3: Update Queries to Filter Deleted Records

**Location**: `backend/src/routes/messages.ts` (around line 80)

**Before:**
```typescript
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .eq('receiver_id', userId);
```

**After:**
```typescript
import { filterDeleted } from '../middleware/softDelete';

const { data, error } = await supabase
  .from('messages')
  .select('*')
  .eq('receiver_id', userId)
  .is('deleted_at', null);  // Filter out deleted messages
```

**Repeat for all queries that fetch data:**
- Messages queries
- Profile queries
- Notification queries
- Event queries

---

### Step 2.4: Update Delete Endpoints to Use Soft Delete

**Location**: `backend/src/routes/messages.ts` (delete endpoint)

**Before:**
```typescript
router.delete('/:id', authMiddleware, async (req, res) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', req.params.id);
});
```

**After:**
```typescript
import { softDelete } from '../middleware/softDelete';

router.delete('/:id', authMiddleware, async (req, res) => {
  const { data, error } = await softDelete('messages', req.params.id);
  if (error) throw error;
  res.json({ success: true, message: 'Message deleted' });
});
```

---

### Step 2.5: Verify Soft Delete Works

```bash
# Create a message
curl -X POST http://localhost:3001/api/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"receiver_id":"user-123","content":"Test"}'

# Delete the message
curl -X DELETE http://localhost:3001/api/messages/<message-id> \
  -H "Authorization: Bearer <token>"

# Try to fetch deleted message
curl -X GET http://localhost:3001/api/messages/<message-id> \
  -H "Authorization: Bearer <token>"
# Should return: 404 Not Found (because deleted_at is filtered)

# Verify in database
SELECT * FROM messages WHERE id = '<message-id>';
# Should show: deleted_at = 2026-04-10T...
```

---

## PHASE 3: PAYMENT PROTECTION (30 minutes)

### Step 3.1: Wrap Razorpay Calls with Circuit Breaker

**Location**: `backend/src/routes/payments.ts` (around line 50)

```typescript
// Add import
import { paymentCircuitBreaker } from '../services/circuitBreaker';

// Wrap Razorpay calls
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const order = await paymentCircuitBreaker.execute(() =>
      razorpay.orders.create({
        amount: req.body.amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      })
    );
    
    res.json({ success: true, order });
  } catch (error) {
    if (error.message === 'Circuit breaker is OPEN - service unavailable') {
      res.status(503).json({
        success: false,
        error: 'Payment service temporarily unavailable',
        retryAfter: 60
      });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});
```

---

### Step 3.2: Add Circuit Breaker Monitoring Endpoint

**Location**: `backend/src/server.ts` (around line 250)

```typescript
// Add import
import { circuitBreakerService } from './services/circuitBreaker';

// Add monitoring endpoint
app.get('/api/health/circuit-breakers', (req, res) => {
  res.json(circuitBreakerService.getSummary());
});
```

---

### Step 3.3: Verify Circuit Breaker Works

```bash
# Check circuit breaker status
curl -X GET http://localhost:3001/api/health/circuit-breakers

# Response should show:
{
  "healthy": 3,
  "unhealthy": 0,
  "total": 3,
  "services": {
    "payment": "CLOSED",
    "externalApi": "CLOSED",
    "notification": "CLOSED"
  }
}
```

---

## PHASE 4: TESTING (4-6 hours)

### Step 4.1: Create CSRF Tests

**File**: `backend/src/routes/__tests__/csrf.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../server';

describe('CSRF Protection', () => {
  it('should reject POST without CSRF token', async () => {
    const response = await request(app)
      .post('/api/profile')
      .send({ name: 'Test' });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toContain('CSRF token');
  });

  it('should accept POST with valid CSRF token', async () => {
    // Get CSRF token
    const getResponse = await request(app).get('/api/csrf-token');
    const csrfToken = getResponse.body.csrfToken;

    // Use CSRF token
    const postResponse = await request(app)
      .post('/api/profile')
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'Test' });
    
    expect(postResponse.status).not.toBe(403);
  });
});
```

---

### Step 4.2: Create Soft Delete Tests

**File**: `backend/src/routes/__tests__/softDelete.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { softDelete, restoreRecord, isDeleted } from '../../middleware/softDelete';

describe('Soft Delete', () => {
  it('should soft delete a record', async () => {
    const { data, error } = await softDelete('messages', 'test-id');
    
    expect(error).toBeNull();
    expect(data.deleted_at).toBeDefined();
  });

  it('should restore a soft-deleted record', async () => {
    await softDelete('messages', 'test-id');
    const { data } = await restoreRecord('messages', 'test-id');
    
    expect(data.deleted_at).toBeNull();
  });

  it('should filter out deleted records in queries', async () => {
    // Create and delete a message
    await softDelete('messages', 'test-id');
    
    // Query should not return deleted message
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('id', 'test-id')
      .is('deleted_at', null);
    
    expect(data).toHaveLength(0);
  });
});
```

---

### Step 4.3: Create Circuit Breaker Tests

**File**: `backend/src/services/__tests__/circuitBreaker.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { CircuitBreaker } from '../circuitBreaker';

describe('Circuit Breaker', () => {
  it('should start in CLOSED state', () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000,
      monitoringWindow: 5000
    });
    
    expect(breaker.getState().state).toBe('CLOSED');
  });

  it('should open after threshold failures', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeout: 1000,
      monitoringWindow: 5000
    });
    
    // Fail twice
    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(() => Promise.reject(new Error('Test')));
      } catch (e) {
        // Expected
      }
    }
    
    expect(breaker.getState().state).toBe('OPEN');
  });

  it('should transition to HALF_OPEN after reset timeout', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeout: 100,
      monitoringWindow: 5000
    });
    
    // Fail once
    try {
      await breaker.execute(() => Promise.reject(new Error('Test')));
    } catch (e) {
      // Expected
    }
    
    // Wait for reset timeout
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(breaker.getState().state).toBe('HALF_OPEN');
  });
});
```

---

### Step 4.4: Run All Tests

```bash
# Run backend tests
npm test --prefix backend

# Run frontend tests
npm test

# Check coverage
npm test -- --coverage
```

---

## PHASE 5: DEPLOYMENT (1 hour)

### Step 5.1: Deploy to Staging

```bash
# Build frontend
npm run build

# Build backend
npm run build --prefix backend

# Deploy to staging
# (Use your deployment tool: Vercel, Railway, etc.)
```

---

### Step 5.2: Run Smoke Tests

```bash
# Test CSRF protection
curl -X POST https://staging.api.example.com/api/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
# Should return: 403 Forbidden

# Test correlation IDs
curl -X GET https://staging.api.example.com/api/profiles \
  -H "Authorization: Bearer <token>"
# Check response headers for X-Correlation-ID

# Test API versioning
curl -X GET https://staging.api.example.com/api/profiles \
  -H "X-API-Version: v1"
# Should work

# Test circuit breaker
curl -X GET https://staging.api.example.com/api/health/circuit-breakers
# Should show all services CLOSED
```

---

### Step 5.3: Deploy to Production

```bash
# After staging tests pass
# Deploy to production
# (Use your deployment tool)
```

---

### Step 5.4: Monitor for 24 Hours

```bash
# Check logs for errors
# Monitor circuit breaker status
# Monitor rate limiting
# Monitor CSRF rejections
# Monitor soft delete operations
```

---

## ✅ VERIFICATION CHECKLIST

### After Phase 1 (Middleware)
- [ ] CSRF middleware active (test with curl)
- [ ] Request logger active (check logs for correlation IDs)
- [ ] API versioning active (test with version header)
- [ ] No errors in server logs

### After Phase 2 (Database & Soft Delete)
- [ ] Database migration applied successfully
- [ ] Soft delete middleware active on all routes
- [ ] All queries filter deleted records
- [ ] Delete endpoints use soft delete
- [ ] Deleted records not visible in queries

### After Phase 3 (Payment Protection)
- [ ] Razorpay calls wrapped with circuit breaker
- [ ] Circuit breaker monitoring endpoint working
- [ ] Circuit breaker status shows all services CLOSED

### After Phase 4 (Testing)
- [ ] All tests passing
- [ ] Test coverage >80%
- [ ] No critical test failures

### After Phase 5 (Deployment)
- [ ] Staging deployment successful
- [ ] All smoke tests passing
- [ ] Production deployment successful
- [ ] No errors in production logs
- [ ] All systems healthy

---

## 🚨 ROLLBACK PLAN

If anything goes wrong:

```bash
# Revert middleware changes
git revert <commit-hash>

# Revert database migration
# (Restore from backup or run rollback migration)

# Redeploy previous version
git checkout <previous-tag>
npm run build
# Deploy
```

---

## 📞 SUPPORT

If you encounter issues:

1. Check logs for correlation IDs
2. Review error messages
3. Check circuit breaker status
4. Verify database migration applied
5. Run tests to identify failures

---

**Total Time**: 6-9 hours  
**Difficulty**: Medium  
**Risk**: Low  
**Confidence**: 95%

**You're ready to go!** 🚀

