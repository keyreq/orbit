/**
 * Notification Service
 *
 * Orchestrates sending notifications across all channels
 */

import { NotificationPayload, NotificationResult, UserNotificationPreferences, NotificationChannel } from './types'
import { InAppNotificationChannel } from './channels/in-app'
import { EmailNotificationChannel } from './channels/email'
import { SMSNotificationChannel } from './channels/sms'
import { PhoneNotificationChannel } from './channels/phone'
import { TelegramNotificationChannel } from './channels/telegram'
import { SlackNotificationChannel } from './channels/slack'

export class NotificationService {
  private channels: Map<string, NotificationChannel>

  constructor() {
    this.channels = new Map<string, NotificationChannel>()
    this.channels.set('in-app', new InAppNotificationChannel())
    this.channels.set('email', new EmailNotificationChannel())
    this.channels.set('sms', new SMSNotificationChannel())
    this.channels.set('phone', new PhoneNotificationChannel())
    this.channels.set('telegram', new TelegramNotificationChannel())
    this.channels.set('slack', new SlackNotificationChannel())
  }

  /**
   * Send notification to all specified channels in parallel
   */
  async sendNotification(
    payload: NotificationPayload,
    preferences: UserNotificationPreferences
  ): Promise<NotificationResult[]> {
    // Filter to only enabled channels
    const enabledChannels = payload.channels.filter((channel) =>
      preferences.channels.includes(channel)
    )

    console.log(`Sending notification to ${enabledChannels.length} channels:`, enabledChannels)

    // Send to all channels in parallel
    const promises = enabledChannels.map(async (channelName) => {
      const channel = this.channels.get(channelName)
      if (!channel) {
        console.warn(`Channel ${channelName} not found`)
        return {
          channel: channelName as any,
          success: false,
          error: 'Channel not found',
          sentAt: new Date(),
        }
      }

      // Validate channel before sending
      if (!channel.validate(preferences)) {
        console.warn(`Channel ${channelName} validation failed`)
        return {
          channel: channel.channel,
          success: false,
          error: 'Channel not configured or invalid preferences',
          sentAt: new Date(),
        }
      }

      // Send notification
      return await channel.send(payload, preferences)
    })

    const results = await Promise.allSettled(promises)

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`Channel ${enabledChannels[index]} error:`, result.reason)
        return {
          channel: enabledChannels[index] as any,
          success: false,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          sentAt: new Date(),
        }
      }
    })
  }

  /**
   * Test a single notification channel
   */
  async testChannel(
    channelName: string,
    preferences: UserNotificationPreferences
  ): Promise<NotificationResult> {
    const channel = this.channels.get(channelName)
    if (!channel) {
      return {
        channel: channelName as any,
        success: false,
        error: 'Channel not found',
        sentAt: new Date(),
      }
    }

    // Create test payload
    const testPayload: NotificationPayload = {
      alertId: 'test-alert',
      userId: preferences.userId,
      token: 'BTC',
      condition: 'above',
      targetPrice: 50000,
      currentPrice: 51000,
      timestamp: new Date(),
      channels: [channel.channel],
    }

    if (!channel.validate(preferences)) {
      return {
        channel: channel.channel,
        success: false,
        error: 'Channel not configured or invalid preferences',
        sentAt: new Date(),
      }
    }

    return await channel.send(testPayload, preferences)
  }
}

// Singleton instance
export const notificationService = new NotificationService()
