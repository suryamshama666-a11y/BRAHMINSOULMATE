# Code Deduplication Implementation Plan

## Overview
This document provides detailed implementation steps for consolidating duplicate code identified in the assessment.

---

## PHASE 1: FOUNDATION (Low Risk - 5.5 hours)

### 1.1 Create Shared Logger

**File:** `shared/utils/logger.ts`

**Current State:**
- Frontend: `src/utils/logger.ts` (1,629 chars) - logs to database + console
- Backend: `backend/src/utils/logger.ts` (2,020 chars) - console only

**Implementation:**
```typescript
// shared/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private isNode = typeof window === 'undefined';

  private formatLog(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };
  }

  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m',
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m',
      };

      const color = this.isNode ? colors[entry.level] : '';
      const reset = this.isNode ? colors.reset : '';
      const prefix = `${color}[${entry.level.toUpperCase()}]${reset}`;
      
      if (entry.data) {
        console.log(`${prefix} ${entry.message}`, entry.data);
      } else {
        console.log(`${prefix} ${entry.message}`);
      }
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.output(this.formatLog('debug', message, data));
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.output(this.formatLog('info', message, data));
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.output(this.formatLog('warn', message, data));
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.output(this.formatLog('error', message, data));
  }

  log(message: string, data?: Record<string, unknown>): void {
    this.info(message, data);
  }
}

export const logger = new Logger();
```

**Migration Steps:**
1. Create `shared/utils/logger.ts`
2. Update `src/utils/logger.ts` to re-export from shared
3. Update `backend/src/utils/logger.ts` to re-export from shared
4. Verify all imports still work
5. Remove duplicate implementations

**Testing:**
- Unit tests for all log levels
- Test in both Node.js and browser environments
- Verify JSON output in production

**Effort:** 1.5 hours

---

### 1.2 Create Shared Validation

**File:** `shared/utils/validation.ts`

**Current State:**
- Frontend: `src/utils/validation.ts` (3,191 chars) - Zod schemas + validators
- Frontend: `src/utils/inputSanitizer.ts` (2,764 chars) - sanitization functions
- Backend: `backend/src/middleware/validation.ts` (938 chars) - Joi schemas

**Implementation:**
```typescript
// shared/utils/validation.ts
import { z } from 'zod';

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

export function isValidUUID(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}

// Email validation
export const emailSchema = z.string().email('Invalid email format');

export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

// Phone validation
export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{9,14}$/,
  'Invalid phone number format'
);

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return phoneSchema.safeParse(cleaned).success;
}

// Password validation
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Analytics field validation
const ALLOWED_ANALYTICS_FIELDS = [
  'messages_sent',
  'interests_sent',
  'profile_views',
  'searches_performed',
  'logins',
  'profile_updates',
] as const;

export function isValidAnalyticsField(field: string): field is typeof ALLOWED_ANALYTICS_FIELDS[number] {
  return ALLOWED_ANALYTICS_FIELDS.includes(field as any);
}

// User ID validation
export function validateUserId(userId: string): string {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }
  return userId;
}

// Analytics parameters validation
export function validateAnalyticsParams(userId: string, field: string): { userId: string; field: string } {
  const validatedUserId = validateUserId(userId);
  
  if (!isValidAnalyticsField(field)) {
    throw new Error(`Invalid analytics field: ${field}`);
  }
  
  return { userId: validatedUserId, field };
}

// Payment plan validation
export const paymentPlanSchema = z.object({
  planId: z.enum(['basic', 'premium', 'elite']),
});

export const paymentVerificationSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  planId: z.enum(['basic', 'premium', 'elite']),
});

export default {
  isValidUUID,
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidAnalyticsField,
  validateUserId,
  validateAnalyticsParams,
  uuidSchema,
  emailSchema,
  phoneSchema,
  paymentPlanSchema,
  paymentVerificationSchema,
};
```

**Migration Steps:**
1. Create `shared/utils/validation.ts`
2. Update `src/utils/validation.ts` to re-export from shared
3. Update `backend/src/middleware/validation.ts` to use shared schemas
4. Verify all imports still work

**Testing:**
- Unit tests for all validators
- Test edge cases (international formats, etc.)
- Test in both Node.js and browser

**Effort:** 2 hours

---

### 1.3 Create Shared Sanitizer

**File:** `shared/utils/sanitizer.ts`

**Current State:**
- Frontend: `src/utils/inputSanitizer.ts` (2,764 chars)
- Backend: `backend/src/middleware/sanitize.ts` (1,508 chars)

**Implementation:**
```typescript
// shared/utils/sanitizer.ts

export const sanitizer = {
  /**
   * Remove emojis from text
   */
  removeEmojis: (text: string): string => {
    if (!text) return '';
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  },

  /**
   * Sanitize phone number - only digits, +, -, spaces, parentheses
   */
  phoneNumber: (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/[^\d+\-\s()]/g, '').trim();
  },

  /**
   * Sanitize email
   */
  email: (email: string): string => {
    if (!email) return '';
    return email.toLowerCase().trim().replace(/[^\w@.\-+]/g, '');
  },

  /**
   * Sanitize name - allow unicode letters but no emojis or special chars
   */
  name: (name: string): string => {
    if (!name) return '';
    let cleaned = name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    cleaned = cleaned.replace(/[^\p{L}\s\-']/gu, '');
    return cleaned.trim();
  },

  /**
   * General text sanitization - remove dangerous characters
   */
  text: (text: string): string => {
    if (!text) return '';
    return text.replace(/[\x00-\x1F\x7F]/g, '').trim();
  },

  /**
   * URL validation and sanitization
   */
  url: (url: string): string => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  },

  /**
   * Sanitize search query - remove SQL/NoSQL injection characters
   */
  searchQuery: (query: string): string => {
    if (!query) return '';
    return query.replace(/[;'"\\<>{}]/g, '').trim();
  },

  /**
   * Validate and sanitize age
   */
  age: (age: number | string): number => {
    const numAge = typeof age === 'string' ? parseInt(age, 10) : age;
    if (isNaN(numAge) || numAge < 18 || numAge > 120) {
      return 18;
    }
    return numAge;
  },

  /**
   * Sanitize input (remove potential XSS)
   */
  input: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '')
      .trim();
  },

  /**
   * Sanitize string - remove dangerous protocols and event handlers
   */
  string: (input: string): string => {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },

  /**
   * Recursively sanitize object to prevent XSS
   */
  object: (obj: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizer.value(obj[key]);
    }
    return sanitized;
  },

  /**
   * Sanitize any value recursively
   */
  value: (value: unknown): unknown => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/<\/?(?:script|iframe|object|embed|form)\b[^>]*>/gi, '');
    }
    if (Array.isArray(value)) {
      return value.map(v => sanitizer.value(v));
    }
    if (value !== null && typeof value === 'object') {
      return sanitizer.object(value as Record<string, unknown>);
    }
    return value;
  },
};

export default sanitizer;
```

**Migration Steps:**
1. Create `shared/utils/sanitizer.ts`
2. Update `src/utils/inputSanitizer.ts` to re-export from shared
3. Update `backend/src/middleware/sanitize.ts` to use shared sanitizer
4. Verify all imports still work

**Testing:**
- Unit tests for all sanitization functions
- Test XSS prevention
- Test edge cases

**Effort:** 1.5 hours

---

## PHASE 2: SERVICES (Medium Risk - 3.5 hours)

### 2.1 Create BaseService

**File:** `src/services/api/BaseService.ts`

**Purpose:** Extract common patterns from all API services

**Implementation:**
```typescript
// src/services/api/BaseService.ts
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export class BaseService {
  protected async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    return user;
  }

  protected handleError(error: any, context: string): never {
    logger.error(`${context}:`, error);
    throw error;
  }

  protected async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, context);
    }
  }
}
```

**Migration Steps:**
1. Create `src/services/api/BaseService.ts`
2. Update all API services to extend BaseService
3. Replace duplicate auth checks with `this.getCurrentUser()`
4. Replace duplicate error handling with `this.handleError()`
5. Verify all imports still work

**Services to Update:**
- `src/services/api/interests.service.ts`
- `src/services/api/messages.service.ts`
- `src/services/api/forum.service.ts`
- `src/services/api/events.service.ts`
- `src/services/api/horoscope.service.ts`
- `src/services/api/blog.service.ts`
- `src/services/api/auth.service.ts`

**Testing:**
- Unit tests for BaseService
- Verify all API services still work
- Test error handling

**Effort:** 1.5 hours

---

### 2.2 Consolidate Error Handling

**File:** `shared/types/errors.ts` and `shared/utils/errorHandler.ts`

**Current State:**
- Frontend: `src/services/api/base.ts` - ErrorCode enum, APIError class, retry logic
- Backend: `backend/src/middleware/errorHandler.ts` - error middleware

**Implementation:**
```typescript
// shared/types/errors.ts
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class APIError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
}
```

```typescript
// shared/utils/errorHandler.ts
import { ErrorCode, APIError } from '../types/errors';

export const handleAPIError = (error: any): APIError => {
  // Supabase specific errors
  if (error.code === 'PGRST116') {
    return new APIError(
      ErrorCode.NOT_FOUND,
      'Resource not found',
      404,
      error
    );
  }

  if (error.code === 'PGRST301') {
    return new APIError(
      ErrorCode.PERMISSION_DENIED,
      'Permission denied',
      403,
      error
    );
  }

  if (error.message?.includes('JWT') || error.message?.includes('token')) {
    return new APIError(
      ErrorCode.AUTH_ERROR,
      'Authentication failed. Please login again.',
      401,
      error
    );
  }

  if (error.code?.startsWith('23')) {
    return new APIError(
      ErrorCode.DATABASE_ERROR,
      'Database operation failed',
      500,
      error
    );
  }

  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return new APIError(
      ErrorCode.NETWORK_ERROR,
      'Network error. Please check your connection.',
      503,
      error
    );
  }

  return new APIError(
    ErrorCode.UNKNOWN_ERROR,
    error.message || 'An unexpected error occurred',
    500,
    error
  );
};

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}
```

**Migration Steps:**
1. Create `shared/types/errors.ts`
2. Create `shared/utils/errorHandler.ts`
3. Update `src/services/api/base.ts` to import from shared
4. Update `backend/src/middleware/errorHandler.ts` to use shared types
5. Verify all imports still work

**Testing:**
- Unit tests for error handling
- Test retry logic
- Test all error codes

**Effort:** 2 hours

---

## PHASE 3: BUSINESS LOGIC (Higher Risk - 10-12 hours)

### 3.1 Consolidate Matching Services

**Current State:**
- `src/services/matchingService.ts` - interest management + simple compatibility
- `src/services/api/matching.service.ts` - detailed compatibility calculation
- `src/services/api/matching-backend.service.ts` - backend API proxy

**Issues:**
- Two different compatibility algorithms
- Duplicate interest management
- Unclear which service to use

**Implementation Strategy:**
1. Create backend matching service (if not exists)
2. Move detailed compatibility calculation to backend
3. Frontend uses backend for all matching operations
4. Remove duplicate services

**Effort:** 4-6 hours (requires backend implementation)

---

### 3.2 Consolidate Notification Logic

**Current State:**
- Frontend: `src/services/notificationService.ts` - UI/UX
- Backend: `backend/src/services/smartNotifications.ts` - business logic

**Implementation Strategy:**
1. Create shared notification types
2. Create shared notification templates
3. Frontend respects backend preferences
4. Coordinate frequency capping

**Effort:** 3-4 hours

---

## TESTING STRATEGY

### Unit Tests
- Test all shared utilities in isolation
- Test error handling
- Test validation and sanitization

### Integration Tests
- Test API services with shared utilities
- Test error handling in context
- Test retry logic

### E2E Tests
- Test critical flows (matching, messaging, notifications)
- Test error scenarios
- Test in both development and production modes

---

## ROLLOUT STRATEGY

### Week 1: Phase 1 (Foundation)
- Consolidate logging
- Consolidate validation
- Consolidate sanitization
- Deploy to staging
- Monitor for issues

### Week 2: Phase 2 (Services)
- Create BaseService
- Consolidate error handling
- Update all API services
- Deploy to staging
- Monitor for issues

### Week 3-4: Phase 3 (Business Logic)
- Consolidate matching services
- Consolidate notification logic
- Deploy to staging
- Monitor for issues
- Deploy to production

---

## SUCCESS METRICS

### Code Quality
- ✅ Reduce duplicate code by 15-25%
- ✅ Increase code reuse by 30%
- ✅ Improve consistency across frontend/backend

### Maintainability
- ✅ Reduce time to fix bugs by 20%
- ✅ Reduce time to add features by 15%
- ✅ Improve code review efficiency

### Performance
- ✅ No performance degradation
- ✅ Potential improvement from optimized shared utilities

---

## RISK MITIGATION

### For Each Phase:
1. **Write tests first** - ensure behavior is preserved
2. **Create feature flag** - gradual rollout
3. **Keep old code** - parallel implementation during transition
4. **Monitor logs** - watch for errors in production
5. **Gradual migration** - update one consumer at a time

### Rollback Plan:
- Keep git history for easy rollback
- Tag releases before major changes
- Monitor error rates in production
- Have rollback procedure ready

---

## CONCLUSION

This implementation plan provides a structured approach to consolidating duplicate code while minimizing risk. Start with Phase 1 (low-risk consolidations) to build momentum, then proceed to higher-risk consolidations with proper testing and monitoring.
