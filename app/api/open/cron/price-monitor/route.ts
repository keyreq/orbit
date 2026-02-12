/**
 * Public Price Monitor Cron Endpoint
 *
 * This endpoint is intentionally unprotected for external cron services.
 * DO NOT include sensitive operations here.
 */

import { NextRequest, NextResponse } from 'next/server'
import { PriceMonitor } from '@/lib/workers/price-monitor'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('[Public Price Monitor] Triggered at:', new Date().toISOString())

    // Verify this is from a cron service (optional security)
    const userAgent = request.headers.get('user-agent') || ''
    console.log('[Public Price Monitor] User-Agent:', userAgent)

    // Create a new price monitor instance
    const monitor = new PriceMonitor()

    // Run a single check without starting the interval
    await monitor.runOnce()

    console.log('[Public Price Monitor] Check completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Price monitor check completed',
      timestamp: new Date().toISOString(),
      note: 'This is a public endpoint for external cron services'
    })
  } catch (error) {
    console.error('[Public Price Monitor] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Price monitor check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
