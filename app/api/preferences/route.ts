/**
 * User Notification Preferences API
 *
 * Manages user notification channel settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { z } from 'zod'
import { safeValidate } from '@/lib/validation'
import { requireAuth } from '@/lib/session'

// Schema for user preferences
const PreferencesSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +14155552671)')
    .optional(),
  telegramChatId: z.string().optional(),
  slackWebhookUrl: z
    .string()
    .url()
    .startsWith('https://hooks.slack.com/', 'Must be a valid Slack webhook URL')
    .optional(),
  channels: z
    .array(z.enum(['in-app', 'email', 'sms', 'phone', 'telegram', 'slack']))
    .min(1)
    .max(6)
    .optional(),
})

async function getDb() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not configured')
  }
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  return client.db('orbit')
}

/**
 * GET /api/preferences
 *
 * Fetch user notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { userId, unauthorized } = requireAuth(request)
    if (unauthorized) return unauthorized

    const db = await getDb()
    const preferences = await db.collection('user_preferences').findOne({ userId })

    if (!preferences) {
      // Return default preferences
      return NextResponse.json(
        {
          success: true,
          data: {
            userId,
            channels: ['in-app'],
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: preferences.userId,
          email: preferences.email,
          phoneNumber: preferences.phoneNumber,
          telegramChatId: preferences.telegramChatId,
          slackWebhookUrl: preferences.slackWebhookUrl,
          channels: preferences.channels || ['in-app'],
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET preferences error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch preferences',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/preferences
 *
 * Update user notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const { userId, unauthorized } = requireAuth(request)
    if (unauthorized) return unauthorized

    const body = await request.json()

    // Validate input
    const validation = safeValidate(PreferencesSchema, body)
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

    const db = await getDb()

    // Update or insert preferences
    await db.collection('user_preferences').updateOne(
      { userId },
      {
        $set: {
          ...validation.data,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    // Fetch updated preferences
    const updated = await db.collection('user_preferences').findOne({ userId })

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: 'Preferences updated successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT preferences error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update preferences',
      },
      { status: 500 }
    )
  }
}
