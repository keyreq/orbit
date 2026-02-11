/**
 * Notification Test API
 *
 * Allows users to test individual notification channels
 */

import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notifications/NotificationService'
import { UserNotificationPreferences } from '@/lib/notifications/types'
import { MongoClient } from 'mongodb'

async function getDb() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not configured')
  }
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  return client.db('orbit')
}

/**
 * POST /api/notifications/test
 *
 * Test a notification channel
 *
 * Body: { channel: 'email' | 'sms' | 'phone' | 'telegram' | 'slack' | 'in-app' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel } = body

    if (!channel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing channel parameter',
        },
        { status: 400 }
      )
    }

    // TODO: Get userId from auth session
    const userId = 'demo-user'

    // Fetch user preferences
    const db = await getDb()
    const userPrefs = await db.collection('user_preferences').findOne({ userId })

    if (!userPrefs) {
      return NextResponse.json(
        {
          success: false,
          error: 'User preferences not found',
          message: 'Please configure your notification preferences first',
        },
        { status: 404 }
      )
    }

    const preferences: UserNotificationPreferences = {
      userId,
      email: userPrefs.email,
      phoneNumber: userPrefs.phoneNumber,
      telegramChatId: userPrefs.telegramChatId,
      slackWebhookUrl: userPrefs.slackWebhookUrl,
      channels: userPrefs.channels || [],
    }

    // Test the channel
    const result = await notificationService.testChannel(channel, preferences)

    return NextResponse.json(
      {
        success: result.success,
        result,
        message: result.success
          ? `Test notification sent successfully via ${channel}`
          : `Failed to send test notification: ${result.error}`,
      },
      { status: result.success ? 200 : 500 }
    )
  } catch (error) {
    console.error('Notification test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
