/**
 * Price Monitor Cron Endpoint
 *
 * This endpoint is triggered by Vercel Cron to check prices and send notifications
 * Configure in vercel.json to run every 30 seconds or 1 minute
 */

import { NextRequest, NextResponse } from 'next/server'
import { PriceMonitor } from '@/lib/workers/price-monitor'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Optional: Add auth header check for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Cron] Starting price monitor check...')

    // Create and run price monitor once
    const monitor = new PriceMonitor()
    await monitor.runOnce()

    return NextResponse.json({
      success: true,
      message: 'Price monitor check completed',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Price monitor error:', error)
    return NextResponse.json(
      {
        error: 'Price monitor failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
