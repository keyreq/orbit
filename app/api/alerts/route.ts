/**
 * ORBIT Alerts API Route - Server-Side Alert Management
 *
 * This file handles CRUD operations for price alerts with MongoDB persistence.
 *
 * Security Agent: security-agent
 * Created: 2026-02-11
 * Priority: HIGH
 */

import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { AlertCreateSchema, safeValidate } from '@/lib/validation'
import { checkRateLimit, createRateLimitResponse, getRateLimitHeaders, RATE_LIMITS } from '@/lib/ratelimit'
import { requireAuth } from '@/lib/session'

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

if (!process.env.MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI environment variable is not set!')
}

const uri = process.env.MONGODB_URI || 'MISSING_MONGODB_URI'
let client: MongoClient | null = null

async function getDb() {
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }
  return client.db('orbit')
}

// ============================================================================
// TYPES
// ============================================================================

interface Alert {
  _id?: ObjectId
  userId: string // TODO: Will be populated from auth session
  token: string
  condition: 'above' | 'below'
  targetPrice: number
  active: boolean
  notifications: string[]
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// GET /api/alerts - Fetch all alerts for user
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { userId, unauthorized } = requireAuth(request)
    if (unauthorized) return unauthorized

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.ALERT_READ)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    const db = await getDb()
    const alerts = await db
      .collection<Alert>('alerts')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(
      {
        success: true,
        data: alerts.map(alert => ({
          id: alert._id?.toString(),
          token: alert.token,
          condition: alert.condition,
          targetPrice: alert.targetPrice,
          active: alert.active,
          notifications: alert.notifications,
          createdAt: alert.createdAt.toISOString(),
          updatedAt: alert.updatedAt.toISOString(),
        })),
        count: alerts.length,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=0, must-revalidate',
          ...getRateLimitHeaders(rateLimitResult),
        },
      }
    )
  } catch (error) {
    console.error('GET /api/alerts error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch alerts',
        message: 'An error occurred while retrieving your alerts.',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/alerts - Create new alert
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { userId, unauthorized } = requireAuth(request)
    if (unauthorized) return unauthorized

    // Parse and validate request body
    const body = await request.json()
    const validation = safeValidate(AlertCreateSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          ...validation.error,
        },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.ALERT_CREATE)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    const { token, condition, targetPrice, notifications } = validation.data

    const db = await getDb()
    const now = new Date()

    const newAlert: Alert = {
      userId,
      token: token.toUpperCase(),
      condition,
      targetPrice,
      active: true,
      notifications,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Alert>('alerts').insertOne(newAlert)

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.insertedId.toString(),
          token: newAlert.token,
          condition: newAlert.condition,
          targetPrice: newAlert.targetPrice,
          active: newAlert.active,
          notifications: newAlert.notifications,
          createdAt: newAlert.createdAt.toISOString(),
          updatedAt: newAlert.updatedAt.toISOString(),
        },
        message: 'Alert created successfully',
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitResult),
        },
      }
    )
  } catch (error) {
    console.error('POST /api/alerts error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create alert',
        message: 'An error occurred while creating your alert.',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// CLEANUP - Close connection on process exit
// ============================================================================

if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    if (client) {
      await client.close()
      client = null
    }
  })
}
