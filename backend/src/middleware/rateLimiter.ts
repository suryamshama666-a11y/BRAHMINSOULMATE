import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';

// Redis store configuration
const createStore = (prefix: string) => {
  if (!redis) return undefined;
  return new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: `rl_${prefix}:`,
  });
};

// Rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('auth'),
});

// Strict rate limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('pwd_reset'),
});

// Rate limiter for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: 'Too many payment attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('payment'),
});

// Rate limiter for messaging endpoints
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  message: 'Too many messages, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('messaging'),
});

// Rate limiter for interest/match endpoints
export const interestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 interests per hour
  message: 'Too many interest requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('interest'),
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Strictly limited global API usage
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('api'),
});

// Strict rate limiter for profile views (prevent scraping)
export const profileViewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Strictly limited to 10 views per minute to prevent scraping
  message: 'Too many profile views, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('profile_view'),
});

// Strict rate limiter for external communications (Email/SMS)
export const communicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 emails/SMS per hour
  message: 'Daily communication limit reached. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('comm'),
});

