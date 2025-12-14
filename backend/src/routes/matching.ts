import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Calculate compatibility score
function calculateCompatibility(profile1: any, profile2: any): number {
  let score = 0;
  let factors = 0;

  // Age compatibility (25 points)
  const ageDiff = Math.abs(profile1.age - profile2.age);
  if (ageDiff <= 2) score += 25;
  else if (ageDiff <= 5) score += 20;
  else if (ageDiff <= 10) score += 15;
  else score += 5;
  factors++;

  // Height compatibility (15 points)
  const heightDiff = Math.abs(profile1.height - profile2.height);
  if (heightDiff <= 5) score += 15;
  else if (heightDiff <= 10) score += 10;
  else score += 5;
  factors++;

  // Location compatibility (20 points)
  if (profile1.city === profile2.city) score += 20;
  else if (profile1.state === profile2.state) score += 15;
  else if (profile1.country === profile2.country) score += 10;
  factors++;

  // Education compatibility (15 points)
  if (profile1.education_level === profile2.education_level) score += 15;
  else if (Math.abs(profile1.education_level - profile2.education_level) <= 1) score += 10;
  factors++;

  // Gotra compatibility (10 points) - different gotra preferred
  if (profile1.gotra !== profile2.gotra) score += 10;
  factors++;

  // Horoscope compatibility (15 points)
  if (profile1.rashi && profile2.rashi) {
    const compatibleRashis: Record<string, string[]> = {
      'Aries': ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
      'Taurus': ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
      'Gemini': ['Libra', 'Aquarius', 'Aries', 'Leo'],
      'Cancer': ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
      'Leo': ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
      'Virgo': ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
      'Libra': ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
      'Scorpio': ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
      'Sagittarius': ['Aries', 'Leo', 'Libra', 'Aquarius'],
      'Capricorn': ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
      'Aquarius': ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
      'Pisces': ['Cancer', 'Scorpio', 'Taurus', 'Capricorn']
    };
    
    if (compatibleRashis[profile1.rashi]?.includes(profile2.rashi)) {
      score += 15;
    } else {
      score += 5;
    }
    factors++;
  }

  return Math.round(score / factors);
}

// Get recommended matches
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 20;

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get opposite gender profiles
    const targetGender = userProfile.gender === 'male' ? 'female' : 'male';
    
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('gender', targetGender)
      .eq('verified', true)
      .neq('id', userId);

    // Apply preference filters
    if (userProfile.preferences) {
      const prefs = userProfile.preferences as any;
      if (prefs.ageMin) query = query.gte('age', prefs.ageMin);
      if (prefs.ageMax) query = query.lte('age', prefs.ageMax);
      if (prefs.heightMin) query = query.gte('height', prefs.heightMin);
      if (prefs.heightMax) query = query.lte('height', prefs.heightMax);
    }

    const { data: profiles, error } = await query.limit(limit * 2);
    if (error) throw error;

    // Calculate compatibility scores
    const matchesWithScores = profiles.map(profile => ({
      ...profile,
      compatibility_score: calculateCompatibility(userProfile, profile)
    }));

    // Sort by compatibility and limit
    const topMatches = matchesWithScores
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, limit);

    res.json({ success: true, matches: topMatches });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send interest
router.post('/interest/send', authMiddleware, async (req, res) => {
  try {
    const senderId = req.user?.id;
    const { receiverId, message } = req.body;

    // Check if interest already exists
    const { data: existing } = await supabase
      .from('interests')
      .select('id')
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, error: 'Interest already sent' });
    }

    // Create interest
    const { data, error } = await supabase
      .from('interests')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        message: message || 'I would like to connect with you',
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification
    await supabase.from('notifications').insert({
      user_id: receiverId,
      type: 'interest_received',
      title: 'New Interest',
      message: 'Someone expressed interest in your profile',
      action_url: `/interests/received`,
      sender_id: senderId
    });

    res.json({ success: true, interest: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sent interests
router.get('/interests/sent', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('interests')
      .select(`
        *,
        receiver:profiles!interests_receiver_id_fkey(*)
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, interests: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get received interests
router.get('/interests/received', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('interests')
      .select(`
        *,
        sender:profiles!interests_sender_id_fkey(*)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, interests: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Accept/Decline interest
router.post('/interest/:id/respond', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    // Verify interest belongs to user
    const { data: interest, error: fetchError } = await supabase
      .from('interests')
      .select('*')
      .eq('id', id)
      .eq('receiver_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const status = action === 'accept' ? 'accepted' : 'declined';
    
    const { error } = await supabase
      .from('interests')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    // If accepted, create mutual connection
    if (action === 'accept') {
      await supabase.from('connections').insert({
        user_id_1: interest.sender_id,
        user_id_2: userId,
        status: 'active'
      });

      // Notify sender
      await supabase.from('notifications').insert({
        user_id: interest.sender_id,
        type: 'interest_accepted',
        title: 'Interest Accepted!',
        message: 'Your interest has been accepted. You can now message each other!',
        action_url: `/messages/${userId}`,
        sender_id: userId
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
