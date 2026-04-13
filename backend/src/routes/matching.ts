import express from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { interestLimiter } from '../middleware/rateLimiter';
import { redis } from '../config/redis';
import * as Sentry from '@sentry/node';

const router = express.Router();

// Profile type for matching
interface MatchProfile {
  id: string;
  age?: number;
  height?: number;
  city?: string;
  state?: string;
  country?: string;
  education_level?: number;
  gotra?: string;
  rashi?: string;
  gender?: string;
}

// Calculate compatibility score (0-100)
function calculateCompatibility(profile1: MatchProfile, profile2: MatchProfile): number {
  let score = 0;
  let totalPossible = 0;

  // Age compatibility (25 points)
  const ageDiff = Math.abs((profile1.age || 0) - (profile2.age || 0));
  if (ageDiff <= 2) score += 25;
  else if (ageDiff <= 5) score += 20;
  else if (ageDiff <= 10) score += 15;
  else score += 5;
  totalPossible += 25;

  // Height compatibility (15 points)
  const heightDiff = Math.abs((profile1.height || 0) - (profile2.height || 0));
  if (heightDiff <= 5) score += 15;
  else if (heightDiff <= 10) score += 10;
  else score += 5;
  totalPossible += 15;

  // Location compatibility (20 points)
  if (profile1.city === profile2.city) score += 20;
  else if (profile1.state === profile2.state) score += 15;
  else if (profile1.country === profile2.country) score += 10;
  else score += 5;
  totalPossible += 20;

  // Education compatibility (15 points)
  if (profile1.education_level && profile2.education_level) {
    if (profile1.education_level === profile2.education_level) score += 15;
    else if (Math.abs(profile1.education_level - profile2.education_level) <= 1) score += 10;
    else score += 5;
    totalPossible += 15;
  }

  // Gotra compatibility (10 points) - different gotra preferred
  if (profile1.gotra && profile2.gotra) {
    if (profile1.gotra !== profile2.gotra) score += 10;
    else score += 0;
    totalPossible += 10;
  }

  // Rashi compatibility (15 points)
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
    
    if (profile1.rashi === profile2.rashi) score += 10;
    else if (compatibleRashis[profile1.rashi]?.includes(profile2.rashi)) score += 15;
    else score += 5;
    totalPossible += 15;
  }

  return totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 50;
}

// Get recommended matches with Caching
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const cacheKey = `user_rec:${userId}:${limit}`;

    // 1. Try to get from Redis first
    if (redis) {
      try {
        const cachedMatch = await redis.get(cacheKey);
        if (cachedMatch) {
          return res.json({ 
            success: true, 
            matches: JSON.parse(cachedMatch), 
            from_cache: true 
          });
        }
      } catch (cacheErr) {
        console.error('[Redis Cache Error]:', cacheErr);
        Sentry.captureException(cacheErr);
        // Fall through to DB query
      }
    }

    // 2. Fetch User Profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) throw profileError;

    // 3. Fetch Candidates
    const targetGender = userProfile.gender === 'male' ? 'female' : 'male';
    let query = supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, display_name, age, height, city, state, country, education_level, gotra, rashi, gender, verified, profile_picture_url')
      .eq('gender', targetGender)
      .eq('verified', true)
      .is('deleted_at', null)
      .neq('user_id', userId);

    const prefs = userProfile.preferences as { ageMin?: number; ageMax?: number };
    if (prefs?.ageMin) query = query.gte('age', prefs.ageMin);
    if (prefs?.ageMax) query = query.lte('age', prefs.ageMax);

    const { data: profiles, error } = await query.limit(limit * 2);
    if (error) throw error;

    // 4. Compatibility Calc
    const matchesWithScores = profiles.map(profile => ({
      ...profile,
      compatibility_score: calculateCompatibility(userProfile as MatchProfile, profile as MatchProfile)
    }));

    const topMatches = matchesWithScores
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, limit);

    // 5. Store in Redis (TTL 30 mins)
    if (redis && topMatches.length > 0) {
      await redis.setex(cacheKey, 1800, JSON.stringify(topMatches));
    }

    res.json({ success: true, matches: topMatches, from_cache: false });
  } catch (error) {
    console.error('[Recommendations Error]:', error);
    Sentry.captureException(error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});


// Send interest
router.post('/interest/send', authMiddleware, interestLimiter, async (req, res) => {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
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
        receiver:profiles!interests_receiver_id_fkey(id, first_name, last_name, display_name, age, city, state, profile_picture_url, verified)
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, interests: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
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
        sender:profiles!interests_sender_id_fkey(id, first_name, last_name, display_name, age, city, state, profile_picture_url, verified)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, interests: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
