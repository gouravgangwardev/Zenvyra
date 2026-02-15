
import { Socket } from 'socket.io';
import { redisClient } from '../../config/redis';
import { logger } from '../../utils/logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimits: Record<string, RateLimitConfig> = {
  'chat:message': { windowMs: 1000, maxRequests: 5 },
  'queue:join': { windowMs: 5000, maxRequests: 3 },
  'call:offer': { windowMs: 10000, maxRequests: 10 },
  'call:answer': { windowMs: 10000, maxRequests: 10 },
  'call:ice': { windowMs: 1000, maxRequests: 50 },
};

export const createRateLimiter = (event: string, config?: RateLimitConfig) => {
  const limitConfig = config || rateLimits[event] || { windowMs: 1000, maxRequests: 10 };

  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const userId = socket.data.userId;
      const key = `ratelimit:ws:${userId}:${event}`;
      
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.pexpire(key, limitConfig.windowMs);
      }

      if (current > limitConfig.maxRequests) {
        logger.warn(`Rate limit exceeded for ${userId} on ${event}`);
        return next(new Error('Rate limit exceeded'));
      }

      next();
    } catch (error) {
      logger.error('Rate limit error:', error);
      next();
    }
  };
};