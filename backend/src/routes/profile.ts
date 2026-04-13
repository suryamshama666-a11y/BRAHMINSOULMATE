import express from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { profileViewLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';
import { redis } from '../config/redis';

const router = express.Router();

// Validation schema for profile update
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/, 'Invalid phone number').optional(),
  location: z.string().max(255, 'Location is too long').optional(),
  city: z.string().max(100, 'City name is too long').optional(),
  state: z.string().max(100, 'State name is too long').optional(),
  education: z.string().max(255, 'Education is too long').optional(),
  profession: z.string().max(255, 'Profession is too long').optional(),
  occupation: z.string().max(255, 'Occupation is too long').optional(),
  height: z.number().min(100, 'Height must be at least 100cm').max(250, 'Height cannot exceed 250cm').optional(),
  religion: z.string().max(50, 'Religion is too long').optional(),
  caste: z.string().max(50, 'Caste is too long').optional(),
  gotra: z.string().max(50, 'Gotra is too long').optional(),
  bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  profile_picture: z.string().url('Invalid profile picture URL').max(500, 'URL is too long').optional(),
  age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Invalid age').optional(),
  gender: z.enum(['male', 'female'], { errorMap: () => ({ message: 'Gender must be male or female' }) }).optional(),
  marital_status: z.enum(['never_married', 'divorced', 'widowed'], { errorMap: () => ({ message: 'Invalid marital status' }) }).optional(),
});

// Validation schema for search
const searchSchema = z.object({
  gender: z.enum(['male', 'female']).optional(),
  min_age: z.coerce.number().min(18).max(120).optional(),
  max_age: z.coerce.number().min(18).max(120).optional(),
  city: z.string().max(100).optional(),
  religion: z.string().max(50).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

/**
 * Sanitize string input to prevent injection attacks
 * Escapes special characters used in LIKE queries
 */
function sanitizeLikeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  // Escape special LIKE characters: %, _, \
  return input.replace(/[%_\\]/g, '\\$&');
}

// Get own profile - Returns full data
router.get('/me', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    throw error;
  }
  
  res.json({ success: true, profile: data });
}));

// Get profile - with rate limiting and field restriction
router.get('/:id', profileViewLimiter, authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;
  
  // Validate UUID format to prevent injection
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid profile ID format' 
    });
  }

  // Check if requesting own profile
  const { data: profileCheck, error: checkError } = await supabase
    .from('profiles')
    .select('user_id, role')
    .eq('id', id)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    throw checkError;
  }

  const isOwner = profileCheck.user_id === currentUserId;
  const isAdmin = req.user?.role === 'admin';

  // If owner or admin, return all fields. Otherwise, restrict to public fields.
  const selectFields = (isOwner || isAdmin) ? '*' : `
    id, first_name, last_name, display_name, age, gender, height, weight,
    marital_status, religion, caste, subcaste, gotra, mother_tongue, languages_known,
    education_level, education_details, occupation, company_name, annual_income,
    family_type, siblings, family_location, rashi, nakshatra, manglik,
    about_me, partner_preferences, hobbies, profile_visibility, verified,
    subscription_type, profile_picture_url, gallery_images, created_at, updated_at,
    last_active, profile_completion_percentage, verification_status
  `;

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select(selectFields)
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;
  
  res.json({ success: true, profile });
}));

// Update profile - with validation
router.put('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'User not authenticated' 
    });
  }

  // Validate input
  const validation = updateProfileSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      success: false, 
      error: validation.error.errors[0].message,
      details: validation.error.errors
    });
  }

  const updates = validation.data;

  // Filter out undefined values
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );

  if (Object.keys(filteredUpdates).length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'No valid fields to update' 
    });
  }

  // Add updated_at timestamp
  filteredUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .update(filteredUpdates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ 
        success: false, 
        error: 'Profile not found' 
      });
    }
    throw error;
  }

  // Invalidate recommendation cache on profile update
  if (redis) {
    try {
      const cachePrefix = `user_rec:${userId}:*`;
      const keys = await redis.keys(cachePrefix);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[Cache] Invalidated ${keys.length} recommendation keys for user ${userId}`);
      }
    } catch (cacheErr) {
      console.error('[Redis Cache Invalidation Error]:', cacheErr);
    }
  }
  
  res.json({ success: true, profile: data });
}));

// Search profiles - with authorization, validation and sanitized inputs
router.get('/search/all', authMiddleware, profileViewLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // Validate query parameters
  const validation = searchSchema.safeParse(req.query);
  
  if (!validation.success) {
    return res.status(400).json({ 
      success: false, 
      error: validation.error.errors[0].message 
    });
  }

  const { gender, min_age, max_age, city, religion, limit = 20 } = validation.data;
  
  let query = supabase
    .from('profiles')
    .select(`
      id, first_name, last_name, display_name, age, gender, height, weight,
      marital_status, religion, caste, subcaste, gotra, mother_tongue, languages_known,
      education_level, education_details, occupation, company_name, annual_income,
      family_type, siblings, family_location, rashi, nakshatra, manglik,
      about_me, partner_preferences, hobbies, profile_visibility, verified,
      subscription_type, profile_picture_url, gallery_images, created_at, updated_at,
      last_active, profile_completion_percentage, verification_status
    `)
    .eq('caste', 'Brahmin'); // Strictly Brahmin-only platform

  if (gender) query = query.eq('gender', gender);
  
  // Enforce legal age limits even if not specified
  const effectiveMinAge = min_age 
    ? Math.max(min_age, (gender === 'female' ? 18 : 21))
    : (gender === 'female' ? 18 : 21);

  query = query.gte('age', effectiveMinAge);
  if (max_age) query = query.lte('age', max_age);
  
  // Sanitize city input to prevent injection
  if (city) {
    const sanitizedCity = sanitizeLikeInput(city);
    query = query.ilike('location->city', `%${sanitizedCity}%`);
  }
  
  if (religion) {
    const sanitizedReligion = sanitizeLikeInput(religion);
    query = query.eq('religion', sanitizedReligion);
  }

  const { data: profiles, error } = await query.limit(limit);

  if (error) throw error;
  
  res.json({ success: true, profiles, count: profiles?.length || 0 });
}));

export default router;
