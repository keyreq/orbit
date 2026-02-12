/**
 * Debug endpoint to check alerts in database
 */

import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDatabase()
    const alerts = await db.collection('alerts').find({}).toArray()
    const preferences = await db.collection('user_preferences').find({}).toArray()

    return NextResponse.json({
      success: true,
      alertCount: alerts.length,
      alerts: alerts.map(a => ({
        id: a._id.toString(),
        token: a.token,
        condition: a.condition,
        targetPrice: a.targetPrice,
        active: a.active,
        notifications: a.notifications,
        userId: a.userId,
      })),
      preferencesCount: preferences.length,
      preferences: preferences.map(p => ({
        userId: p.userId,
        email: p.email,
        phoneNumber: p.phoneNumber,
        channels: p.channels,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch debug info',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
