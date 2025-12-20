import express from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Get profile
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  res.json({ success: true, profile: data });
}));

// Update profile
router.put('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const updates = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  res.json({ success: true, profile: data });
}));

// Search profiles
router.get('/search/all', asyncHandler(async (req, res) => {
  const { gender, min_age, max_age, city, religion, limit } = req.query;
  
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('caste', 'Brahmin'); // Strictly Brahmin-only platform

  if (gender) query = query.eq('gender', gender);
  
  // Enforce legal age limits even if not specified
  const effectiveMinAge = min_age 
    ? Math.max(Number(min_age), (gender === 'female' ? 18 : 21))
    : (gender === 'female' ? 18 : 21);

  query = query.gte('age', effectiveMinAge);
  if (max_age) query = query.lte('age', max_age);
  if (city) query = query.ilike('location->city', `%${city}%`);
  if (religion) query = query.eq('religion', religion);

  const { data: profiles, error } = await query.limit(Number(limit) || 20);

  if (error) throw error;
  
  res.json({ success: true, profiles });
}));

export default router;
