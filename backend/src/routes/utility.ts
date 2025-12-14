import express from 'express';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Version info
router.get('/version', (req, res) => {
  res.json({ version: '1.0.0', environment: process.env.NODE_ENV });
});

export default router;
