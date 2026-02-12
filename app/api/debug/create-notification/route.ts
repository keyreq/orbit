/**
 * Debug endpoint to manually create a notification in MongoDB
 * This bypasses all notification logic and directly inserts into the database
 */

import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDatabase()

    // Create a test notification directly
    const testNotification = {
      userId: 'demo-user',
      alertId: 'debug-alert-' + Date.now(),
      type: 'price_alert',
      title: 'BTC Price Alert',
      message: 'BTC went above $50,000. Current price: $95,000',
      token: 'BTC',
      condition: 'above',
      targetPrice: 50000,
      currentPrice: 95000,
      read: false,
      createdAt: new Date(),
    }

    const result = await db.collection('notifications').insertOne(testNotification)

    // Verify it was inserted by querying back
    const inserted = await db.collection('notifications').findOne({ _id: result.insertedId })

    return NextResponse.json({
      success: true,
      message: 'Test notification created directly in MongoDB!',
      notificationId: result.insertedId.toString(),
      verified: inserted ? 'Found in database' : 'NOT found in database',
      notification: testNotification
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create test notification',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
