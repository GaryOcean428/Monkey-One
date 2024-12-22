import { Redis } from 'ioredis';
import { pool } from '../db/config';

// Redis client configuration
const redisConfig = {
  host: import.meta.env.VITE_REDIS_HOST,
  port: parseInt(import.meta.env.VITE_REDIS_PORT || '6379'),
  password: import.meta.env.VITE_REDIS_PASSWORD,
  username: import.meta.env.VITE_REDIS_USERNAME,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
  tls: {
    rejectUnauthorized: false
  }
};

// Create Redis client
const redis = new Redis(redisConfig);

// Cache configuration
const CACHE_TTL = 3600; // 1 hour default TTL
const CACHE_PREFIX = 'monkey_one:';

// Cache wrapper for database queries
export async function cachedQuery<T>(
  key: string,
  query: string,
  params?: any[],
  ttl: number = CACHE_TTL
): Promise<T> {
  const cacheKey = `${CACHE_PREFIX}${key}:${JSON.stringify(params || [])}`;

  try {
    // Try to get from cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // If not in cache, query database
    const { rows } = await pool.query(query, params);
    
    // Store in cache
    await redis.setex(cacheKey, ttl, JSON.stringify(rows));
    
    return rows;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to direct database query
    const { rows } = await pool.query(query, params);
    return rows;
  }
}

// Cache invalidation helpers
export const cache = {
  async invalidate(key: string) {
    const pattern = `${CACHE_PREFIX}${key}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  async invalidatePattern(pattern: string) {
    const keys = await redis.keys(`${CACHE_PREFIX}${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  async clear() {
    const keys = await redis.keys(`${CACHE_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};

// Health check
export async function checkHealth() {
  try {
    await redis.ping();
    return { status: 'healthy' };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Cleanup
export async function cleanup() {
  await redis.quit();
}

export default {
  redis,
  cachedQuery,
  cache,
  checkHealth,
  cleanup
};