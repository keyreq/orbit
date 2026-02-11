import { NextResponse } from 'next/server'
import clientPromise from '@/lib/db/mongodb'
import redis from '@/lib/db/redis'

/**
 * Health Check Endpoint
 *
 * GET /api/health
 *
 * Checks the status of database connections and API availability
 */
export async function GET() {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: true,
      mongodb: false,
      redis: false,
    },
  }

  try {
    // Check MongoDB connection
    const client = await clientPromise
    await client.db('orbit').command({ ping: 1 })
    healthStatus.services.mongodb = true
  } catch (error) {
    console.error('MongoDB health check failed:', error)
    healthStatus.status = 'degraded'
  }

  try {
    // Check Redis connection
    await redis.ping()
    healthStatus.services.redis = true
  } catch (error) {
    console.error('Redis health check failed:', error)
    healthStatus.status = 'degraded'
  }

  return NextResponse.json(healthStatus, {
    status: healthStatus.status === 'ok' ? 200 : 503,
  })
}
