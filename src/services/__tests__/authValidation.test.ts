import { describe, it, expect } from 'vitest';

describe('Authentication Logic Tests', () => {
  describe('Email Validation', () => {
    function isValidEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.in')).toBe(true);
      expect(isValidEmail('first+last@subdomain.example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Password Strength Validation', () => {
    function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
      const errors: string[] = [];
      
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
      }
      
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      
      if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    }

    it('should accept strong passwords', () => {
      const result = isStrongPassword('SecurePass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords without uppercase', () => {
      const result = isStrongPassword('weakpass123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase', () => {
      const result = isStrongPassword('WEAKPASS123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = isStrongPassword('WeakPass!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject passwords without special characters', () => {
      const result = isStrongPassword('WeakPass123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*)');
    });

    it('should reject passwords that are too short', () => {
      const result = isStrongPassword('Pass1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should provide multiple error messages for weak passwords', () => {
      const result = isStrongPassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Age Validation for Registration', () => {
    function isValidAge(birthDate: string): { valid: boolean; age: number; error?: string } {
      const birth = new Date(birthDate);
      const today = new Date();
      
      if (isNaN(birth.getTime())) {
        return { valid: false, age: 0, error: 'Invalid date format' };
      }
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      if (age < 18) {
        return { valid: false, age, error: 'Must be at least 18 years old' };
      }
      
      if (age > 100) {
        return { valid: false, age, error: 'Invalid age' };
      }
      
      return { valid: true, age };
    }

    it('should accept valid adult age', () => {
      const result = isValidAge('1995-01-01');
      expect(result.valid).toBe(true);
      expect(result.age).toBeGreaterThanOrEqual(18);
    });

    it('should reject underage users', () => {
      const result = isValidAge('2010-01-01');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Must be at least 18 years old');
    });

    it('should reject invalid dates', ()=> {
      const result = isValidAge('invalid-date');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid date format');
    });

    it('should reject unrealistic ages', () => {
      const result = isValidAge('1900-01-01');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid age');
    });
  });

  describe('Phone Number Validation (Indian)', () => {
    function isValidIndianPhone(phone: string): boolean {
      // Indian phone numbers: 10 digits, optionally with +91 or 0 prefix
      const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
      return phoneRegex.test(phone.replace(/\s|-/g, ''));
    }

    it('should validate 10-digit Indian mobile numbers', () => {
      expect(isValidIndianPhone('9876543210')).toBe(true);
      expect(isValidIndianPhone('8765432109')).toBe(true);
      expect(isValidIndianPhone('7654321098')).toBe(true);
      expect(isValidIndianPhone('6543210987')).toBe(true);
    });

    it('should validate numbers with +91 prefix', () => {
      expect(isValidIndianPhone('+919876543210')).toBe(true);
      expect(isValidIndianPhone('919876543210')).toBe(true);
    });

    it('should validate numbers with 0 prefix', () => {
      expect(isValidIndianPhone('09876543210')).toBe(true);
    });

    it('should validate numbers with spaces and dashes', () => {
      expect(isValidIndianPhone('98765-43210')).toBe(true);
      expect(isValidIndianPhone('9876 543 210')).toBe(true);
    });

    it('should reject invalid Indian phone numbers', () => {
      expect(isValidIndianPhone('1234567890')).toBe(false); // Starts with 1
      expect(isValidIndianPhone('98765')).toBe(false); // Too short
      expect(isValidIndianPhone('98765432109999')).toBe(false); // Too long
      expect(isValidIndianPhone('abcdefghij')).toBe(false); // Letters
    });
  });

  describe('Profile Completeness Validation', () => {
    interface ProfileData {
      firstName?: string;
      lastName?: string;
      age?: number;
      gender?: string;
      location?: {
        city?: string;
        state?: string;
      };
      education?: string;
      bio?: string;
    }

    function calculateProfileCompleteness(profile: ProfileData): number {
      const requiredFields = ['firstName', 'lastName', 'age', 'gender'];
      const optionalFields = ['location', 'education', 'bio'];
      
      let completedRequired = 0;
      let completedOptional = 0;
      
      requiredFields.forEach(field => {
        if (profile[field as keyof ProfileData]) {
          completedRequired++;
        }
      });
      
      optionalFields.forEach(field => {
        const value = profile[field as keyof ProfileData];
        if (value) {
          if (field === 'location' && typeof value === 'object') {
            if (value.city && value.state) completedOptional++;
          } else {
            completedOptional++;
          }
        }
      });
      
      // Required fields = 60%, Optional fields = 40%
      const requiredPercentage = (completedRequired / requiredFields.length) * 60;
      const optionalPercentage = (completedOptional / optionalFields.length) * 40;
      
      return Math.round(requiredPercentage + optionalPercentage);
    }

    it('should calculate 100% for complete profile', () => {
      const profile: ProfileData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 28,
        gender: 'male',
        location: { city: 'Mumbai', state: 'Maharashtra' },
        education: 'Masters',
        bio: 'Software Engineer'
      };
      
      expect(calculateProfileCompleteness(profile)).toBe(100);
    });

    it('should calculate 60% for only required fields', () => {
      const profile: ProfileData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 28,
        gender: 'male'
      };
      
      expect(calculateProfileCompleteness(profile)).toBe(60);
    });

    it('should calculate partial completeness correctly', () => {
      const profile: ProfileData = {
        firstName: 'John',
        lastName: 'Doe',
        age: 28,
        gender: 'male',
        education: 'Masters'
      };
      
      // Required: 100% of 60 = 60
      // Optional: 33% of 40 = 13.3
      expect(calculateProfileCompleteness(profile)).toBeGreaterThanOrEqual(70);
    });

    it('should handle empty profile', () => {
      const profile: ProfileData = {};
      expect(calculateProfileCompleteness(profile)).toBe(0);
    });
  });

  describe('Username/Display Name Validation', () => {
    function isValidUsername(username: string): { valid: boolean; error?: string } {
      if (!username || username.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
      }
      
      if (username.length > 30) {
        return { valid: false, error: 'Username must be at most 30 characters' };
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
      }
      
      if (/^\d/.test(username)) {
        return { valid: false, error: 'Username cannot start with a number' };
      }
      
      const bannedWords = ['admin', 'moderator', 'support', 'official'];
      if (bannedWords.some(word => username.toLowerCase().includes(word))) {
        return { valid: false, error: 'Username contains restricted words' };
      }
      
      return { valid: true };
    }

    it('should accept valid usernames', () => {
      expect(isValidUsername('john_doe').valid).toBe(true);
      expect(isValidUsername('User123').valid).toBe(true);
      expect(isValidUsername('Cool_User_99').valid).toBe(true);
    });

    it('should reject too short usernames', () => {
      const result = isValidUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Username must be at least 3 characters');
    });

    it('should reject too long usernames', () => {
      const result = isValidUsername('a'.repeat(31));
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Username must be at most 30 characters');
    });

    it('should reject usernames with special characters', () => {
      const result = isValidUsername('user@name');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Username can only contain letters, numbers, and underscores');
    });

    it('should reject usernames starting with numbers', () => {
      const result = isValidUsername('123user');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Username cannot start with a number');
    });

    it('should reject usernames with banned words', () => {
      expect(isValidUsername('admin123').valid).toBe(false);
      expect(isValidUsername('support_user').valid).toBe(false);
    });
  });
});
