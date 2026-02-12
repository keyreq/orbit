/**
 * Simple endpoint to create 3 test notifications
 * Call this from browser: https://your-app.vercel.app/api/create-test-notifications
 */

import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDatabase()

    // Create 3 test notifications
    const testNotifications = [
      {
        userId: 'demo-user',
        alertId: 'test-btc-' + Date.now(),
        type: 'price_alert',
        title: 'BTC Price Alert',
        message: 'BTC went below $70,000. Current price: $65,571',
        token: 'BTC',
        condition: 'below',
        targetPrice: 70000,
        currentPrice: 65571,
        read: false,
        createdAt: new Date(),
      },
      {
        userId: 'demo-user',
        alertId: 'test-eth-' + Date.now(),
        type: 'price_alert',
        title: 'ETH Price Alert',
        message: 'ETH went above $10. Current price: $1,920',
        token: 'ETH',
        condition: 'above',
        targetPrice: 10,
        currentPrice: 1920,
        read: false,
        createdAt: new Date(),
      },
      {
        userId: 'demo-user',
        alertId: 'test-sol-' + Date.now(),
        type: 'price_alert',
        title: 'SOL Price Alert',
        message: 'SOL went above $1. Current price: $77',
        token: 'SOL',
        condition: 'above',
        targetPrice: 1,
        currentPrice: 77,
        read: false,
        createdAt: new Date(),
      }
    ]

    const result = await db.collection('notifications').insertMany(testNotifications)

    // Verify count
    const count = await db.collection('notifications').countDocuments({ userId: 'demo-user' })

    return NextResponse.json({
      success: true,
      message: '3 test notifications created!',
      insertedCount: result.insertedCount,
      totalNotifications: count,
      notifications: testNotifications.map(n => ({
        token: n.token,
        message: n.message
      }))
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create notifications',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
