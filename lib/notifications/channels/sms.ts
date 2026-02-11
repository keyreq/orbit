/**
 * SMS Notification Channel
 *
 * Sends SMS notifications using Twilio API
 * https://www.twilio.com/docs/sms/api/message-resource
 */

import { NotificationChannel, NotificationPayload, NotificationResult, UserNotificationPreferences } from '../types'

export class SMSNotificationChannel extends NotificationChannel {
  channel = 'sms' as const

  async send(
    payload: NotificationPayload,
    preferences: UserNotificationPreferences
  ): Promise<NotificationResult> {
    try {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        throw new Error('Twilio credentials not configured')
      }

      if (!preferences.phoneNumber) {
        throw new Error('User phone number not configured')
      }

      const emoji = payload.condition === 'above' ? '📈' : '📉'
      const message = `${emoji} ORBIT ALERT: ${payload.token} is now ${payload.condition} $${payload.targetPrice.toLocaleString()}. Current price: $${payload.currentPrice.toLocaleString()}. View details: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts`

      // Twilio API uses Basic Auth
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64')

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: preferences.phoneNumber,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: message,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Twilio API error: ${error}`)
      }

      const data = await response.json()

      return {
        channel: this.channel,
        success: true,
        messageId: data.sid,
        sentAt: new Date(),
      }
    } catch (error) {
      console.error('SMS notification error:', error)
      return {
        channel: this.channel,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date(),
      }
    }
  }

  validate(preferences: UserNotificationPreferences): boolean {
    return (
      !!preferences.phoneNumber &&
      !!process.env.TWILIO_ACCOUNT_SID &&
      !!process.env.TWILIO_AUTH_TOKEN &&
      !!process.env.TWILIO_PHONE_NUMBER
    )
  }
}
