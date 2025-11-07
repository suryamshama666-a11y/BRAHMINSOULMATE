import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const code = err?.code || (status >= 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const message = err?.message || 'Unexpected error';

  // Minimal logging; in production hook to logger provider
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
  }

  res.status(status).json({ success: false, error: message, code });
}

