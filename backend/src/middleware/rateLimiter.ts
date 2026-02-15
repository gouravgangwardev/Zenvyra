// ============================================
// FILE 2: src/middleware/rateLimiter.ts
// ============================================
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { ENV } from '../config/environment';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants';

// General API rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'ratelimit:api:',
  }),
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'ratelimit:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false,
});

// Report rate limiter
export const reportLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'ratelimit:report:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reports per hour
  message: {
    success: false,
    error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Too many reports submitted, please try again later',
  },
  keyGenerator: (req: any) => {
    return req.user?.userId || req.ip;
  },
});

// Friend request rate limiter
export const friendRequestLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'ratelimit:friend:',
  }),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 friend requests per 5 minutes
  message: {
    success: false,
    error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Too many friend requests, please slow down',
  },
  keyGenerator: (req: any) => {
    return req.user?.userId || req.ip;
  },
});

// IP-based rate limiter (for public endpoints)
export const ipLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: 'ratelimit:ip:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: 'Too many requests from this IP',
  },
});

// Create custom rate limiter
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  prefix: string;
  message?: string;
}) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.call(...args),
      prefix: `ratelimit:${options.prefix}:`,
    }),
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: options.message || 'Rate limit exceeded',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};