/**
 * Test Email Endpoint
 *
 * Manually trigger a test email to verify email functionality is working
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { EmailNotificationChannel } from '@/lib/notifications/channels/email'
import { NotificationPayload, UserNotificationPreferences } from '@/lib/notifications/types'
import { getDatabase } from '@/lib/db/mongodb'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { userId, unauthorized } = requireAuth(request)
    if (unauthorized) return unauthorized

    const db = await getDatabase()

    // Get user preferences
    const preferences = await db.collection('user_preferences').findOne({ userId })

    if (!preferences?.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'No email configured',
          message: 'Please add your email address in Settings before testing email notifications.',
        },
        { status: 400 }
      )
    }

    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'RESEND_API_KEY not configured',
          message: 'Email service is not configured. Please add RESEND_API_KEY to Vercel environment variables.',
          instructions: [
            '1. Go to https://resend.com and create an account',
            '2. Generate an API key',
            '3. Add RESEND_API_KEY to Vercel: Dashboard → Settings → Environment Variables',
            '4. Redeploy the application',
          ]
        },
        { status: 500 }
      )
    }

    // Create test notification payload
    const testPayload: NotificationPayload = {
      alertId: 'test-' + Date.now(),
      userId,
      token: 'BTC',
      condition: 'above',
      targetPrice: 50000,
      currentPrice: 66309,
      timestamp: new Date(),
      channels: ['email'],
    }

    const userPrefs: UserNotificationPreferences = {
      userId,
      email: preferences.email,
      phoneNumber: preferences.phoneNumber,
      telegramChatId: preferences.telegramChatId,
      slackWebhookUrl: preferences.slackWebhookUrl,
      channels: ['email'],
    }

    // Send test email
    const emailChannel = new EmailNotificationChannel()
    const result = await emailChannel.send(testPayload, userPrefs)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${preferences.email}`,
        data: {
          email: preferences.email,
          messageId: result.messageId,
          sentAt: result.sentAt,
        }
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Email send failed',
          message: result.error || 'Unknown error occurred',
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[Test Email] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Test email failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
