/**
 * Debug endpoint to manually trigger alert checking
 * This bypasses the cron and runs the price monitor immediately with detailed logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { PriceMonitor } from '@/lib/workers/price-monitor'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    console.log('[Debug] ========== MANUAL ALERT TRIGGER START ==========')
    console.log('[Debug] Timestamp:', new Date().toISOString())

    const monitor = new PriceMonitor()
    await monitor.runOnce()

    console.log('[Debug] ========== MANUAL ALERT TRIGGER COMPLETE ==========')

    return NextResponse.json({
      success: true,
      message: 'Alert check triggered manually. Check Vercel logs for details.',
      timestamp: new Date().toISOString(),
      instructions: [
        'Go to Vercel Dashboard → Your Project → Deployments',
        'Click on the latest deployment → Functions tab',
        'Find /api/debug/trigger-alert function',
        'View logs to see detailed alert processing'
      ]
    })

  } catch (error) {
    console.error('[Debug] Manual trigger error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Manual trigger failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
