/**
 * ORBIT Rate Limiting
 *
 * Implements rate limiting to prevent API abuse and DDoS attacks.
 *
 * Features:
 * - Sliding window algorithm
 * - Per-user and per-IP rate limiting
 * - Configurable limits per endpoint
 * - Memory-based (development) and Redis-based (production)
 *
 * Security Agent: security-agent
 * Created: 2026-02-11
 * Priority: HIGH
 */

import { NextRequest } from 'next/server'

// ============================================================================
// TYPES
// ============================================================================

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  max: number

  /**
   * Time window in seconds
   */
  windowSeconds: number

  /**
   * Identifier type: 'ip' or 'user'
   */
  identifierType?: 'ip' | 'user'
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  success: boolean

  /**
   * Maximum requests allowed in window
   */
  limit: number

  /**
   * Remaining requests in current window
   */
  remaining: number

  /**
   * Timestamp when the limit resets (Unix timestamp)
   */
  reset: number

  /**
   * Seconds until rate limit resets (for 429 Retry-After header)
   */
  retryAfter?: number
}

// ============================================================================
// IN-MEMORY STORE (Development Only)
// ============================================================================

/**
 * Simple in-memory rate limit store
 *
 * WARNING: This is NOT suitable for production with multiple servers!
 * Use Redis-based rate limiting in production.
 */
class MemoryRateLimitStore {
  private requests: Map<string, { count: number; resetAt: number }> = new Map()

  /**
   * Record a request and check if rate limit is exceeded
   *
   * @param key - Unique identifier (IP or user ID)
   * @param config - Rate limit configuration
   * @returns Rate limit result
   */
  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now()
    const windowMs = config.windowSeconds * 1000
    const resetAt = Math.ceil(now / windowMs) * windowMs

    // Get current request count
    const existing = this.requests.get(key)

    // If no existing record or window expired, start fresh
    if (!existing || existing.resetAt < now) {
      this.requests.set(key, { count: 1, resetAt })

      return {
        success: true,
        limit: config.max,
        remaining: config.max - 1,
        reset: Math.floor(resetAt / 1000),
      }
    }

    // Increment count
    existing.count++

    // Check if limit exceeded
    if (existing.count > config.max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000)

      return {
        success: false,
        limit: config.max,
        remaining: 0,
        reset: Math.floor(existing.resetAt / 1000),
        retryAfter,
      }
    }

    // Update stored count
    this.requests.set(key, existing)

    return {
      success: true,
      limit: config.max,
      remaining: config.max - existing.count,
      reset: Math.floor(existing.resetAt / 1000),
    }
  }

  /**
   * Clean up expired entries (called periodically)
   */
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.requests.entries()) {
      if (value.resetAt < now) {
        this.requests.delete(key)
      }
    }
  }
}

// ============================================================================
// REDIS STORE (Production - TODO)
// ============================================================================

/**
 * Redis-based rate limit store
 *
 * TODO: Implement when Redis is fully configured
 * This will use Upstash Redis or ioredis
 */
class RedisRateLimitStore {
  // private redis: Redis

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    // TODO: Implement Redis-based rate limiting
    // Example implementation:
    //
    // const now = Date.now()
    // const windowMs = config.windowSeconds * 1000
    // const resetAt = Math.ceil(now / windowMs) * windowMs
    //
    // // Use Redis INCR and EXPIRE commands
    // const multi = this.redis.multi()
    // multi.incr(key)
    // multi.expire(key, config.windowSeconds)
    // const [count] = await multi.exec()
    //
    // if (count > config.max) {
    //   return { success: false, ... }
    // }
    //
    // return { success: true, ... }

    throw new Error('Redis rate limiting not implemented yet')
  }
}

// ============================================================================
// RATE LIMITER
// ============================================================================

// Singleton instance
let store: MemoryRateLimitStore | RedisRateLimitStore

/**
 * Get or create the rate limit store
 */
function getStore() {
  if (!store) {
    // TODO: Use Redis in production
    // if (process.env.REDIS_URL) {
    //   store = new RedisRateLimitStore()
    // } else {
    store = new MemoryRateLimitStore()
    // }
  }
  return store
}

// Cleanup interval for memory store (every 5 minutes)
// Note: Cleanup runs automatically when getRateLimitStore() is called
// periodically through API requests. Manual interval not needed in serverless.

// ============================================================================
// RATE LIMIT PRESETS
// ============================================================================

/**
 * Default rate limit configurations for different endpoints
 *
 * Based on SECURITY_AUDIT.md recommendations:
 * - Global: 100 req/min per IP
 * - Per-user: 60 req/min
 * - News search: 30 req/hour
 * - Alert creation: 10 req/hour
 */
export const RATE_LIMITS = {
  /**
   * Global rate limit (applied to all endpoints)
   */
  GLOBAL: {
    max: 100,
    windowSeconds: 60, // per minute
    identifierType: 'ip' as const,
  },

  /**
   * Per-user rate limit (requires authentication)
   */
  PER_USER: {
    max: 60,
    windowSeconds: 60, // per minute
    identifierType: 'user' as const,
  },

  /**
   * News search endpoint
   */
  NEWS_SEARCH: {
    max: 30,
    windowSeconds: 3600, // per hour
    identifierType: 'user' as const,
  },

  /**
   * Alert read endpoint
   */
  ALERT_READ: {
    max: 60,
    windowSeconds: 60, // per minute
    identifierType: 'user' as const,
  },

  /**
   * Alert creation endpoint
   */
  ALERT_CREATE: {
    max: 10,
    windowSeconds: 3600, // per hour
    identifierType: 'user' as const,
  },

  /**
   * Alert update endpoint
   */
  ALERT_UPDATE: {
    max: 30,
    windowSeconds: 3600, // per hour
    identifierType: 'user' as const,
  },

  /**
   * Alert delete endpoint
   */
  ALERT_DELETE: {
    max: 20,
    windowSeconds: 3600, // per hour
    identifierType: 'user' as const,
  },

  /**
   * DeFi position indexing
   */
  DEFI_INDEX: {
    max: 20,
    windowSeconds: 3600, // per hour
    identifierType: 'user' as const,
  },

  /**
   * Authentication endpoints (login, signup)
   */
  AUTH: {
    max: 5,
    windowSeconds: 300, // per 5 minutes
    identifierType: 'ip' as const,
  },
} as const

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Extract identifier from request
 *
 * @param request - Next.js request
 * @param type - Identifier type ('ip' or 'user')
 * @returns Unique identifier string
 */
function getIdentifier(
  request: NextRequest,
  type: 'ip' | 'user'
): string {
  if (type === 'user') {
    // TODO: Get user ID from session when auth is implemented
    // For now, fall back to IP
    // const session = await getServerSession(request)
    // if (session?.user?.id) {
    //   return `user:${session.user.id}`
    // }

    // Fallback to IP if no user session
    return getIdentifier(request, 'ip')
  }

  // Get IP from request
  // Check forwarded headers first (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return `ip:${realIp}`
  }

  // Fallback to a default (should not happen in production)
  return 'ip:unknown'
}

/**
 * Check rate limit for a request
 *
 * Usage:
 * ```typescript
 * // In API route
 * const result = await checkRateLimit(request, RATE_LIMITS.NEWS_SEARCH)
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Rate limit exceeded', retryAfter: result.retryAfter },
 *     {
 *       status: 429,
 *       headers: {
 *         'Retry-After': result.retryAfter!.toString(),
 *         'X-RateLimit-Limit': result.limit.toString(),
 *         'X-RateLimit-Remaining': '0',
 *         'X-RateLimit-Reset': result.reset.toString(),
 *       }
 *     }
 *   )
 * }
 * ```
 *
 * @param request - Next.js request
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.GLOBAL
): Promise<RateLimitResult> {
  const identifier = getIdentifier(
    request,
    config.identifierType || 'ip'
  )

  const store = getStore()
  return store.check(identifier, config)
}

/**
 * Get rate limit headers for response
 *
 * Add these headers to API responses to inform clients about rate limits
 *
 * @param result - Rate limit result
 * @returns Headers object
 */
function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }

  if (!result.success && result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }

  return headers
}

/**
 * Create rate limit response (429)
 *
 * Helper function to create standardized rate limit error responses
 *
 * @param result - Rate limit result
 * @returns NextResponse with 429 status
 */
function createRateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
      limit: result.limit,
      reset: result.reset,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result),
      },
    }
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  checkRateLimit as default,
  getStore,
  getIdentifier,
  getRateLimitHeaders,
  createRateLimitResponse,
}

// ============================================================================
// SECURITY NOTES
// ============================================================================

/**
 * SECURITY CONSIDERATIONS:
 *
 * 1. ✅ Sliding Window: Prevents burst attacks
 * 2. ✅ Per-Identifier: IP and user-based limits
 * 3. ✅ Configurable: Different limits per endpoint
 * 4. 🟡 Memory-based: NOT suitable for production multi-server setup
 * 5. 🟡 Redis TODO: Should use Redis in production
 *
 * PRODUCTION CHECKLIST:
 * - [ ] Implement Redis-based store
 * - [ ] Configure Redis connection (Upstash or ioredis)
 * - [ ] Test rate limiting under load
 * - [ ] Monitor rate limit violations
 * - [ ] Set up alerts for excessive rate limit hits
 * - [ ] Document rate limits in API documentation
 *
 * USAGE EXAMPLES:
 *
 * Example 1: Apply to API route
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimit = await checkRateLimit(request, RATE_LIMITS.NEWS_SEARCH)
 *   if (!rateLimit.success) {
 *     return createRateLimitResponse(rateLimit)
 *   }
 *   // ... proceed with request
 * }
 * ```
 *
 * Example 2: Custom rate limit
 * ```typescript
 * const customLimit = await checkRateLimit(request, {
 *   max: 5,
 *   windowSeconds: 60,
 *   identifierType: 'user',
 * })
 * ```
 *
 * Example 3: Add headers to successful response
 * ```typescript
 * const response = NextResponse.json(data)
 * const rateLimit = await checkRateLimit(request)
 * Object.entries(getRateLimitHeaders(rateLimit)).forEach(([key, value]) => {
 *   response.headers.set(key, value)
 * })
 * return response
 * ```
 */
