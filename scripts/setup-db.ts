/**
 * Database Setup Script
 *
 * This script creates all necessary indexes for the MongoDB database.
 * Run this after setting up your MongoDB Atlas cluster.
 *
 * Usage: npm run setup-db
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Verify environment variable is loaded
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local')
  console.error('📝 Please add your MongoDB connection string to .env.local')
  console.error('   Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/orbit')
  process.exit(1)
}

console.log('✅ Environment variables loaded')
console.log(`📍 MongoDB URI: ${process.env.MONGODB_URI.substring(0, 30)}...`)

// Now import the mongodb client
import { MongoClient } from 'mongodb'

async function setupDatabase() {
  console.log('\n🚀 Starting database setup...\n')

  let client: MongoClient | null = null

  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI!)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('orbit')

    // Users Collection
    console.log('\n📝 Setting up users collection...')
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ authProvider: 1 })
    await db.collection('users').createIndex({ authProviderId: 1 })
    await db.collection('users').createIndex({ createdAt: 1 })
    console.log('✅ Users collection indexes created')

    // Alerts Collection
    console.log('\n📝 Setting up alerts collection...')
    await db.collection('alerts').createIndex({ userId: 1 })
    await db.collection('alerts').createIndex({ token: 1 })
    await db.collection('alerts').createIndex({ active: 1 })
    await db.collection('alerts').createIndex({ userId: 1, active: 1 })
    await db.collection('alerts').createIndex({ token: 1, active: 1 })
    // TTL index: Auto-delete alerts after 90 days
    await db.collection('alerts').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 7776000 } // 90 days
    )
    console.log('✅ Alerts collection indexes created')

    // DeFi Positions Collection
    console.log('\n📝 Setting up defi_positions collection...')
    await db.collection('defi_positions').createIndex({ userId: 1 })
    await db.collection('defi_positions').createIndex({ walletAddress: 1 })
    await db.collection('defi_positions').createIndex({ userId: 1, walletAddress: 1 })
    await db.collection('defi_positions').createIndex({ protocol: 1 })
    await db.collection('defi_positions').createIndex({ lastSyncedAt: 1 })
    console.log('✅ DeFi positions collection indexes created')

    // Wallets Collection
    console.log('\n📝 Setting up wallets collection...')
    await db.collection('wallets').createIndex({ userId: 1 })
    await db.collection('wallets').createIndex({ address: 1 }, { unique: true })
    await db.collection('wallets').createIndex({ userId: 1, address: 1 })
    console.log('✅ Wallets collection indexes created')

    // News Cache Collection
    console.log('\n📝 Setting up news_cache collection...')
    await db.collection('news_cache').createIndex({ topic: 1 })
    // TTL index: Auto-delete cached news after 6 hours
    await db.collection('news_cache').createIndex(
      { cachedAt: 1 },
      { expireAfterSeconds: 21600 } // 6 hours
    )
    console.log('✅ News cache collection indexes created')

    // Notifications Collection
    console.log('\n📝 Setting up notifications collection...')
    await db.collection('notifications').createIndex({ userId: 1 })
    await db.collection('notifications').createIndex({ userId: 1, read: 1 })
    await db.collection('notifications').createIndex({ createdAt: 1 })
    // TTL index: Auto-delete old notifications after 30 days
    await db.collection('notifications').createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 2592000 } // 30 days
    )
    console.log('✅ Notifications collection indexes created')

    console.log('\n🎉 Database setup completed successfully!')
    console.log('\n📊 Collections created:')
    console.log('  - users (authentication and user data)')
    console.log('  - alerts (price alerts and monitoring)')
    console.log('  - defi_positions (DeFi protocol positions)')
    console.log('  - wallets (connected wallet addresses)')
    console.log('  - news_cache (cached news data)')
    console.log('  - notifications (user notifications)')

    console.log('\n🔍 Indexes created with:')
    console.log('  - Unique constraints on email and wallet addresses')
    console.log('  - Compound indexes for efficient queries')
    console.log('  - TTL indexes for automatic data cleanup')

  } catch (error) {
    console.error('\n❌ Error setting up database:', error)
    if (error instanceof Error) {
      console.error('   Message:', error.message)
    }
    process.exit(1)
  } finally {
    // Close the connection
    if (client) {
      await client.close()
      console.log('\n✅ Database connection closed')
    }
  }
}

// Run the setup
setupDatabase()
