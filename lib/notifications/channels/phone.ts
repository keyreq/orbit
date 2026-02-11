/**
 * Phone Call Notification Channel
 *
 * Initiates voice calls using Twilio Voice API with text-to-speech
 * https://www.twilio.com/docs/voice/api/call-resource
 */

import { NotificationChannel, NotificationPayload, NotificationResult, UserNotificationPreferences } from '../types'

export class PhoneNotificationChannel extends NotificationChannel {
  channel = 'phone' as const

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

      // Create TwiML for text-to-speech
      const twimlUrl = await this.createTwiML(payload)

      // Twilio API uses Basic Auth
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64')

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Calls.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: preferences.phoneNumber,
            From: process.env.TWILIO_PHONE_NUMBER,
            Url: twimlUrl,
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
      console.error('Phone notification error:', error)
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

  /**
   * Creates a TwiML URL for the voice message
   * In production, this should be a hosted endpoint that returns TwiML XML
   */
  private async createTwiML(payload: NotificationPayload): Promise<string> {
    // Generate text-to-speech message
    const message = `This is an alert from ORBIT. ${payload.token} has ${payload.condition === 'above' ? 'risen above' : 'fallen below'} your target price of $${payload.targetPrice.toLocaleString()}. The current price is $${payload.currentPrice.toLocaleString()}. Log into ORBIT to view details.`

    // In a real implementation, you would:
    // 1. Create a /api/voice/twiml endpoint that returns TwiML
    // 2. Return the full URL to that endpoint
    // For now, we'll use Twilio's TwiML Bins or provide inline TwiML

    // URL-encode the TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">${message}</Say><Pause length="1"/><Say>Thank you.</Say></Response>`

    // Option 1: Use Twilio's TwiML Bins (requires manual setup)
    // Option 2: Host your own endpoint (recommended for production)
    // Option 3: Use inline TwiML via data URI (simple but has limitations)

    // For this implementation, we'll assume you have a hosted TwiML endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/api/voice/twiml?token=${encodeURIComponent(payload.token)}&condition=${payload.condition}&target=${payload.targetPrice}&current=${payload.currentPrice}`
  }
}
