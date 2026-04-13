import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../utils/asyncHandler';
import { authLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

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

  if (data.user) {
    try {
      // Create an initial profile record for the new user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || '',
          display_name: name,
          email: email,
          role: 'user', // Default role
          account_status: 'active',
          profile_completion: 10 // Basic progress for name/email
        });

      if (profileError) {
        // If profile creation fails, we should ideally rollback the Auth user
        // But since Supabase doesn't support distributed transactions easily here,
        // we'll log it and let the user try to 'complete' their profile later or cleanup
        console.error('Profile creation failed for user:', data.user.id, profileError);
        // Optionally: delete the auth user to allow retry
        await supabase.auth.admin.deleteUser(data.user.id);
        return res.status(500).json({ success: false, error: 'Failed to create user profile. Please try again.' });
      }
    } catch (err) {
      console.error('Unexpected error during profile creation:', err);
      return res.status(500).json({ success: false, error: 'An unexpected error occurred. Please try again.' });
    }
  }
  
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
