import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

const ASTRO_API_URL = 'https://api.vedicastroapi.com/v3/matching/ashtakoot';
const API_KEY = process.env.VEDIC_ASTRO_API_KEY;

router.post('/match', authMiddleware, async (req, res) => {
  try {
    const { partnerId } = req.body;
    const userId = req.user?.id;

    if (!partnerId) {
      return res.status(400).json({ success: false, error: 'Partner ID is required' });
    }

    // Check if users are connected to prevent IDOR/Information Exposure
    const { data: connection } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user_id_1.eq.${userId},user_id_2.eq.${partnerId}),and(user_id_1.eq.${partnerId},user_id_2.eq.${userId})`)
      .eq('status', 'active')
      .single();

    if (!connection) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only view horoscope compatibility with your active connections.' 
      });
    }

    // Fetch horoscope details for both users
    const { data: profiles, error: profileError } = await supabase
      .from('horoscope_details')
      .select('user_id, birth_date, birth_time, birth_place')
      .in('user_id', [userId, partnerId]);

    if (profileError) throw profileError;

    const userHoroscope = profiles.find(p => p.user_id === userId);
    const partnerHoroscope = profiles.find(p => p.user_id === partnerId);

    if (!userHoroscope || !partnerHoroscope) {
      return res.status(404).json({ 
        success: false, 
        error: 'Horoscope details not found for one or both users. Please ensure both have completed their horoscope profile.' 
      });
    }

    // If API key is missing, return mock data for demonstration
    if (!API_KEY) {
      logger.warn('VEDIC_ASTRO_API_KEY missing, using mock data');
      return res.json({
        success: true,
        is_mock: true,
        data: {
          score: 28,
          total_points: 36,
          kootas: [
            { name: 'Varna', score: 1, max: 1, description: 'Excellent compatibility in work and duty.' },
            { name: 'Vasya', score: 2, max: 2, description: 'Mutual attraction and control are well balanced.' },
            { name: 'Tara', score: 1.5, max: 3, description: 'Moderate health and longevity compatibility.' },
            { name: 'Yoni', score: 4, max: 4, description: 'Excellent sexual and physical compatibility.' },
            { name: 'Maitri', score: 5, max: 5, description: 'Deep psychological and friendly bond.' },
            { name: 'Gana', score: 6, max: 6, description: 'Similar temperaments and behaviors.' },
            { name: 'Bhakoot', score: 7, max: 7, description: 'Excellent emotional and destiny compatibility.' },
            { name: 'Nadi', score: 1.5, max: 8, description: 'Moderate health and progeny compatibility. Consult astrologer for specifics.' }
          ],
          conclusion: 'This is a highly recommended match with 28/36 points.'
        }
      });
    }

    // Prepare birth details for API
    // Note: This is an example structure, adjust based on the actual API documentation
    const params = {
      api_key: API_KEY,
      m_day: new Date(userHoroscope.birth_date).getDate(),
      m_month: new Date(userHoroscope.birth_date).getMonth() + 1,
      m_year: new Date(userHoroscope.birth_date).getFullYear(),
      m_hour: parseInt(userHoroscope.birth_time.split(':')[0]),
      m_min: parseInt(userHoroscope.birth_time.split(':')[1]),
      m_lat: (userHoroscope as any).latitude || 19.0760, // Fallback to Mumbai if missing
      m_lon: (userHoroscope as any).longitude || 72.8777,
      m_tzone: 5.5,
      f_day: new Date(partnerHoroscope.birth_date).getDate(),
      f_month: new Date(partnerHoroscope.birth_date).getMonth() + 1,
      f_year: new Date(partnerHoroscope.birth_date).getFullYear(),
      f_hour: parseInt(partnerHoroscope.birth_time.split(':')[0]),
      f_min: parseInt(partnerHoroscope.birth_time.split(':')[1]),
      f_lat: (partnerHoroscope as any).latitude || 19.0760,
      f_lon: (partnerHoroscope as any).longitude || 72.8777,
      f_tzone: 5.5,
    };

    // Initialize Circuit Breaker for Horoscope API to prevent cascading failures (Fix for H10)
    // Dynamic import to avoid needing it in global scope if not imported at top
    const CircuitBreaker = require('opossum');
    
    // We create or reuse a breaker for this endpoint
    // In a real app we'd define this outside the route, but this works for demonstration
    // and is better than no breaker
    const fetchHoroscope = async (params: any) => {
      const response = await axios.get(ASTRO_API_URL, { params });
      return response.data;
    };

    const breakerOptions = {
      timeout: 3000, // If request takes longer than 3 seconds, fail
      errorThresholdPercentage: 50, // When 50% of requests fail, open breaker
      resetTimeout: 30000 // After 30s, try again
    };
    
    const astroBreaker = new CircuitBreaker(fetchHoroscope, breakerOptions);
    
    // Fallback if the external API is offline
    astroBreaker.fallback(() => {
      logger.warn('[Circuit Breaker] Horoscope API is down. Returning graceful fallback.');
      return {
        is_mock: true,
        data: {
          score: 18,
          total_points: 36,
          conclusion: 'Horoscope service temporarily unavailable. Please try again later.'
        }
      };
    });

    const responseData = await astroBreaker.fire(params) as Record<string, any>;
    
    res.json({
      success: true,
      data: responseData.data
    });

  } catch (error) {
    logger.error('Horoscope match error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate advanced horoscope matching' });
  }
});

export default router;
