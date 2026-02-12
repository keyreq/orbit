/**
 * Database Cleanup Cron Job
 *
 * Runs daily to clean up old data and prevent database bloat
 * Schedule: 0 2 * * * (2 AM UTC)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('[Cleanup Cron] Starting database cleanup...')
    const db = await getDatabase()

    const results = {
      oldNotifications: 0,
      expiredAlerts: 0,
      archivedAlerts: 0,
      oldDemoUsers: 0,
    }

    // 1. Delete old notifications (>30 days)
    const notificationCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const notificationsResult = await db.collection('notifications').deleteMany({
      createdAt: { $lt: notificationCutoff }
    })
    results.oldNotifications = notificationsResult.deletedCount
    console.log(`[Cleanup Cron] Deleted ${results.oldNotifications} old notifications (>30 days)`)

    // 2. Delete expired alerts (inactive for >90 days)
    const alertCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const alertsResult = await db.collection('alerts').deleteMany({
      active: false,
      updatedAt: { $lt: alertCutoff }
    })
    results.expiredAlerts = alertsResult.deletedCount
    console.log(`[Cleanup Cron] Deleted ${results.expiredAlerts} expired alerts (inactive >90 days)`)

    // 3. Archive old triggered alerts (last triggered >30 days ago)
    const archiveCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const archiveResult = await db.collection('alerts').updateMany(
      {
        lastTriggered: { $lt: archiveCutoff },
        archived: { $ne: true }
      },
      { $set: { archived: true, archivedAt: new Date() } }
    )
    results.archivedAlerts = archiveResult.modifiedCount
    console.log(`[Cleanup Cron] Archived ${results.archivedAlerts} old alerts (last triggered >30 days)`)

    // 4. Delete old demo users (demo-* users older than 7 days)
    const demoCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const demoUsersResult = await db.collection('user_preferences').deleteMany({
      userId: /^demo-/,
      createdAt: { $lt: demoCutoff }
    })
    results.oldDemoUsers = demoUsersResult.deletedCount
    console.log(`[Cleanup Cron] Deleted ${results.oldDemoUsers} old demo users (>7 days)`)

    // 5. Delete alerts from deleted demo users
    if (results.oldDemoUsers > 0) {
      const orphanedAlerts = await db.collection('alerts').deleteMany({
        userId: /^demo-/
      })
      console.log(`[Cleanup Cron] Deleted ${orphanedAlerts.deletedCount} orphaned demo alerts`)
    }

    console.log('[Cleanup Cron] Cleanup complete:', results)

    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed',
      timestamp: new Date().toISOString(),
      results: {
        deletedNotifications: results.oldNotifications,
        deletedExpiredAlerts: results.expiredAlerts,
        archivedAlerts: results.archivedAlerts,
        deletedDemoUsers: results.oldDemoUsers,
      },
      nextRun: 'Tomorrow at 2 AM UTC'
    })
  } catch (error) {
    console.error('[Cleanup Cron] Error during cleanup:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Database cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
