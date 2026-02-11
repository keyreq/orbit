/**
 * Start Price Monitoring Worker
 *
 * This script starts the background worker that monitors prices
 * and triggers alert notifications.
 *
 * Usage: npm run worker
 */

// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

// Import worker
import { priceMonitor } from '../lib/workers/price-monitor'

console.log('🚀 Starting ORBIT Price Monitor Worker')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

// Verify environment
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found')
  process.exit(1)
}

console.log('✅ Environment variables loaded')
console.log('✅ MongoDB URI configured')

// Start worker (checks every 30 seconds)
priceMonitor.start(30000)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✅ Worker started successfully')
console.log('📊 Checking alerts every 30 seconds')
console.log('🔔 Notifications will be sent when alerts trigger')
console.log('')
console.log('Press Ctrl+C to stop the worker')

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏸️  Shutting down worker...')
  priceMonitor.stop()
  console.log('✅ Worker stopped')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\n⏸️  Shutting down worker...')
  priceMonitor.stop()
  console.log('✅ Worker stopped')
  process.exit(0)
})
