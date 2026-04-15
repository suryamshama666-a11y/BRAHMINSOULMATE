/**
 * Request Logger Middleware
 * Adds correlation IDs to all requests for tracking and debugging
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface LoggedRequest extends Request {
  correlationId?: string;
  startTime?: number;
}

/**
 * Generate a unique correlation ID for request tracking
 */
function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Request logger middleware
 * - Adds correlation ID to each request
 * - Logs request details
 * - Measures request duration
 */
export function requestLogger(req: LoggedRequest, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const correlationId = req.headers['x-correlation-id'] as string || generateCorrelationId();
  
  // Attach correlation ID to request
  req.correlationId = correlationId;
  req.startTime = startTime;

  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  // Log request start
  logger.info(`[Request] ${req.method} ${req.originalUrl} - Correlation ID: ${correlationId} - IP: ${req.ip}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    
    // Log with appropriate level based on status code
    if (status >= 500) {
      logger.error(`[Request] ${req.method} ${req.originalUrl} - ${status} - ${duration}ms - Correlation ID: ${correlationId}`);
    } else if (status >= 400) {
      logger.warn(`[Request] ${req.method} ${req.originalUrl} - ${status} - ${duration}ms - Correlation ID: ${correlationId}`);
    } else {
      logger.info(`[Request] ${req.method} ${req.originalUrl} - ${status} - ${duration}ms - Correlation ID: ${correlationId}`);
    }
  });

  next();
}

/**
 * Get correlation ID from request
 */
export function getCorrelationId(req: LoggedRequest): string | undefined {
  return req.correlationId;
}

/**
 * Structured logger for consistent logging format
 */
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  correlationId?: string;
  message: string;
  meta?: Record<string, unknown>;
}

export function structuredLog(entry: LogEntry): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: entry.level,
    correlationId: entry.correlationId,
    message: entry.message,
    ...entry.meta
  };

  switch (entry.level) {
    case 'error':
      logger.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      logger.warn(JSON.stringify(logEntry));
      break;
    default:
      logger.info(JSON.stringify(logEntry));
  }
}