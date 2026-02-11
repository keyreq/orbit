/**
 * ORBIT In-App Notifications API Route
 *
 * GET /api/notifications - Fetch user's in-app notifications
 * PUT /api/notifications - Mark notifications as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

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

interface InAppNotification {
  _id?: ObjectId
  userId: string
  type: string
  title: string
  message: string
  metadata?: {
    token?: string
    price?: number
    condition?: string
    targetPrice?: number
  }
  read: boolean
  createdAt: Date
}

// ============================================================================
// GET /api/notifications - Fetch notifications
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from auth session
    const userId = 'demo-user'

    const db = await getDb()

    // Fetch unread notifications first, then read ones, limit to 50
    const notifications = await db
      .collection<InAppNotification>('notifications')
      .find({ userId })
      .sort({ read: 1, createdAt: -1 })
      .limit(50)
      .toArray()

    // Count unread
    const unreadCount = notifications.filter(n => !n.read).length

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.map(n => ({
          id: n._id?.toString(),
          type: n.type,
          title: n.title,
          message: n.message,
          metadata: n.metadata,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
        })),
        unreadCount,
      },
    })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT /api/notifications - Mark notifications as read
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    // TODO: Get userId from auth session
    const userId = 'demo-user'

    const body = await request.json()
    const { notificationIds, markAll } = body

    const db = await getDb()

    if (markAll) {
      // Mark all notifications as read
      await db
        .collection<InAppNotification>('notifications')
        .updateMany({ userId, read: false }, { $set: { read: true } })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await db
        .collection<InAppNotification>('notifications')
        .updateMany(
          {
            _id: { $in: notificationIds.map((id: string) => new ObjectId(id)) },
            userId,
          },
          { $set: { read: true } }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
    })
  } catch (error) {
    console.error('PUT /api/notifications error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notifications',
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
