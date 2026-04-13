/**
 * Input sanitization utilities for production-grade validation
 * Handles edge cases like emojis, special characters, and malicious input
 */

export const inputSanitizer = {
  /**
   * Remove emojis from text
   */
  removeEmojis: (text: string): string => {
    if (!text) return '';
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  },

  /**
   * Strict phone number validation - only digits, +, -, spaces, parentheses
   */
  phoneNumber: (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/[^\d+\-\s()]/g, '').trim();
  },

  /**
   * Strict email validation
   */
  email: (email: string): string => {
    if (!email) return '';
    return email.toLowerCase().trim().replace(/[^\w@.\-+]/g, '');
  },

  /**
   * Name validation - allow unicode letters but no emojis or special chars
   */
  name: (name: string): string => {
    if (!name) return '';
    // Remove emojis
    let cleaned = name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    // Remove special characters except spaces, hyphens, apostrophes
    cleaned = cleaned.replace(/[^\p{L}\s\-']/gu, '');
    return cleaned.trim();
  },

  /**
   * General text sanitization - remove dangerous characters
   */
  text: (text: string): string => {
    if (!text) return '';
    // Remove null bytes and control characters
    return text.replace(/[\x00-\x1F\x7F]/g, '').trim();
  },

  /**
   * URL validation and sanitization
   */
  url: (url: string): string => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      // Only allow http and https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  },

  /**
   * Sanitize search query
   */
  searchQuery: (query: string): string => {
    if (!query) return '';
    // Remove special SQL/NoSQL characters
    return query.replace(/[;'"\\<>{}]/g, '').trim();
  },

  /**
   * Validate and sanitize age
   */
  age: (age: number | string): number => {
    const numAge = typeof age === 'string' ? parseInt(age, 10) : age;
    if (isNaN(numAge) || numAge < 18 || numAge > 120) {
      return 18; // Default to minimum age
    }
    return numAge;
  },

  /**
   * Validate UUID format
   */
  isValidUUID: (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
};

export default inputSanitizer;
