/**
 * Notification System Types
 *
 * Core types for the multi-channel notification system
 */

import { NotificationType } from '@/types'

export interface NotificationPayload {
  alertId: string
  userId: string
  token: string
  condition: 'above' | 'below'
  targetPrice: number
  currentPrice: number
  timestamp: Date
  channels: NotificationType[]
}

export interface NotificationResult {
  channel: NotificationType
  success: boolean
  messageId?: string
  error?: string
  sentAt: Date
}

export interface NotificationConfig {
  // In-app
  enableInApp: boolean

  // Email (Resend)
  resendApiKey?: string
  emailFrom?: string

  // SMS (Twilio)
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioPhoneNumber?: string

  // Phone (Twilio Voice)
  twilioVoiceEnabled?: boolean

  // Telegram
  telegramBotToken?: string
  telegramChatId?: string

  // Slack
  slackWebhookUrl?: string
}

export interface UserNotificationPreferences {
  userId: string
  email?: string
  phoneNumber?: string
  telegramChatId?: string
  slackWebhookUrl?: string
  channels: NotificationType[]
}

export abstract class NotificationChannel {
  abstract channel: NotificationType
  abstract send(payload: NotificationPayload, preferences: UserNotificationPreferences): Promise<NotificationResult>
  abstract validate(preferences: UserNotificationPreferences): boolean
}
