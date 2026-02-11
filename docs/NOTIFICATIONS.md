# 🔔 ORBIT Notification System

Complete multi-channel notification system for price alerts with 6 delivery methods.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Supported Channels](#supported-channels)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

ORBIT's notification system delivers price alerts through 6 different channels, all working in parallel:

- **In-App** - Browser notifications stored in MongoDB
- **Email** - HTML emails via Resend
- **SMS** - Text messages via Twilio
- **Phone Call** - Voice alerts via Twilio Voice
- **Telegram** - Bot messages via Telegram Bot API
- **Slack** - Rich messages via Slack Webhooks

---

## Supported Channels

### 1. 🔔 In-App Notifications

**Description:** Notifications stored in MongoDB and displayed in the app
**Setup Required:** None (works out of the box)
**Cost:** Free

**Features:**
- Stored in `notifications` collection
- Auto-expires after 30 days (TTL index)
- Read/unread status tracking
- Real-time updates (TODO: WebSocket)

---

### 2. 📧 Email Notifications

**Description:** HTML emails with styled alerts
**Provider:** [Resend](https://resend.com/)
**Cost:** Free tier (3,000 emails/month)

**Setup:**
1. Sign up at https://resend.com/
2. Get API key from https://resend.com/api-keys
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=ORBIT Alerts <alerts@yourdomain.com>
   ```
4. Add user email in preferences

**Features:**
- Beautiful HTML templates
- Price charts and formatting
- Direct links to app
- Mobile-responsive design

---

### 3. 📱 SMS Notifications

**Description:** Text message alerts
**Provider:** [Twilio](https://www.twilio.com/)
**Cost:** ~$0.0075 per SMS

**Setup:**
1. Sign up at https://www.twilio.com/
2. Get phone number and credentials from console
3. Add to `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
4. Add user phone number in E.164 format (+14155552671)

**Features:**
- Instant delivery
- Global reach
- Character limit: 160 chars
- Emojis supported

---

### 4. 📞 Phone Call Notifications

**Description:** Voice calls with text-to-speech
**Provider:** [Twilio Voice](https://www.twilio.com/voice)
**Cost:** ~$0.013 per minute

**Setup:**
1. Same Twilio credentials as SMS
2. Uses text-to-speech (TwiML)
3. Add user phone number in preferences

**Features:**
- Voice alerts for critical notifications
- Text-to-speech with natural voice
- Automatic call retry (configurable)
- Call logging and tracking

**How it works:**
1. Price alert triggers
2. System calls `/api/voice/twiml` endpoint
3. TwiML generates voice message
4. Twilio calls user's phone
5. User hears alert message

---

### 5. 💬 Telegram Notifications

**Description:** Messages via Telegram bot
**Provider:** [Telegram Bot API](https://core.telegram.org/bots)
**Cost:** Free

**Setup:**
1. Talk to [@BotFather](https://t.me/BotFather) on Telegram
2. Create bot with `/newbot`
3. Get bot token
4. Add to `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
5. User must:
   - Start chat with your bot
   - Send `/start` command
   - Get their chat ID
   - Add chat ID to preferences

**Features:**
- Rich formatting (Markdown)
- Inline buttons
- Media support
- Group chat support

**Getting Chat ID:**
```bash
# User sends message to bot, then run:
curl https://api.telegram.org/bot<TOKEN>/getUpdates

# Look for "chat":{"id":123456789}
```

---

### 6. 💼 Slack Notifications

**Description:** Rich messages to Slack channels
**Provider:** [Slack Webhooks](https://api.slack.com/messaging/webhooks)
**Cost:** Free

**Setup (Per User):**
1. Go to https://api.slack.com/apps
2. Create new app or use existing
3. Enable Incoming Webhooks
4. Add webhook to workspace
5. Copy webhook URL
6. User adds webhook to their preferences:
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
   ```

**Features:**
- Rich Block Kit messages
- Color-coded alerts
- Action buttons
- Channel or DM delivery

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│                 Price Monitor Worker                 │
│                  (runs every 30s)                    │
│                                                      │
│  1. Fetches active alerts from MongoDB              │
│  2. Gets current prices from CoinGecko              │
│  3. Checks if alert conditions are met              │
│  4. Triggers NotificationService if matched         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              Notification Service                    │
│                                                      │
│  • Orchestrates all channels in parallel            │
│  • Validates user preferences                       │
│  • Handles errors gracefully                        │
│  • Returns success/failure per channel              │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴───────────┬───────────┬──────────┐
        ▼          ▼           ▼           ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │ In-App │ │ Email  │ │  SMS   │ │ Phone  │ │Telegram│
   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

### File Structure

```
lib/notifications/
├── types.ts                      # Core types and interfaces
├── NotificationService.ts        # Main orchestrator
└── channels/
    ├── in-app.ts                 # In-app notifications
    ├── email.ts                  # Email (Resend)
    ├── sms.ts                    # SMS (Twilio)
    ├── phone.ts                  # Phone calls (Twilio)
    ├── telegram.ts               # Telegram bot
    └── slack.ts                  # Slack webhooks

lib/workers/
└── price-monitor.ts              # Background worker

app/api/
├── notifications/test/           # Test endpoint
├── preferences/                  # User preferences
└── voice/twiml/                  # TwiML for phone calls
```

---

## Setup Instructions

### 1. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and add:
# - RESEND_API_KEY (email)
# - TWILIO_* (SMS/phone)
# - TELEGRAM_BOT_TOKEN (telegram)
```

### 2. Set Up User Preferences

Users must configure their notification preferences via API:

```bash
# Set user preferences
curl -X PUT http://localhost:3000/api/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phoneNumber": "+14155552671",
    "telegramChatId": "123456789",
    "slackWebhookUrl": "https://hooks.slack.com/...",
    "channels": ["in-app", "email", "telegram"]
  }'
```

### 3. Start the Price Monitor Worker

```bash
# Terminal 1: Start Next.js app
npm run dev

# Terminal 2: Start price monitoring worker
npm run worker
```

The worker will:
- Check alerts every 30 seconds
- Fetch current prices from CoinGecko
- Trigger notifications when conditions are met
- Log all activity to console

---

## Usage

### Creating an Alert

```typescript
// Via API
const alert = await fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'BTC',
    condition: 'above',
    targetPrice: 50000,
    notifications: ['in-app', 'email', 'telegram']
  })
})
```

### How Notifications Trigger

1. **Worker checks alert:** BTC > $50,000 (condition met)
2. **Cooldown check:** Last triggered > 1 hour ago?
3. **Fetch user prefs:** Get email, phone, etc.
4. **Send in parallel:**
   - In-app: ✅ Saved to MongoDB
   - Email: ✅ Sent via Resend
   - Telegram: ✅ Sent via Bot API
5. **Update alert:** Set `lastTriggered` timestamp
6. **Log results:** Success/failure per channel

---

## API Reference

### Test Notification Channel

```
POST /api/notifications/test
```

**Request:**
```json
{
  "channel": "email"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "channel": "email",
    "success": true,
    "messageId": "abc123",
    "sentAt": "2026-02-11T..."
  },
  "message": "Test notification sent successfully via email"
}
```

### Get User Preferences

```
GET /api/preferences
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "demo-user",
    "email": "user@example.com",
    "phoneNumber": "+14155552671",
    "telegramChatId": "123456789",
    "slackWebhookUrl": "https://hooks.slack.com/...",
    "channels": ["in-app", "email", "telegram"]
  }
}
```

### Update User Preferences

```
PUT /api/preferences
```

**Request:**
```json
{
  "email": "newemail@example.com",
  "channels": ["in-app", "email", "sms", "telegram"]
}
```

---

## Testing

### Test Individual Channels

```bash
# Test email
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"channel": "email"}'

# Test SMS
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"channel": "sms"}'

# Test Telegram
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"channel": "telegram"}'
```

### Manual Alert Trigger

```bash
# Create test alert with low threshold
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "token": "BTC",
    "condition": "above",
    "targetPrice": 1,
    "notifications": ["in-app", "email"]
  }'

# Worker will trigger it on next check (30s)
```

---

## Troubleshooting

### Email Not Sending

**Problem:** Email test returns error
**Solutions:**
- Check `RESEND_API_KEY` is correct
- Verify domain is verified in Resend dashboard
- Check `EMAIL_FROM` uses verified domain
- Review Resend logs at https://resend.com/emails

### SMS/Phone Not Working

**Problem:** Twilio error
**Solutions:**
- Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- Check `TWILIO_PHONE_NUMBER` format (+1234567890)
- Ensure Twilio account has funds
- Check phone number is verified (trial accounts)
- Review Twilio console logs

### Telegram Not Delivering

**Problem:** Telegram returns error
**Solutions:**
- User must `/start` chat with bot first
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check user's `telegramChatId` is correct
- Test with: `curl https://api.telegram.org/bot<TOKEN>/getMe`

### Slack Webhook Failing

**Problem:** Slack returns 404 or 403
**Solutions:**
- Verify webhook URL starts with `https://hooks.slack.com/`
- Check webhook is still active in Slack settings
- Ensure user pasted full webhook URL (not truncated)
- Test webhook with: `curl -X POST <webhook> -d '{"text":"test"}'`

### Worker Not Running

**Problem:** Alerts not triggering
**Solutions:**
- Check `npm run worker` is running
- Review worker logs for errors
- Verify MongoDB connection
- Check CoinGecko API rate limits
- Ensure alerts have `active: true`

### Cooldown Period

**Problem:** Alert not triggering again
**Reason:** 1-hour cooldown prevents spam
**Solution:**
- Wait 1 hour, or
- Manually update alert: `db.alerts.updateOne({_id: ...}, {$unset: {lastTriggered: 1}})`

---

## Production Considerations

### Scalability

- **Worker**: Run single worker instance (avoid duplicate notifications)
- **Rate Limits**: Monitor API quotas (Resend, Twilio, etc.)
- **Queue**: Consider Redis queue for high volume (Bull, BullMQ)
- **Retry Logic**: Implement exponential backoff for failed notifications

### Monitoring

```typescript
// Add monitoring to NotificationService
const result = await notificationService.sendNotification(payload, prefs)

// Log to analytics
analytics.track('notification_sent', {
  userId: payload.userId,
  channels: result.map(r => r.channel),
  successes: result.filter(r => r.success).length,
  failures: result.filter(r => !r.success).length
})
```

### Cost Optimization

- **Email**: 3,000 free/month (Resend)
- **SMS**: ~$0.0075 each (use sparingly)
- **Phone**: ~$0.013/min (critical alerts only)
- **Others**: Free (in-app, Telegram, Slack)

**Recommendation:** Default to in-app + email, premium users get SMS/phone

---

## Future Enhancements

- [ ] Push notifications (Firebase, OneSignal)
- [ ] Discord webhooks
- [ ] WhatsApp Business API
- [ ] SMS delivery status webhooks
- [ ] Notification templates
- [ ] A/B testing for message content
- [ ] User notification history UI
- [ ] Bulk notification API
- [ ] Notification scheduling

---

## Support

For issues or questions:
- Check logs: `npm run worker` output
- Review API docs: `/docs/API_SPECIFICATION.md`
- Check Changelog: `/CHANGELOG.md`

---

**Last Updated:** 2026-02-11
**Maintainer:** ORBIT Development Team
