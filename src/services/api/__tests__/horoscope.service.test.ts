import { describe, it, expect } from 'vitest';
import { horoscopeService, Horoscope } from '../horoscope.service';

describe('HoroscopeService Compatibility', () => {
  const mockHoroscope1: Horoscope = {
    id: '1',
    user_id: 'user1',
    birth_date: '1995-01-01',
    birth_time: '12:00',
    birth_place: 'Mumbai',
    moon_sign: 'Aries',
    nakshatra: 'Ashwini',
    manglik_status: 'no',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockHoroscope2: Horoscope = {
    id: '2',
    user_id: 'user2',
    birth_date: '1997-01-01',
    birth_time: '14:00',
    birth_place: 'Mumbai',
    moon_sign: 'Leo',
    nakshatra: 'Pushya',
    manglik_status: 'no',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  describe('calculateCompatibility', () => {
    it('should calculate perfect score for highly compatible profiles', () => {
      const result = horoscopeService.calculateCompatibility(mockHoroscope1, mockHoroscope2);
      
      // Aries & Leo = 100 moon sign score
      // Ashwini (Deva) & Pushya (Deva) = 100 nakshatra score
      // No & No = 100 manglik score
      // Total = 100 * 0.4 + 100 * 0.3 + 100 * 0.3 = 100
      expect(result.score).toBe(100);
      expect(result.factors.moonSign).toBe(100);
      expect(result.factors.nakshatra).toBe(100);
      expect(result.factors.manglik).toBe(100);
      expect(result.details).toContain('Excellent moon sign compatibility');
      expect(result.details).toContain('Highly compatible nakshatras (Gana match)');
      expect(result.details).toContain('Perfect manglik match');
    });

    it('should calculate lower score for incompatible profiles', () => {
      const incompatibleHoroscope: Horoscope = {
        ...mockHoroscope2,
        moon_sign: 'Libra', // Opposite of Aries (diff 6) -> 40
        nakshatra: 'Magha', // Rakshasa (Ashwini is Deva) -> 30
        manglik_status: 'yes' // One is 'no', other is 'yes' -> 20
      };
      
      const result = horoscopeService.calculateCompatibility(mockHoroscope1, incompatibleHoroscope);
      
      // Total = 40 * 0.4 + 30 * 0.3 + 20 * 0.3 = 16 + 9 + 6 = 31
      expect(result.score).toBe(31);
      expect(result.details).toContain('Moderate moon sign compatibility');
      expect(result.details).toContain('Manglik dosha present - consult astrologer');
    });

    it('should handle missing data gracefully', () => {
      const emptyHoroscope: Horoscope = {
        id: '3',
        user_id: 'user3',
        birth_date: '',
        birth_time: '',
        birth_place: '',
        created_at: '',
        updated_at: ''
      };
      
      const result = horoscopeService.calculateCompatibility(mockHoroscope1, emptyHoroscope);
      expect(result.score).toBe(50); // Default neutral score
    });
  });

  describe('Nakshatra Gana Matching', () => {
    it('should correctly match same Gana', () => {
      const h1 = { ...mockHoroscope1, nakshatra: 'Ashwini' }; // Deva
      const h2 = { ...mockHoroscope2, nakshatra: 'Revati' }; // Deva
      const result = horoscopeService.calculateCompatibility(h1, h2);
      expect(result.factors.nakshatra).toBe(100);
    });

    it('should correctly match Deva and Rakshasa (lowest compatibility)', () => {
      const h1 = { ...mockHoroscope1, nakshatra: 'Ashwini' }; // Deva
      const h2 = { ...mockHoroscope2, nakshatra: 'Magha' }; // Rakshasa
      const result = horoscopeService.calculateCompatibility(h1, h2);
      expect(result.factors.nakshatra).toBe(30);
    });
  });

  describe('Manglik Status Matching', () => {
    it('should correctly match both Manglik', () => {
      const h1 = { ...mockHoroscope1, manglik_status: 'yes' };
      const h2 = { ...mockHoroscope2, manglik_status: 'yes' };
      const result = horoscopeService.calculateCompatibility(h1, h2 as Horoscope);
      expect(result.factors.manglik).toBe(100);
    });

    it('should correctly match Anshik Manglik', () => {
      const h1 = { ...mockHoroscope1, manglik_status: 'no' };
      const h2 = { ...mockHoroscope2, manglik_status: 'anshik' };
      const result = horoscopeService.calculateCompatibility(h1, h2 as Horoscope);
      expect(result.factors.manglik).toBe(60);
    });
  });
});
