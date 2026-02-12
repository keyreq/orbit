/**
 * Script to create 3 test notifications directly in MongoDB
 * Run with: npx ts-node scripts/create-test-notifications.ts
 */

import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

async function createTestNotifications() {
  console.log('🔌 Connecting to MongoDB...')
  const client = new MongoClient(MONGODB_URI!)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('orbit')
    const notifications = db.collection('notifications')

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

    console.log('📝 Creating 3 test notifications...')
    const result = await notifications.insertMany(testNotifications)
    console.log(`✅ Created ${result.insertedCount} notifications`)

    // Verify they were created
    const count = await notifications.countDocuments({ userId: 'demo-user' })
    console.log(`📊 Total notifications for demo-user: ${count}`)

    // List the notifications
    const allNotifications = await notifications
      .find({ userId: 'demo-user' })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    console.log('\n📋 Recent notifications:')
    allNotifications.forEach((n, i) => {
      console.log(`  ${i + 1}. ${n.token} ${n.condition} $${n.targetPrice} (${n.read ? 'read' : 'unread'})`)
    })

    console.log('\n✨ Done! Check your notification bell icon.')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

createTestNotifications()
