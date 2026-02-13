/**
 * ORBIT Alerts API Route - Individual Alert Operations
 *
 * This file handles update and delete operations for individual alerts.
 *
 * Security Agent: security-agent
 * Created: 2026-02-11
 * Priority: HIGH
 */

import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { requireAuth } from '@/lib/session'
import { AlertUpdateSchema, safeValidate } from '@/lib/validation'
import { checkRateLimit, createRateLimitResponse, getRateLimitHeaders, RATE_LIMITS } from '@/lib/ratelimit'

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
  userId: string
  token: string
  condition: 'above' | 'below'
  targetPrice: number
  active: boolean
  notifications: string[]
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// PUT /api/alerts/[id] - Update alert
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { userId, unauthorized } = requireAuth(request)
    if (unauthorized) return unauthorized

    const { id } = await params

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid alert ID',
          message: 'The provided alert ID is not valid.',
        },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = safeValidate(AlertUpdateSchema, body)

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
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.ALERT_UPDATE)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    const db = await getDb()

    // Check if alert exists and belongs to user
    const existingAlert = await db.collection<Alert>('alerts').findOne({
      _id: new ObjectId(id),
      userId,
    })

    if (!existingAlert) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
          message: 'The specified alert does not exist or you do not have permission to modify it.',
        },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (validation.data.active !== undefined) {
      updateData.active = validation.data.active
    }
    if (validation.data.targetPrice !== undefined) {
      updateData.targetPrice = validation.data.targetPrice
    }
    if (validation.data.condition !== undefined) {
      updateData.condition = validation.data.condition
    }
    if (validation.data.notifications !== undefined) {
      updateData.notifications = validation.data.notifications
    }

    // Update alert
    const result = await db.collection<Alert>('alerts').updateOne(
      { _id: new ObjectId(id), userId },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Update failed',
          message: 'No changes were made to the alert.',
        },
        { status: 400 }
      )
    }

    // Fetch updated alert
    const updatedAlert = await db.collection<Alert>('alerts').findOne({
      _id: new ObjectId(id),
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedAlert?._id?.toString(),
          token: updatedAlert?.token,
          condition: updatedAlert?.condition,
          targetPrice: updatedAlert?.targetPrice,
          active: updatedAlert?.active,
          notifications: updatedAlert?.notifications,
          createdAt: updatedAlert?.createdAt.toISOString(),
          updatedAt: updatedAlert?.updatedAt.toISOString(),
        },
        message: 'Alert updated successfully',
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitResult),
        },
      }
    )
  } catch (error) {
    console.error('PUT /api/alerts/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update alert',
        message: 'An error occurred while updating your alert.',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/alerts/[id] - Delete alert
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { userId, unauthorized } = requireAuth(request)
    if (unauthorized) return unauthorized

    const { id } = await params

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid alert ID',
          message: 'The provided alert ID is not valid.',
        },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.ALERT_DELETE)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    const db = await getDb()

    // Delete alert (only if it belongs to user)
    const result = await db.collection<Alert>('alerts').deleteOne({
      _id: new ObjectId(id),
      userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alert not found',
          message: 'The specified alert does not exist or you do not have permission to delete it.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Alert deleted successfully',
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitResult),
        },
      }
    )
  } catch (error) {
    console.error('DELETE /api/alerts/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete alert',
        message: 'An error occurred while deleting your alert.',
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
