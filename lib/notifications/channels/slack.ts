/**
 * Slack Notification Channel
 *
 * Sends notifications via Slack Incoming Webhooks
 * https://api.slack.com/messaging/webhooks
 */

import { NotificationChannel, NotificationPayload, NotificationResult, UserNotificationPreferences } from '../types'

export class SlackNotificationChannel extends NotificationChannel {
  channel = 'slack' as const

  async send(
    payload: NotificationPayload,
    preferences: UserNotificationPreferences
  ): Promise<NotificationResult> {
    try {
      if (!preferences.slackWebhookUrl) {
        throw new Error('User Slack webhook URL not configured')
      }

      const emoji = payload.condition === 'above' ? '📈' : '📉'
      const color = payload.condition === 'above' ? '#10b981' : '#ef4444'

      // Slack Block Kit message
      const message = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji} ORBIT Price Alert`,
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Token:*\n${payload.token}`,
              },
              {
                type: 'mrkdwn',
                text: `*Condition:*\n${payload.condition.toUpperCase()}`,
              },
              {
                type: 'mrkdwn',
                text: `*Current Price:*\n$${payload.currentPrice.toLocaleString()}`,
              },
              {
                type: 'mrkdwn',
                text: `*Target Price:*\n$${payload.targetPrice.toLocaleString()}`,
              },
            ],
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Triggered at ${new Date(payload.timestamp).toLocaleString()}`,
              },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View in ORBIT',
                  emoji: true,
                },
                url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts`,
                style: 'primary',
              },
            ],
          },
        ],
        attachments: [
          {
            color: color,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*${payload.token}* has ${payload.condition === 'above' ? 'risen above' : 'fallen below'} your target price of *$${payload.targetPrice.toLocaleString()}*`,
                },
              },
            ],
          },
        ],
      }

      const response = await fetch(preferences.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Slack webhook error: ${error}`)
      }

      return {
        channel: this.channel,
        success: true,
        messageId: `slack-${Date.now()}`, // Slack doesn't return message IDs for webhooks
        sentAt: new Date(),
      }
    } catch (error) {
      console.error('Slack notification error:', error)
      return {
        channel: this.channel,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date(),
      }
    }
  }

  validate(preferences: UserNotificationPreferences): boolean {
    return !!preferences.slackWebhookUrl && preferences.slackWebhookUrl.startsWith('https://hooks.slack.com/')
  }
}
