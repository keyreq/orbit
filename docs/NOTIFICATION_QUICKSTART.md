# 🚀 Notification Quick Start Guide

Get your email and phone notifications working in 5 minutes!

---

## ✅ Prerequisites

You've already set up:
- ✅ Resend API Key
- ✅ Twilio Account SID, Auth Token, Phone Number
- ✅ Environment variables in `.env.local`

---

## 📝 Step 1: Enter Your Contact Info

1. **Open ORBIT:** http://localhost:3000
2. **Click "Settings"** in the sidebar (⚙️ icon at bottom)
3. **Enter your information:**
   - **Email:** Your actual email address
   - **Phone Number:** Your phone in E.164 format (e.g., `+14155552671`)
     - **Format:** `+[country code][area code][number]`
     - **Example (US):** `+14155552671`
     - **Example (UK):** `+447911123456`
4. **Enable channels:**
   - Toggle ON: **Email Alerts**
   - Toggle ON: **SMS Messages**
   - Toggle ON: **Phone Calls** (optional)
5. **Click "Save Settings"**

---

## 🧪 Step 2: Test Your Notifications

After saving, test each channel:

### Test Email
1. Click the **"Test"** button next to Email Alerts
2. Check your inbox (may take 10-30 seconds)
3. You should receive: "🚨 BTC Price Alert" email
4. ✅ or ❌ will appear next to the test button

### Test SMS
1. Click the **"Test"** button next to SMS Messages
2. Check your phone for a text message
3. You should receive: "📈 ORBIT ALERT: BTC is now above $50,000..."
4. ✅ or ❌ will appear

### Test Phone Call
1. Click the **"Test"** button next to Phone Calls
2. Your phone should ring within 10-20 seconds
3. Answer to hear the voice alert
4. ✅ or ❌ will appear

---

## 🔔 Step 3: Create a Real Alert

Now create an alert that will actually trigger:

1. **Go to "Price Alerts"** in sidebar
2. **Click "Create Alert"**
3. **Fill in:**
   - **Token Symbol:** `BTC`
   - **Condition:** `above`
   - **Target Price:** `1` (very low, will trigger immediately)
   - **Notification Methods:** Select **Email** and **SMS**
4. **Click "Create Alert"**

---

## 🏃 Step 4: Start the Price Monitor Worker

The worker checks prices every 30 seconds and triggers notifications:

```bash
# Open a NEW terminal (keep dev server running)
npm run worker
```

You should see:
```
🚀 Starting ORBIT Price Monitor Worker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Environment variables loaded
✅ MongoDB URI configured
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Worker started successfully
📊 Checking alerts every 30 seconds
🔔 Notifications will be sent when alerts trigger

[Price Monitor] Checking alerts...
[Price Monitor] Found 1 active alerts
[Price Monitor] Alert triggered: BTC above 1 (current: 51234)
[Price Monitor] Notification results: [...]
```

**Within 30 seconds**, you should receive:
- 📧 An email alert
- 📱 An SMS alert

---

## 🎉 Success!

If you received both notifications, your system is working!

---

## 🔧 Troubleshooting

### Email Not Received
1. Check spam folder
2. Verify `RESEND_API_KEY` in `.env.local`
3. Check Resend dashboard: https://resend.com/emails
4. Verify domain is set up (for production)

### SMS Not Received
1. Verify phone number format: `+[country][number]` (no spaces)
2. Check Twilio console: https://www.twilio.com/console/sms/logs
3. Ensure trial account phone is verified
4. Check Twilio account balance

### Phone Call Not Working
1. Same as SMS troubleshooting
2. Check Twilio Voice logs
3. Verify TwiML endpoint is accessible

### Worker Not Triggering
1. Make sure worker is running: `npm run worker`
2. Check MongoDB connection in worker logs
3. Verify alert has `active: true`
4. Wait 30 seconds for next check cycle

### Test Button Shows ❌
Hover over the ❌ to see the error message, then:
- Check `.env.local` has correct API keys
- Verify contact info is saved correctly
- Check browser console for errors

---

## 📊 How It Works

```
You create alert → Saved to MongoDB
          ↓
Worker checks every 30s → Fetches prices from CoinGecko
          ↓
Price meets condition? → Triggers NotificationService
          ↓
Sends to ALL enabled channels IN PARALLEL:
  - 🔔 In-app (MongoDB)
  - 📧 Email (Resend)
  - 📱 SMS (Twilio)
  - 📞 Phone (Twilio Voice)
  - 💬 Telegram (if configured)
  - 💼 Slack (if configured)
```

---

## 🎯 Next Steps

Now that notifications work:

1. **Create real alerts:**
   - Set actual price targets (e.g., BTC above $52,000)
   - Choose which channels to use per alert

2. **Add Telegram** (optional):
   - Talk to @BotFather on Telegram
   - Create bot, get token
   - Add token to `.env.local`
   - Get your chat ID from @userinfobot
   - Add to Settings page

3. **Add Slack** (optional):
   - Create Slack webhook
   - Add webhook URL to Settings page

4. **Configure cooldown:**
   - Default: 1 hour between same alert triggers
   - Edit `lib/workers/price-monitor.ts` line 86: `const cooldownMs = 3600000`

---

## 💡 Pro Tips

- **Testing:** Use low price targets to test quickly (e.g., BTC above $1)
- **Production:** Set realistic targets (e.g., BTC above $55,000)
- **Channels:** Email + In-app for most alerts, SMS/Phone for critical ones
- **Costs:** Email is free (3k/month), SMS costs ~$0.0075 each
- **Worker:** Keep worker running in background for continuous monitoring

---

## 📚 Need More Help?

- Full docs: `/docs/NOTIFICATIONS.md`
- API reference: `/docs/API_SPECIFICATION.md`
- Changelog: `/CHANGELOG.md`

---

**Ready to monitor crypto prices like a pro!** 🚀
