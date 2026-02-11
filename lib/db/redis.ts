import Redis from 'ioredis'

if (!process.env.REDIS_URL) {
  throw new Error('Please add REDIS_URL to .env.local')
}

// Create Redis client
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true
    }
    return false
  },
})

// Event handlers for monitoring
redis.on('connect', () => {
  console.log('Redis client connected')
})

redis.on('ready', () => {
  console.log('Redis client ready')
})

redis.on('error', (err) => {
  console.error('Redis error:', err)
})

redis.on('close', () => {
  console.log('Redis client connection closed')
})

redis.on('reconnecting', () => {
  console.log('Redis client reconnecting')
})

// Helper functions for common Redis operations
export const redisHelpers = {
  // Cache with TTL
  async setCache(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  },

  // Get cached value
  async getCache<T = any>(key: string): Promise<T | null> {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  },

  // Delete cache
  async deleteCache(key: string): Promise<void> {
    await redis.del(key)
  },

  // Publish message to channel
  async publish(channel: string, message: any): Promise<void> {
    await redis.publish(channel, JSON.stringify(message))
  },

  // Rate limiting (increment counter with TTL)
  async rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const current = await redis.incr(key)

    if (current === 1) {
      // First request in window, set expiry
      await redis.expire(key, windowSeconds)
    }

    return current <= limit
  },

  // Get rate limit status
  async getRateLimitStatus(key: string): Promise<{ count: number; ttl: number }> {
    const count = await redis.get(key)
    const ttl = await redis.ttl(key)
    return {
      count: count ? parseInt(count, 10) : 0,
      ttl: ttl || 0,
    }
  },
}

export default redis
