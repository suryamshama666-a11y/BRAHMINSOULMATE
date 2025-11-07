import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../config/supabase';

const router = express.Router();

// Sign up new user
router.post('/signup', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { email, password, first_name, last_name, gender, date_of_birth } = req.body;

    if (!email || !password || !first_name || !gender) {
      return res.status(400).json({
        success: false,
        error: 'email, password, first_name, and gender are required'
      });
    }

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', email) // Using email as user_id for now
      .single();

    if (existingProfile) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: email, // Using email as user_id
        first_name,
        last_name,
        gender,
        date_of_birth,
        profile_visibility: 'public',
        // Store hashed password in a custom field (not ideal, but working with existing schema)
        about_me: `password:${hashedPassword}` // Temporary storage
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ success: false, error: 'JWT secret not configured' });
    }

    const token = jwt.sign(
      { id: profile.id, user_id: profile.user_id, email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { about_me, ...safeProfile } = profile;

    return res.json({
      success: true,
      token,
      user: safeProfile,
      message: 'Account created successfully'
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create account' });
  }
});

// Sign in user
router.post('/signin', async (req, res) => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email and password are required' });
    }

    // Find user
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', email)
      .single();

    if (error || !profile) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Extract password from about_me field (temporary solution)
    const aboutMe = profile.about_me || '';
    const passwordMatch = aboutMe.match(/^password:(.+)$/);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const hashedPassword = passwordMatch[1];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ success: false, error: 'JWT secret not configured' });
    }

    const token = jwt.sign(
      { id: profile.id, user_id: profile.user_id, email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { about_me, ...safeProfile } = profile;

    return res.json({
      success: true,
      token,
      user: safeProfile,
      message: 'Signed in successfully'
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    return res.status(500).json({ success: false, error: 'Failed to sign in' });
  }
});

// Sign out user
router.post('/signout', (_req, res) => {
  // For JWT-based auth, signout is handled client-side by removing the token
  return res.json({ success: true, message: 'Signed out successfully' });
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'token is required' });
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ success: false, error: 'JWT secret not configured' });
    }

    // Verify existing token
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Generate new token
    const newToken = jwt.sign(
      { id: decoded.id, user_id: decoded.user_id, email: decoded.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, token: newToken });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'email is required' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database not configured' });
    }

    // Check if user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name')
      .eq('user_id', email)
      .single();

    if (!profile) {
      // Don't reveal if user exists or not for security
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    // In a real implementation, you'd:
    // 1. Generate a secure reset token
    // 2. Store it in database with expiration
    // 3. Send email with reset link

    console.log(`Password reset requested for user: ${email}`);

    return res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent (placeholder)'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process reset request' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'token is required' });
    }

    // In a real implementation, you'd:
    // 1. Verify the token from database
    // 2. Mark email as verified
    // 3. Update user profile

    console.log(`Email verification requested with token: ${token}`);

    return res.json({
      success: true,
      message: 'Email verified successfully (placeholder)'
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify email' });
  }
});

export default router;

