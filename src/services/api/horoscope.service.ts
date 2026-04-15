import { supabase } from '@/lib/supabase';

export interface Horoscope {
  id: string;
  user_id: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  moon_sign?: string;
  nakshatra?: string;
  rashi?: string;
  manglik_status?: 'yes' | 'no' | 'anshik' | 'unknown';
  horoscope_file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface HoroscopeCompatibility {
  score: number;
  factors: {
    moonSign: number;
    nakshatra: number;
    manglik: number;
  };
  details: string[];
}

class HoroscopeService {
  private readonly BUCKET_NAME = 'horoscope-files';

  // Moon sign compatibility matrix (simplified)
  private moonSignCompatibility: Record<string, string[]> = {
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

  // Nakshatra compatibility (simplified - Gana matching)
  private nakshatraGana: Record<string, 'Deva' | 'Manushya' | 'Rakshasa'> = {
    'Ashwini': 'Deva',
    'Bharani': 'Manushya',
    'Krittika': 'Rakshasa',
    'Rohini': 'Manushya',
    'Mrigashira': 'Deva',
    'Ardra': 'Manushya',
    'Punarvasu': 'Deva',
    'Pushya': 'Deva',
    'Ashlesha': 'Rakshasa',
    'Magha': 'Rakshasa',
    'Purva Phalguni': 'Manushya',
    'Uttara Phalguni': 'Manushya',
    'Hasta': 'Deva',
    'Chitra': 'Rakshasa',
    'Swati': 'Deva',
    'Vishakha': 'Rakshasa',
    'Anuradha': 'Deva',
    'Jyeshtha': 'Rakshasa',
    'Mula': 'Rakshasa',
    'Purva Ashadha': 'Manushya',
    'Uttara Ashadha': 'Manushya',
    'Shravana': 'Deva',
    'Dhanishta': 'Rakshasa',
    'Shatabhisha': 'Rakshasa',
    'Purva Bhadrapada': 'Manushya',
    'Uttara Bhadrapada': 'Manushya',
    'Revati': 'Deva'
  };

  // Create or update horoscope
  async saveHoroscope(horoscopeData: Partial<Horoscope>): Promise<Horoscope> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if horoscope exists
    const { data: existing } = await supabase
      .from('horoscope_details')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('horoscope_details')
        .update(horoscopeData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('horoscope_details')
        .insert({
          ...horoscopeData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // Upload horoscope file (PDF or image)
  async uploadHoroscopeFile(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF and image files are allowed');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/horoscope_${Date.now()}.${fileExt}`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(uploadData.path);

    // Update horoscope record
    await this.saveHoroscope({ horoscope_file_url: publicUrl });

    return publicUrl;
  }

  // Get my horoscope
  async getMyHoroscope(): Promise<Horoscope | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('horoscope_details')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Get user horoscope (with privacy check)
  async getUserHoroscope(userId: string): Promise<Horoscope | null> {
    const { data: { user } } = await supabase.auth.getUser();

    // Check if viewer has permission
    if (!user) return null;

    // Owner can always see their own horoscope
    if (user.id === userId) {
      return this.getMyHoroscope();
    }

    // Check if users are connected or viewer is premium
    const areConnected = await this.checkConnection(user.id, userId);
    const hasPremium = await this.checkPremiumStatus(user.id);

    if (!areConnected && !hasPremium) {
      return null; // No permission to view
    }

    const { data, error } = await supabase
      .from('horoscope_details')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Calculate horoscope compatibility
  calculateCompatibility(
    horoscope1: Horoscope,
    horoscope2: Horoscope
  ): HoroscopeCompatibility {
    const factors = {
      moonSign: this.calculateMoonSignScore(horoscope1.rashi || horoscope1.moon_sign, horoscope2.rashi || horoscope2.moon_sign),
      nakshatra: this.calculateNakshatraScore(horoscope1.nakshatra, horoscope2.nakshatra),
      manglik: this.calculateManglikScore(horoscope1.manglik_status, horoscope2.manglik_status)
    };

    const score = Math.round(
      factors.moonSign * 0.4 +
      factors.nakshatra * 0.3 +
      factors.manglik * 0.3
    );

    const details: string[] = [];

    if (factors.moonSign >= 80) {
      details.push('Excellent moon sign compatibility');
    } else if (factors.moonSign >= 60) {
      details.push('Good moon sign compatibility');
    } else {
      details.push('Moderate moon sign compatibility');
    }

    if (factors.nakshatra >= 80) {
      details.push('Highly compatible nakshatras (Gana match)');
    } else if (factors.nakshatra >= 60) {
      details.push('Compatible nakshatras');
    }

    if (factors.manglik === 100) {
      details.push('Perfect manglik match');
    } else if (factors.manglik >= 50) {
      details.push('Acceptable manglik compatibility');
    } else {
      details.push('Manglik dosha present - consult astrologer');
    }

    return { score, factors, details };
  }

  // Calculate moon sign compatibility score
  private calculateMoonSignScore(sign1?: string, sign2?: string): number {
    if (!sign1 || !sign2) return 50; // Default score if data missing

    const compatibleSigns = this.moonSignCompatibility[sign1] || [];
    
    if (sign1 === sign2) return 70; // Same sign
    if (compatibleSigns.includes(sign2)) return 100; // Highly compatible
    
    // Check if opposite signs (6 signs apart)
    const signs = Object.keys(this.moonSignCompatibility);
    const index1 = signs.indexOf(sign1);
    const index2 = signs.indexOf(sign2);
    const diff = Math.abs(index1 - index2);
    
    if (diff === 6) return 40; // Opposite signs
    if (diff <= 2 || diff >= 10) return 60; // Adjacent or nearby
    
    return 50; // Neutral
  }

  // Calculate nakshatra compatibility score (Gana matching)
  private calculateNakshatraScore(nakshatra1?: string, nakshatra2?: string): number {
    if (!nakshatra1 || !nakshatra2) return 50;

    const gana1 = this.nakshatraGana[nakshatra1];
    const gana2 = this.nakshatraGana[nakshatra2];

    if (!gana1 || !gana2) return 50;

    // Gana compatibility rules
    if (gana1 === gana2) return 100; // Same gana - excellent
    if (gana1 === 'Deva' && gana2 === 'Manushya') return 80;
    if (gana1 === 'Manushya' && gana2 === 'Deva') return 80;
    if (gana1 === 'Manushya' && gana2 === 'Rakshasa') return 60;
    if (gana1 === 'Rakshasa' && gana2 === 'Manushya') return 60;
    if (gana1 === 'Deva' && gana2 === 'Rakshasa') return 30;
    if (gana1 === 'Rakshasa' && gana2 === 'Deva') return 30;

    return 50;
  }

  // Calculate manglik compatibility score
  private calculateManglikScore(
    manglik1?: string,
    manglik2?: string
  ): number {
    if (!manglik1 || !manglik2 || manglik1 === 'unknown' || manglik2 === 'unknown') {
      return 50; // Unknown status
    }

    // Both manglik or both non-manglik is ideal
    if (manglik1 === manglik2) return 100;

    // One manglik, one non-manglik is not ideal
    if ((manglik1 === 'yes' && manglik2 === 'no') || (manglik1 === 'no' && manglik2 === 'yes')) {
      return 20;
    }

    // Anshik manglik cases
    if (manglik1 === 'anshik' || manglik2 === 'anshik') {
      return 60;
    }

    return 50;
  }

  // Check if users are connected
  private async checkConnection(userId1: string, userId2: string): Promise<boolean> {
    const { data } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user_id_1.eq.${userId1},user_id_2.eq.${userId2}),and(user_id_1.eq.${userId2},user_id_2.eq.${userId1})`)
      .eq('status', 'connected')
      .single();

    return !!data;
  }

  // Check premium status
  private async checkPremiumStatus(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_type, subscription_end_date')
      .eq('user_id', userId)
      .single();

    if (!data) return false;
    if (data.subscription_type === 'free') return false;

    if (data.subscription_end_date) {
      const endDate = new Date(data.subscription_end_date);
      return endDate > new Date();
    }

    return false;
  }

  // Delete horoscope
  async deleteHoroscope(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get horoscope to delete file
    const horoscope = await this.getMyHoroscope();
    
    if (horoscope?.horoscope_file_url) {
      // Extract file path and delete from storage
      const urlParts = horoscope.horoscope_file_url.split('/');
      const filePath = urlParts.slice(-2).join('/');
      
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
    }

    // Delete from database
    const { error } = await supabase
      .from('horoscope_details')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }
}

export const horoscopeService = new HoroscopeService();
