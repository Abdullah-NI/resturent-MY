import Redis from 'ioredis';

let redisClient = null;
let isRedisConnected = false;
const memoryCache = new Map();
const memoryTTLs = new Map();

const initializeRedis = () => {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 3) {
            console.warn('⚠️ Redis max connection retries reached. Falling back to memory cache.');
            return null;
          }
          return Math.min(times * 200, 1000);
        },
        connectTimeout: 5000,
      });

      redisClient.on('connect', () => {
        isRedisConnected = true;
        console.log('✅ Connected to Redis successfully.');
      });

      redisClient.on('error', (err) => {
        isRedisConnected = false;
        console.warn(`⚠️ Redis error (${err.message}). Using memory cache fallback.`);
      });
    } catch (err) {
      console.warn('⚠️ Could not initialize Redis client:', err.message);
      isRedisConnected = false;
    }
  } else {
    console.log('ℹ️ REDIS_URL not specified. Using in-memory fallback cache.');
  }
};

initializeRedis();

/**
 * Get cached value by key
 */
export const getCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn(`Redis getCache failed for ${key}, falling back to memory cache:`, err.message);
    }
  }

  // Memory fallback
  if (memoryTTLs.has(key)) {
    if (Date.now() > memoryTTLs.get(key)) {
      memoryCache.delete(key);
      memoryTTLs.delete(key);
      return null;
    }
  }
  return memoryCache.has(key) ? memoryCache.get(key) : null;
};

/**
 * Set cache key with optional TTL (in seconds)
 */
export const setCache = async (key, value, ttlSeconds = 300) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return true;
    } catch (err) {
      console.warn(`Redis setCache failed for ${key}:`, err.message);
    }
  }

  // Memory fallback
  memoryCache.set(key, value);
  if (ttlSeconds > 0) {
    memoryTTLs.set(key, Date.now() + ttlSeconds * 1000);
  }
  return true;
};

/**
 * Delete cache key
 */
export const delCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn(`Redis delCache failed for ${key}:`, err.message);
    }
  }
  memoryCache.delete(key);
  memoryTTLs.delete(key);
  return true;
};

/**
 * Delete keys matching pattern (e.g. 'menu:*')
 */
export const delPattern = async (pattern) => {
  if (isRedisConnected && redisClient) {
    try {
      const stream = redisClient.scanStream({ match: pattern, count: 100 });
      stream.on('data', async (keys) => {
        if (keys.length) {
          const pipeline = redisClient.pipeline();
          keys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
        }
      });
    } catch (err) {
      console.warn(`Redis delPattern failed for ${pattern}:`, err.message);
    }
  }

  // Memory fallback clearing
  const regex = new RegExp('^' + pattern.replace('*', '.*'));
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      memoryTTLs.delete(key);
    }
  }
  return true;
};

/**
 * Rate limit check for key
 */
export const checkRateLimit = async (identifier, limit = 30, windowSeconds = 60) => {
  const key = `ratelimit:${identifier}`;
  if (isRedisConnected && redisClient) {
    try {
      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }
      return {
        allowed: current <= limit,
        current,
        limit,
        remaining: Math.max(0, limit - current),
      };
    } catch (err) {
      console.warn('Redis rate limit check failed:', err.message);
    }
  }

  // Memory fallback rate limiting
  const now = Date.now();
  const entry = memoryCache.get(key) || { count: 0, resetTime: now + windowSeconds * 1000 };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + windowSeconds * 1000;
  } else {
    entry.count += 1;
  }

  memoryCache.set(key, entry);
  memoryTTLs.set(key, entry.resetTime);

  return {
    allowed: entry.count <= limit,
    current: entry.count,
    limit,
    remaining: Math.max(0, limit - entry.count),
  };
};

export default {
  getCache,
  setCache,
  delCache,
  delPattern,
  checkRateLimit,
};
