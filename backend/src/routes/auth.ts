import express, { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.VITE_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * @route POST /api/auth/register
 * @desc Register a new user and create a profile
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login a user
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

export default router;
