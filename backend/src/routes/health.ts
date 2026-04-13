/**
 * Enhanced health check endpoints for monitoring
 */

import express from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

/**
 * Basic health check
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Detailed health check with dependency checks
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const checks = {
    server: 'ok',
    database: 'checking',
    supabase: 'checking',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  };

  // Check database connection
  try {
    const { error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    checks.database = dbError ? 'error' : 'ok';
  } catch (error) {
    checks.database = 'error';
  }

  // Check Supabase auth
  try {
    await supabase.auth.getSession();
    checks.supabase = 'ok';
  } catch (error) {
    checks.supabase = 'error';
  }

  const isHealthy = checks.database === 'ok' && checks.supabase === 'ok';
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    healthy: isHealthy,
    checks
  });
}));

/**
 * Readiness probe for Kubernetes/Railway
 */
router.get('/ready', asyncHandler(async (req, res) => {
  try {
    // Check if database is accessible
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      return res.status(503).json({
        ready: false,
        reason: 'Database not accessible'
      });
    }

    res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      reason: 'Service not ready'
    });
  }
}));

/**
 * Liveness probe for Kubernetes/Railway
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
