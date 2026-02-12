/**
 * In-App Notifications API
 *
 * GET: Fetch user's in-app notifications
 * POST: Mark notification as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'

export const dynamic = 'force-dynamic'

// GET all in-app notifications for user
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // For now, get all notifications (in production, filter by userId from session)
    // TODO: Add authentication and filter by session.user.id
    const userId = 'demo-user' // Temporary - replace with actual user ID from session

    const notifications = await db
      .collection('notifications')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications.map(n => ({
          id: n._id.toString(),
          type: 'price-alert',
          title: `${n.token} Price Alert`,
          message: `${n.token} went ${n.condition} $${n.targetPrice?.toLocaleString()}. Current price: $${n.currentPrice?.toLocaleString()}`,
          metadata: {
            token: n.token,
            price: n.currentPrice,
            condition: n.condition,
            targetPrice: n.targetPrice,
          },
          read: n.read || false,
          createdAt: n.createdAt,
        })),
        unreadCount: notifications.filter(n => !n.read).length,
      }
    })
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch notifications',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Mark notification(s) as read
export async function PUT(request: NextRequest) {
  try {
    const { notificationIds, markAll } = await request.json()

    const db = await getDatabase()
    const { ObjectId } = await import('mongodb')

    if (markAll) {
      // Mark all notifications as read for user
      const userId = 'demo-user' // TODO: Get from session
      await db.collection('notifications').updateMany(
        { userId, read: false },
        { $set: { read: true, readAt: new Date() } }
      )
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await db.collection('notifications').updateMany(
        { _id: { $in: notificationIds.map(id => new ObjectId(id)) } },
        { $set: { read: true, readAt: new Date() } }
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid request: provide notificationIds or markAll' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return NextResponse.json(
      {
        error: 'Failed to update notification',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
