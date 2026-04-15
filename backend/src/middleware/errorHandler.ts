import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  // Capture the error in Sentry (without PII from request body)
  if (statusCode >= 500) {
    Sentry.captureException(err, {
      extra: {
        url: req.originalUrl,
        method: req.method,
        correlationId: (req as any).correlationId,
        // SECURITY: Never send req.body to Sentry — may contain passwords, PII, payment data
        queryKeys: Object.keys(req.query || {}),
        paramKeys: Object.keys(req.params || {}),
      }
    });
  }

  // Log to console for local monitoring
  logger.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Mask sensitive messages in production
  let message = err.message || 'Internal Server Error';
  
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred. Please contact support if the issue persists.';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
};

