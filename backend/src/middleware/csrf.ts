/**
 * CSRF Protection Middleware
 * 
 * Strategy: For Bearer-token authenticated SPAs, CSRF risk is minimal because
 * Bearer tokens are not automatically sent by the browser (unlike cookies).
 * We use a lightweight custom-header check as defense-in-depth.
 * 
 * Webhooks and public endpoints are exempted via path allowlist.
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface CsrfRequest extends Request {
  csrfToken?: string;
}

// Paths that should be exempt from CSRF (webhooks, health checks)
const CSRF_EXEMPT_PATHS = [
  '/api/payments/webhook',
  '/health',
  '/ready',
  '/api/health',
  '/api/gdpr/request-deletion',
];

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF protection middleware
 * Uses custom-header validation: requires X-Requested-With header on mutations.
 * This is effective because custom headers cannot be set in cross-origin requests
 * without CORS preflight approval.
 */
export function csrfProtection(req: CsrfRequest, res: Response, next: NextFunction): void {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  // Skip for exempt paths (webhooks, etc.)
  const isExempt = CSRF_EXEMPT_PATHS.some(path => req.path.startsWith(path) || req.originalUrl.startsWith(path));
  if (isExempt) {
    next();
    return;
  }

  // Bearer-token auth + custom header check provides CSRF protection
  // The Authorization header already proves this isn't a simple cross-origin request
  const hasAuthHeader = !!req.headers.authorization;
  const hasCustomHeader = req.headers['x-requested-with'] === 'XMLHttpRequest' || !!req.headers['x-csrf-token'];

  if (hasAuthHeader || hasCustomHeader) {
    next();
    return;
  }

  // Block requests with neither Bearer token nor custom header
  logger.warn(`[CSRF] Blocked request without auth/custom header: ${req.method} ${req.path}`);
  res.status(403).json({
    success: false,
    error: 'Request blocked: missing authentication or CSRF token'
  });
}

/**
 * Middleware to set CSRF token cookie on GET requests only.
 * Token is only regenerated when no valid token exists.
 */
export function setCsrfToken(req: CsrfRequest, res: Response, next: NextFunction): void {
  // Only set token on GET requests (initial page loads / token refresh)
  if (req.method !== 'GET') {
    next();
    return;
  }

  // Don't regenerate if a valid token already exists
  if (req.cookies?.csrfToken) {
    next();
    return;
  }

  const token = generateCsrfToken();
  
  res.cookie('csrfToken', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.setHeader('X-CSRF-Token', token);
  next();
}

/**
 * Get CSRF token from request
 */
export function getCsrfToken(req: CsrfRequest): string | undefined {
  return req.cookies?.csrfToken;
}