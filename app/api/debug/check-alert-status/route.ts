/**
 * Debug endpoint to check alert and notification status
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const db = await getDatabase()

    // Get user's alerts
    const alerts = await db.collection('alerts')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Get user's recent notifications
    const notifications = await db.collection('notifications')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Get user preferences
    const preferences = await db.collection('user_preferences')
      .findOne({ userId })

    // Get current BTC price
    const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    const priceData = await priceResponse.json()
    const btcPrice = priceData.bitcoin?.usd || 0

    return NextResponse.json({
      success: true,
      data: {
        userId,
        currentBtcPrice: btcPrice,
        alerts: alerts.map(a => ({
          id: a._id.toString(),
          token: a.token,
          condition: a.condition,
          targetPrice: a.targetPrice,
          active: a.active,
          notifications: a.notifications,
          lastTriggered: a.lastTriggered,
          createdAt: a.createdAt,
        })),
        notifications: notifications.map(n => ({
          id: n._id.toString(),
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt,
        })),
        preferences: preferences ? {
          email: preferences.email || 'Not set',
          channels: preferences.channels || [],
        } : null,
      }
    })

  } catch (error) {
    console.error('[Debug] Check alert status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
