/**
 * Test Notification System
 *
 * This script tests the complete notification flow:
 * 1. Sets up user preferences
 * 2. Creates a test alert
 * 3. Triggers the notification manually
 *
 * Usage: npm run test:notifications
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { MongoClient } from 'mongodb'
import { notificationService } from '../lib/notifications/NotificationService'
import { NotificationPayload, UserNotificationPreferences } from '../lib/notifications/types'

async function testNotifications() {
  console.log('🧪 Testing ORBIT Notification System')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not configured')
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db('orbit')

  try {
    // Step 1: Check/create user preferences
    console.log('\n📋 Step 1: Checking user preferences...')

    let userPrefs = await db.collection('user_preferences').findOne({ userId: 'demo-user' })

    if (!userPrefs || !userPrefs.email || !userPrefs.phoneNumber) {
      console.log('⚠️  No preferences found. Please set up your contact info:')
      console.log('   1. Go to http://localhost:3000')
      console.log('   2. Click "Price Alerts"')
      console.log('   3. Click "Quick Setup" and enter your email & phone')
      console.log('   4. Run this script again')
      process.exit(1)
    }

    console.log('✅ User preferences found:')
    console.log(`   Email: ${userPrefs.email}`)
    console.log(`   Phone: ${userPrefs.phoneNumber}`)
    console.log(`   Channels: ${userPrefs.channels?.join(', ') || 'in-app'}`)

    // Step 2: Create notification payload
    console.log('\n🔔 Step 2: Creating test notification...')

    const payload: NotificationPayload = {
      alertId: 'test-alert-' + Date.now(),
      userId: 'demo-user',
      token: 'BTC',
      condition: 'above',
      targetPrice: 50000,
      currentPrice: 51234,
      timestamp: new Date(),
      channels: userPrefs.channels || ['in-app', 'email'],
    }

    const preferences: UserNotificationPreferences = {
      userId: userPrefs.userId,
      email: userPrefs.email,
      phoneNumber: userPrefs.phoneNumber,
      telegramChatId: userPrefs.telegramChatId,
      slackWebhookUrl: userPrefs.slackWebhookUrl,
      channels: userPrefs.channels || ['in-app'],
    }

    // Step 3: Send notifications
    console.log('\n📤 Step 3: Sending notifications...')
    console.log(`   Channels: ${payload.channels.join(', ')}`)

    const results = await notificationService.sendNotification(payload, preferences)

    // Step 4: Show results
    console.log('\n📊 Step 4: Results:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    for (const result of results) {
      const status = result.success ? '✅' : '❌'
      console.log(`   ${status} ${result.channel}: ${result.success ? 'Sent' : result.error}`)
      if (result.messageId) {
        console.log(`      Message ID: ${result.messageId}`)
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    console.log(`\n✅ Success: ${successCount}`)
    console.log(`❌ Failed: ${failureCount}`)

    if (successCount > 0) {
      console.log('\n🎉 Test completed! Check your:')
      if (results.some((r) => r.channel === 'email' && r.success)) {
        console.log('   📧 Email inbox')
      }
      if (results.some((r) => r.channel === 'sms' && r.success)) {
        console.log('   📱 Phone for SMS')
      }
      if (results.some((r) => r.channel === 'phone' && r.success)) {
        console.log('   📞 Phone for voice call')
      }
      if (results.some((r) => r.channel === 'telegram' && r.success)) {
        console.log('   💬 Telegram')
      }
      if (results.some((r) => r.channel === 'slack' && r.success)) {
        console.log('   💼 Slack')
      }
    }

    if (failureCount > 0) {
      console.log('\n⚠️  Some notifications failed. Common issues:')
      console.log('   - Email: Check RESEND_API_KEY in .env.local')
      console.log('   - SMS/Phone: Check TWILIO_* credentials in .env.local')
      console.log('   - Phone format: Must be E.164 (+14155552671)')
      console.log('   - Check the error messages above for details')
    }

    console.log('\n✅ Test complete!\n')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    if (error instanceof Error) {
      console.error('   Error:', error.message)
    }
    process.exit(1)
  } finally {
    await client.close()
  }
}

// Run test
testNotifications()
