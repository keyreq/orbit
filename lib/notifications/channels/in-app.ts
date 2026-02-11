/**
 * In-App Notification Channel
 *
 * Stores notifications in MongoDB for display in the app
 */

import { NotificationChannel, NotificationPayload, NotificationResult, UserNotificationPreferences } from '../types'
import { MongoClient, ObjectId } from 'mongodb'

export class InAppNotificationChannel extends NotificationChannel {
  channel = 'in-app' as const

  private async getDb() {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not configured')
    }
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    return client.db('orbit')
  }

  async send(
    payload: NotificationPayload,
    preferences: UserNotificationPreferences
  ): Promise<NotificationResult> {
    try {
      const db = await this.getDb()

      const notification = {
        userId: payload.userId,
        alertId: payload.alertId,
        type: 'price_alert' as const,
        title: `${payload.token} Price Alert`,
        message: `${payload.token} is now ${payload.condition} $${payload.targetPrice.toLocaleString()}. Current price: $${payload.currentPrice.toLocaleString()}`,
        data: {
          token: payload.token,
          condition: payload.condition,
          targetPrice: payload.targetPrice,
          currentPrice: payload.currentPrice,
        },
        read: false,
        createdAt: new Date(),
      }

      const result = await db.collection('notifications').insertOne(notification)

      return {
        channel: this.channel,
        success: true,
        messageId: result.insertedId.toString(),
        sentAt: new Date(),
      }
    } catch (error) {
      console.error('In-app notification error:', error)
      return {
        channel: this.channel,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date(),
      }
    }
  }

  validate(preferences: UserNotificationPreferences): boolean {
    // In-app notifications don't require additional setup
    return true
  }
}
