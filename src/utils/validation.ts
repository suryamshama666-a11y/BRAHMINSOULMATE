/**
 * Validation utilities for user inputs and data
 */

import { z } from 'zod';

export const uuidSchema = z.string().uuid('Invalid UUID format');

export function isValidUUID(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}

export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(cleaned);
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

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

export function validateUserId(userId: string): string {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }
  return userId;
}

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
