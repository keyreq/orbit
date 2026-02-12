/**
 * Check MongoDB connection details
 * Run with: npx ts-node scripts/check-mongodb-connection.ts
 */

import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found')
  process.exit(1)
}

// Parse connection string to show details (without exposing password)
const url = new URL(MONGODB_URI)
const host = url.hostname
const database = url.pathname.replace('/', '')
const username = url.username

console.log('📊 MongoDB Connection Details:')
console.log(`   Host: ${host}`)
console.log(`   Username: ${username}`)
console.log(`   Database: ${database || 'orbit (default)'}`)
console.log(`   Full URI: ${MONGODB_URI.substring(0, 30)}...${MONGODB_URI.substring(MONGODB_URI.length - 20)}`)

async function checkConnection() {
  const client = new MongoClient(MONGODB_URI!)

  try {
    await client.connect()
    const db = client.db('orbit')
    const count = await db.collection('notifications').countDocuments({ userId: 'demo-user' })
    console.log(`\n✅ Connected successfully`)
    console.log(`📋 Notifications for demo-user: ${count}`)

    // Show recent ones
    const recent = await db.collection('notifications')
      .find({ userId: 'demo-user' })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray()

    console.log('\n📝 Most recent 3:')
    recent.forEach((n, i) => {
      console.log(`   ${i + 1}. ${n.token || 'unknown'} - ${n.message?.substring(0, 50) || 'no message'}`)
    })

  } catch (error) {
    console.error('❌ Connection failed:', error)
  } finally {
    await client.close()
  }
}

checkConnection()
