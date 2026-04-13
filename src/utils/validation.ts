/**
 * Validation utilities for user inputs and data
 */

import { z } from 'zod';

// UUID validation schema
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Validate UUID
export function isValidUUID(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

// Validate phone number (Indian and international formats)
export function isValidPhone(phone: string): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  // Check if it's a valid phone number (10-15 digits, optionally starting with +)
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(cleaned);
}

// Sanitize string input (remove potential XSS)
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .trim();
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Password validation
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
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

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate analytics field names
const ALLOWED_ANALYTICS_FIELDS = [
  'messages_sent',
  'interests_sent',
  'profile_views',
  'searches_performed',
  'logins',
  'profile_updates',
] as const;

export function isValidAnalyticsField(field: string): field is typeof ALLOWED_ANALYTICS_FIELDS[number] {
  return ALLOWED_ANALYTICS_FIELDS.includes(field as any);
}

// Validate and sanitize user ID for RPC calls
export function validateUserId(userId: string): string {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }
  return userId;
}

// Validate analytics parameters
export function validateAnalyticsParams(userId: string, field: string): { userId: string; field: string } {
  const validatedUserId = validateUserId(userId);
  
  if (!isValidAnalyticsField(field)) {
    throw new Error(`Invalid analytics field: ${field}`);
  }
  
  return { userId: validatedUserId, field };
}

export default {
  isValidUUID,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
  sanitizeString,
  validatePassword,
  isValidAnalyticsField,
  validateUserId,
  validateAnalyticsParams,
};
