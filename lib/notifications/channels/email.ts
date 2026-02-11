/**
 * Email Notification Channel
 *
 * Sends email notifications using Resend API
 * https://resend.com/docs/api-reference/emails/send-email
 */

import { NotificationChannel, NotificationPayload, NotificationResult, UserNotificationPreferences } from '../types'

export class EmailNotificationChannel extends NotificationChannel {
  channel = 'email' as const

  async send(
    payload: NotificationPayload,
    preferences: UserNotificationPreferences
  ): Promise<NotificationResult> {
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY not configured')
      }

      if (!preferences.email) {
        throw new Error('User email not configured')
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'ORBIT Alerts <alerts@orbit.app>',
          to: preferences.email,
          subject: `🚨 ${payload.token} Price Alert`,
          html: this.generateEmailHTML(payload),
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Resend API error: ${error}`)
      }

      const data = await response.json()

      return {
        channel: this.channel,
        success: true,
        messageId: data.id,
        sentAt: new Date(),
      }
    } catch (error) {
      console.error('Email notification error:', error)
      return {
        channel: this.channel,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date(),
      }
    }
  }

  validate(preferences: UserNotificationPreferences): boolean {
    return !!preferences.email && !!process.env.RESEND_API_KEY
  }

  private generateEmailHTML(payload: NotificationPayload): string {
    const emoji = payload.condition === 'above' ? '📈' : '📉'
    const color = payload.condition === 'above' ? '#10b981' : '#ef4444'

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f1419; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1f2e 0%, #151a24 100%); border: 1px solid #2d3748; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #6366f1; font-size: 28px; margin: 0 0 8px 0;">ORBIT</h1>
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">Price Alert Triggered</p>
      </div>

      <!-- Alert Box -->
      <div style="background: rgba(99, 102, 241, 0.1); border: 2px solid ${color}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">${emoji}</div>
          <h2 style="color: #ffffff; font-size: 32px; margin: 0 0 8px 0;">${payload.token}</h2>
          <p style="color: #9ca3af; font-size: 16px; margin: 0;">
            Price is now <span style="color: ${color}; font-weight: bold;">${payload.condition}</span> your target
          </p>
        </div>
      </div>

      <!-- Price Details -->
      <div style="background: #1a1f2e; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #9ca3af; font-size: 14px; padding: 8px 0;">Current Price:</td>
            <td style="color: #ffffff; font-size: 18px; font-weight: bold; text-align: right; padding: 8px 0;">
              $${payload.currentPrice.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style="color: #9ca3af; font-size: 14px; padding: 8px 0;">Target Price:</td>
            <td style="color: #6366f1; font-size: 18px; font-weight: bold; text-align: right; padding: 8px 0;">
              $${payload.targetPrice.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style="color: #9ca3af; font-size: 14px; padding: 8px 0;">Triggered At:</td>
            <td style="color: #ffffff; font-size: 14px; text-align: right; padding: 8px 0;">
              ${new Date(payload.timestamp).toLocaleString()}
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts"
           style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View in ORBIT
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 24px; border-top: 1px solid #2d3748;">
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
          This alert was triggered based on your settings in ORBIT.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings"
             style="color: #6366f1; text-decoration: none;">
            Manage Alert Settings
          </a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `
  }
}
