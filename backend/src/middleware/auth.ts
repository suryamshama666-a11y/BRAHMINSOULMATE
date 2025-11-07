import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Basic JWT auth middleware (placeholder). Replace with your session strategy if different
export function authMiddleware(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.slice('Bearer '.length);
  const secret = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, error: 'Server auth misconfiguration' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    // Attach user for downstream routes
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

