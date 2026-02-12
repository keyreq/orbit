/**
 * Price Monitor Worker
 *
 * Monitors cryptocurrency prices and triggers alerts when conditions are met
 * This worker should run periodically (e.g., every 30 seconds)
 */

import { MongoClient, Db } from 'mongodb'
import { notificationService } from '../notifications/NotificationService'
import { NotificationPayload, UserNotificationPreferences } from '../notifications/types'
import { NotificationType } from '@/types'

interface Alert {
  _id: any
  userId: string
  token: string
  condition: 'above' | 'below'
  targetPrice: number
  active: boolean
  notifications: NotificationType[]
  lastTriggered?: Date
  createdAt: Date
  updatedAt: Date
}

interface UserPreferences {
  _id: any
  userId: string
  email?: string
  phoneNumber?: string
  telegramChatId?: string
  slackWebhookUrl?: string
  channels: NotificationType[]
}

export class PriceMonitor {
  private isRunning = false
  private intervalId?: NodeJS.Timeout

  /**
   * Start the price monitoring worker
   */
  start(intervalMs: number = 30000) {
    if (this.isRunning) {
      console.warn('Price monitor is already running')
      return
    }

    console.log(`Starting price monitor (checking every ${intervalMs}ms)`)
    this.isRunning = true

    // Run immediately, then on interval
    this.checkAlerts()

    this.intervalId = setInterval(() => {
      this.checkAlerts()
    }, intervalMs)
  }

  /**
   * Stop the price monitoring worker
   */
  stop() {
    if (!this.isRunning) {
      return
    }

    console.log('Stopping price monitor')
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  /**
   * Check all active alerts and trigger notifications if needed
   */
  private async checkAlerts() {
    try {
      console.log('[Price Monitor] Checking alerts...')

      const db = await this.getDb()

      // Fetch all active alerts
      const alerts = await db
        .collection<Alert>('alerts')
        .find({ active: true })
        .toArray()

      if (alerts.length === 0) {
        console.log('[Price Monitor] No active alerts')
        return
      }

      console.log(`[Price Monitor] Found ${alerts.length} active alerts`)

      // Get unique tokens
      const tokens = [...new Set(alerts.map((a) => a.token))]

      // Fetch current prices
      const prices = await this.getCurrentPrices(tokens)

      // Check each alert
      for (const alert of alerts) {
        const currentPrice = prices[alert.token]

        if (!currentPrice) {
          console.warn(`[Price Monitor] No price data for ${alert.token}`)
          continue
        }

        // Check if alert condition is met
        const conditionMet =
          (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.condition === 'below' && currentPrice <= alert.targetPrice)

        if (conditionMet) {
          // Check if alert was recently triggered (avoid spam)
          const cooldownMs = 3600000 // 1 hour
          if (alert.lastTriggered && Date.now() - alert.lastTriggered.getTime() < cooldownMs) {
            console.log(
              `[Price Monitor] Alert ${alert._id} in cooldown (last triggered ${alert.lastTriggered})`
            )
            continue
          }

          console.log(
            `[Price Monitor] Alert triggered: ${alert.token} ${alert.condition} ${alert.targetPrice} (current: ${currentPrice})`
          )

          // Trigger notification
          await this.triggerAlert(alert, currentPrice, db)
        }
      }

      console.log('[Price Monitor] Check complete')
    } catch (error) {
      console.error('[Price Monitor] Error checking alerts:', error)
    }
  }

  /**
   * Trigger notification for an alert
   */
  private async triggerAlert(alert: Alert, currentPrice: number, db: Db) {
    try {
      // Fetch user preferences
      const userPrefs = await db.collection<UserPreferences>('user_preferences').findOne({
        userId: alert.userId,
      })

      if (!userPrefs) {
        console.warn(`[Price Monitor] No preferences found for user ${alert.userId}`)
        return
      }

      // Build notification payload
      const payload: NotificationPayload = {
        alertId: alert._id.toString(),
        userId: alert.userId,
        token: alert.token,
        condition: alert.condition,
        targetPrice: alert.targetPrice,
        currentPrice,
        timestamp: new Date(),
        channels: alert.notifications,
      }

      // Build user preferences
      const preferences: UserNotificationPreferences = {
        userId: alert.userId,
        email: userPrefs.email,
        phoneNumber: userPrefs.phoneNumber,
        telegramChatId: userPrefs.telegramChatId,
        slackWebhookUrl: userPrefs.slackWebhookUrl,
        channels: userPrefs.channels,
      }

      // Send notifications
      const results = await notificationService.sendNotification(payload, preferences)

      console.log(`[Price Monitor] Notification results:`, results)

      // Update alert lastTriggered timestamp
      await db.collection('alerts').updateOne(
        { _id: alert._id },
        {
          $set: {
            lastTriggered: new Date(),
            updatedAt: new Date(),
          },
        }
      )

      // Optionally: Disable one-time alerts
      // await db.collection('alerts').updateOne(
      //   { _id: alert._id },
      //   { $set: { active: false } }
      // )
    } catch (error) {
      console.error(`[Price Monitor] Error triggering alert ${alert._id}:`, error)
    }
  }

  /**
   * Fetch current prices for tokens
   * In production, use real-time price feeds (Binance WebSocket, CoinGecko, etc.)
   */
  private async getCurrentPrices(tokens: string[]): Promise<Record<string, number>> {
    try {
      // Use CoinGecko API (free tier)
      // Map token symbols to CoinGecko IDs
      const coinIds = tokens.map((token) => this.tokenToCoinGeckoId(token)).join(',')

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
      )

      if (!response.ok) {
        throw new Error('CoinGecko API error')
      }

      const data = await response.json()

      // Convert back to token symbols
      const prices: Record<string, number> = {}
      tokens.forEach((token) => {
        const coinId = this.tokenToCoinGeckoId(token)
        if (data[coinId]?.usd) {
          prices[token] = data[coinId].usd
        }
      })

      return prices
    } catch (error) {
      console.error('[Price Monitor] Error fetching prices:', error)
      return {}
    }
  }

  /**
   * Map token symbols to CoinGecko IDs
   */
  private tokenToCoinGeckoId(token: string): string {
    const mapping: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      SOL: 'solana',
      BNB: 'binancecoin',
      XRP: 'ripple',
      ADA: 'cardano',
      DOGE: 'dogecoin',
      MATIC: 'matic-network',
      DOT: 'polkadot',
      AVAX: 'avalanche-2',
    }

    return mapping[token.toUpperCase()] || token.toLowerCase()
  }

  /**
   * Get database connection
   */
  private async getDb() {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not configured')
    }
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    return client.db('orbit')
  }
}

// Export singleton instance
export const priceMonitor = new PriceMonitor()
