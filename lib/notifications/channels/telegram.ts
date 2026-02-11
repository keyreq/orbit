/**
 * Telegram Notification Channel
 *
 * Sends notifications via Telegram Bot API
 * https://core.telegram.org/bots/api#sendmessage
 */

import { NotificationChannel, NotificationPayload, NotificationResult, UserNotificationPreferences } from '../types'

export class TelegramNotificationChannel extends NotificationChannel {
  channel = 'telegram' as const

  async send(
    payload: NotificationPayload,
    preferences: UserNotificationPreferences
  ): Promise<NotificationResult> {
    try {
      if (!process.env.TELEGRAM_BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN not configured')
      }

      if (!preferences.telegramChatId) {
        throw new Error('User Telegram chat ID not configured')
      }

      const emoji = payload.condition === 'above' ? '📈' : '📉'
      const color = payload.condition === 'above' ? '🟢' : '🔴'

      // Use Telegram's MarkdownV2 formatting
      const message = this.escapeMarkdown(`
${emoji} *ORBIT Price Alert*

${color} *${payload.token}* is now *${payload.condition}* your target price!

📊 *Current Price:* $${payload.currentPrice.toLocaleString()}
🎯 *Target Price:* $${payload.targetPrice.toLocaleString()}
⏰ *Time:* ${new Date(payload.timestamp).toLocaleString()}

[View in ORBIT](${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts)
      `.trim())

      const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: preferences.telegramChatId,
            text: message,
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Telegram API error: ${error}`)
      }

      const data = await response.json()

      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`)
      }

      return {
        channel: this.channel,
        success: true,
        messageId: data.result.message_id.toString(),
        sentAt: new Date(),
      }
    } catch (error) {
      console.error('Telegram notification error:', error)
      return {
        channel: this.channel,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date(),
      }
    }
  }

  validate(preferences: UserNotificationPreferences): boolean {
    return !!preferences.telegramChatId && !!process.env.TELEGRAM_BOT_TOKEN
  }

  /**
   * Escape special characters for Telegram MarkdownV2
   * https://core.telegram.org/bots/api#markdownv2-style
   */
  private escapeMarkdown(text: string): string {
    // Characters that need to be escaped in MarkdownV2
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']

    let escaped = text
    for (const char of specialChars) {
      escaped = escaped.split(char).join('\\' + char)
    }

    return escaped
  }
}
