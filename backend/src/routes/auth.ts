import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { authLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user and create a profile
 */
router.post('/register', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const validation = registerSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      success: false, 
      error: validation.error.errors[0].message 
    });
  }

  const { email, password, name } = validation.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) throw error;

  if (error) throw error;

  // Note: Profile creation is handled automatically and securely by the robust
  // `handle_new_user` database trigger running on `auth.users` insert.
  
  
  res.status(201).json({ 
    success: true, 
    message: 'Registration successful. Please check your email for verification.',
    user: data.user 
  });
}));

/**
 * @route POST /api/auth/login
 * @desc Login a user
 */
router.post('/login', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      success: false, 
      error: validation.error.errors[0].message 
    });
  }

  const { email, password } = validation.data;

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
