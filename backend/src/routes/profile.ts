import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, profile: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update profile
router.put('/', authMiddleware, async (req, res) => {
  try {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search profiles
  router.get('/search/all', async (req, res) => {
    try {
      const { gender, min_age, max_age, city, religion, caste, viewerId, limit } = req.query;
      
      let query = supabase
        .from('profiles')
        .select('*');
  
      if (gender) query = query.eq('gender', gender);
      if (min_age) query = query.gte('age', min_age);
      if (max_age) query = query.lte('age', max_age);
      if (city) query = query.ilike('location->city', `%${city}%`);
      if (religion) query = query.eq('religion', religion);
      if (caste) query = query.eq('caste', caste);
  
      const { data: profiles, error } = await query.limit(Number(limit) || 20);

    if (error) throw error;

    // If viewerId is provided, we could calculate compatibility here
    // but for simplicity and performance, we'll let the frontend handle it per card
    // or just return the profiles
    
    res.json({ success: true, profiles });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
