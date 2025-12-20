import express, { NextFunction, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user and create a profile
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) throw error;
  
  res.status(201).json({ 
    success: true, 
    message: 'Registration successful',
    user: data.user 
  });
}));

/**
 * @route POST /api/auth/login
 * @desc Login a user
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  
  res.json({ 
    success: true, 
    session: data.session 
  });
}));

export default router;
