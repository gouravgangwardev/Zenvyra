// src/config/redis.ts
import Redis, { RedisOptions } from 'ioredis';
import { logger } from '../utils/logger';
import { ENV } from './environment';

// Base Redis configuration
const baseConfig: RedisOptions = {
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASSWORD,
  
  // Connection settings
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  
  // Reconnection strategy
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis reconnecting, attempt ${times}, delay ${delay}ms`);
    return delay;
  },
  
  // Connection lifecycle
  lazyConnect: false,
  keepAlive: 30000,
  connectTimeout: 10000,
  
  // Performance
  enableAutoPipelining: true,
};

// Primary Redis client for general operations
export const redisClient = new Redis({
  ...baseConfig,
  connectionName: 'primary',
  db: 0,
});

// Pub/Sub Redis client (must be separate instance)
export const redisPubClient = new Redis({
  ...baseConfig,
  connectionName: 'pubsub-pub',
  db: 0,
});

// Subscriber Redis client
export const redisSubClient = new Redis({
  ...baseConfig,
  connectionName: 'pubsub-sub',
  db: 0,
});

// Cache Redis client (separate DB)
export const redisCacheClient = new Redis({
  ...baseConfig,
  connectionName: 'cache',
  db: 1,
});

// Session Redis client
export const redisSessionClient = new Redis({
  ...baseConfig,
  connectionName: 'session',
  db: 2,
});

// Event handlers for primary client
redisClient.on('connect', () => {
  logger.info('Redis primary client connecting');
});

redisClient.on('ready', () => {
  logger.info('Redis primary client ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis primary client error:', err);
});

redisClient.on('close', () => {
  logger.warn('Redis primary client connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis primary client reconnecting');
});

// Event handlers for pub/sub
redisPubClient.on('ready', () => {
  logger.info('Redis pub client ready');
});

redisSubClient.on('ready', () => {
  logger.info('Redis sub client ready');
});

// Test Redis connection
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    logger.info('Redis connection successful');
    return true;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    return false;
  }
};

// Redis key prefixes
export const REDIS_KEYS = {
  // Queue management
  QUEUE_VIDEO: 'queue:video',
  QUEUE_AUDIO: 'queue:audio',
  QUEUE_TEXT: 'queue:text',
  
  // Locks
  LOCK_MATCHING: 'lock:matching:',
  LOCK_SESSION: 'lock:session:',
  
  // Sessions
  SESSION: 'session:',
  SESSION_USER: 'session:user:',
  
  // User presence
  USER_ONLINE: 'user:online:',
  USER_STATUS: 'user:status:',
  
  // Friend system
  FRIEND_REQUESTS: 'friend:requests:',
  FRIEND_LIST: 'friend:list:',
  
  // Rate limiting
  RATE_LIMIT: 'rate:',
  
  // Cache
  CACHE_USER: 'cache:user:',
  
  // Socket connections
  SOCKET_USER: 'socket:user:',
};

// Redis utilities
export class RedisService {
  // Distributed lock implementation
  static async acquireLock(
    key: string, 
    ttl: number = 5000
  ): Promise<boolean> {
    try {
      const result = await redisClient.set(
        key,
        '1',
        'PX',
        ttl,
        'NX'
      );
      return result === 'OK';
    } catch (error) {
      logger.error('Error acquiring lock:', error);
      return false;
    }
  }

  static async releaseLock(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error('Error releasing lock:', error);
    }
  }

  // Execute with lock
  static async withLock<T>(
    lockKey: string,
    callback: () => Promise<T>,
    ttl: number = 5000
  ): Promise<T | null> {
    const acquired = await this.acquireLock(lockKey, ttl);
    
    if (!acquired) {
      logger.warn(`Failed to acquire lock: ${lockKey}`);
      return null;
    }

    try {
      return await callback();
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  // Cache with TTL
  static async setCache(
    key: string,
    value: any,
    ttl: number = 300
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await redisCacheClient.setex(key, ttl, serialized);
    } catch (error) {
      logger.error('Error setting cache:', error);
    }
  }

  static async getCache<T>(key: string): Promise<T | null> {
    try {
      const value = await redisCacheClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Error getting cache:', error);
      return null;
    }
  }

  static async deleteCache(key: string): Promise<void> {
    try {
      await redisCacheClient.del(key);
    } catch (error) {
      logger.error('Error deleting cache:', error);
    }
  }

  // Pub/Sub helpers
  static async publish(channel: string, message: any): Promise<void> {
    try {
      const serialized = JSON.stringify(message);
      await redisPubClient.publish(channel, serialized);
    } catch (error) {
      logger.error('Error publishing message:', error);
    }
  }

  static subscribe(channel: string, callback: (message: any) => void): void {
    redisSubClient.subscribe(channel, (err) => {
      if (err) {
        logger.error(`Error subscribing to ${channel}:`, err);
        return;
      }
      logger.info(`Subscribed to channel: ${channel}`);
    });

    redisSubClient.on('message', (ch, message) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(message);
          callback(parsed);
        } catch (error) {
          logger.error('Error parsing pub/sub message:', error);
        }
      }
    });
  }

  // Get Redis stats
  static async getStats() {
    try {
      const info = await redisClient.info();
      const dbSize = await redisClient.dbsize();
      
      return {
        dbSize,
        info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      };
    } catch (error) {
      logger.error('Error getting Redis stats:', error);
      return null;
    }
  }
}

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  try {
    await Promise.all([
      redisClient.quit(),
      redisPubClient.quit(),
      redisSubClient.quit(),
      redisCacheClient.quit(),
      redisSessionClient.quit(),
    ]);
    logger.info('All Redis connections closed successfully');
  } catch (error) {
    logger.error('Error closing Redis connections:', error);
    throw error;
  }
};

// Socket.io Redis adapter configuration
export const getSocketIORedisAdapter = () => {
  return {
    pubClient: redisPubClient,
    subClient: redisSubClient,
  };
};

export default {
  redisClient,
  redisPubClient,
  redisSubClient,
  redisCacheClient,
  redisSessionClient,
  RedisService,
  REDIS_KEYS,
  testRedisConnection,
  closeRedis,
  getSocketIORedisAdapter,
};