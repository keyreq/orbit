import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDatabase()
    
    // Create a test notification
    const testNotification = {
      userId: 'demo-user',
      alertId: 'test-alert-' + Date.now(),
      type: 'price_alert',
      title: 'Test Notification',
      message: 'This is a test in-app notification to verify the system is working',
      token: 'BTC',
      condition: 'above',
      targetPrice: 50000,
      currentPrice: 95000,
      read: false,
      createdAt: new Date(),
    }
    
    const result = await db.collection('notifications').insertOne(testNotification)
    
    return NextResponse.json({
      success: true,
      message: 'Test notification created!',
      notificationId: result.insertedId.toString(),
      notification: testNotification
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create test notification',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
