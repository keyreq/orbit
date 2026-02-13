# Diagnose Email Notification Issue

Your alert should have triggered, but you didn't receive an email. Let's diagnose why.

## Step 1: Check Your Alert and Preferences

Open **production app** (https://orbit-swart-nine.vercel.app/) and open browser console (F12), then run:

```javascript
const userId = localStorage.getItem('userId');

async function diagnoseEmailIssue() {
  console.log('🔍 DIAGNOSING EMAIL NOTIFICATION ISSUE...\n');

  // 1. Check user ID
  console.log('1️⃣ USER ID:', userId);
  if (!userId) {
    console.error('❌ No user ID found! Refresh the page.');
    return;
  }

  // 2. Check preferences
  console.log('\n2️⃣ CHECKING PREFERENCES...');
  const prefsRes = await fetch('/api/preferences', {
    headers: { 'x-user-id': userId }
  });
  const prefsData = await prefsRes.json();

  if (prefsData.success) {
    const prefs = prefsData.data;
    console.log('✅ Preferences found:');
    console.log('   Email:', prefs.email || '❌ NOT SET');
    console.log('   Channels:', prefs.channels);

    if (!prefs.email) {
      console.error('\n❌ PROBLEM: No email address configured!');
      console.log('   FIX: Go to Settings and add your email address.');
    }

    if (!prefs.channels.includes('email')) {
      console.warn('\n⚠️  WARNING: Email channel not enabled in preferences');
      console.log('   FIX: Go to Settings and enable "Email Alerts" channel.');
    }
  } else {
    console.error('❌ Failed to load preferences:', prefsData.error);
  }

  // 3. Check alerts
  console.log('\n3️⃣ CHECKING ALERTS...');
  const alertsRes = await fetch('/api/alerts', {
    headers: { 'x-user-id': userId }
  });
  const alertsData = await alertsRes.json();

  if (alertsData.success) {
    console.log('✅ Found', alertsData.data.length, 'alerts:');
    alertsData.data.forEach((alert, i) => {
      console.log(`\n   Alert ${i + 1}:`);
      console.log('   Token:', alert.token);
      console.log('   Condition:', alert.condition, alert.targetPrice);
      console.log('   Active:', alert.active);
      console.log('   Notification channels:', alert.notifications);

      if (!alert.notifications.includes('email')) {
        console.warn('   ⚠️  Email NOT selected for this alert');
      }
    });

    const btcAlerts = alertsData.data.filter(a => a.token === 'BTC' && a.active);
    if (btcAlerts.length === 0) {
      console.error('\n❌ PROBLEM: No active BTC alerts found!');
    }
  } else {
    console.error('❌ Failed to load alerts:', alertsData.error);
  }

  // 4. Check current BTC price
  console.log('\n4️⃣ CHECKING CURRENT BTC PRICE...');
  const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  const priceData = await priceRes.json();
  const btcPrice = priceData.bitcoin.usd;
  console.log('✅ Current BTC price: $' + btcPrice.toLocaleString());

  // 5. Check recent notifications
  console.log('\n5️⃣ CHECKING RECENT NOTIFICATIONS...');
  const notifsRes = await fetch('/api/notifications', {
    headers: { 'x-user-id': userId }
  });
  const notifsData = await notifsRes.json();

  if (notifsData.success) {
    console.log('✅ Found', notifsData.data.length, 'notifications:');
    notifsData.data.slice(0, 5).forEach((n, i) => {
      console.log(`   ${i + 1}. ${n.title} - ${n.createdAt}`);
    });

    const btcNotifs = notifsData.data.filter(n => n.token === 'BTC');
    if (btcNotifs.length === 0) {
      console.error('\n❌ PROBLEM: No BTC notifications created!');
      console.log('   This means the alert never triggered.');
    }
  } else {
    console.error('❌ Failed to load notifications:', notifsData.error);
  }

  // 6. Summary
  console.log('\n📊 DIAGNOSIS SUMMARY:\n');
  console.log('Current BTC Price: $' + btcPrice.toLocaleString());
  console.log('Your email:', prefsData.data?.email || 'NOT SET ❌');
  console.log('Email channel enabled:', prefsData.data?.channels?.includes('email') ? 'YES ✅' : 'NO ❌');
  console.log('Active BTC alerts:', alertsData.data?.filter(a => a.token === 'BTC' && a.active).length || 0);
  console.log('BTC notifications:', notifsData.data?.filter(n => n.token === 'BTC').length || 0);

  console.log('\n💡 LIKELY CAUSES:');
  if (!prefsData.data?.email) {
    console.log('1. ❌ Email address not configured in Settings');
  }
  if (!prefsData.data?.channels?.includes('email')) {
    console.log('2. ❌ Email channel not enabled in Settings');
  }
  const btcAlertsWithEmail = alertsData.data?.filter(a =>
    a.token === 'BTC' && a.active && a.notifications.includes('email')
  );
  if (btcAlertsWithEmail?.length === 0) {
    console.log('3. ❌ No BTC alerts have "email" selected in notification channels');
  }
  if (notifsData.data?.filter(n => n.token === 'BTC').length === 0) {
    console.log('4. ❌ Alert never triggered (check cooldown period - 1 hour between triggers)');
  }

  console.log('\n✅ TO FIX:');
  console.log('1. Go to Settings → Add your email address');
  console.log('2. Go to Settings → Enable "Email Alerts" channel');
  console.log('3. Go to Price Alerts → Edit your BTC alert → Check "Email" notification');
  console.log('4. Wait for cron to run again (or manually trigger via external cron service)');
}

diagnoseEmailIssue();
```

## Step 2: Test Email Directly

If Resend API key is configured in Vercel, test email directly:

```javascript
const userId = localStorage.getItem('userId');
fetch('/api/test-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId
  }
})
.then(r => r.json())
.then(data => {
  console.log('📧 TEST EMAIL RESULT:', data);
  if (data.success) {
    alert('✅ Test email sent to ' + data.data.email + '! Check your inbox.');
  } else {
    alert('❌ Email failed: ' + data.message);
    console.error('Error details:', data);
  }
});
```

## Step 3: Manually Trigger Alert

Force the alert to check immediately:

```javascript
fetch('https://orbit-swart-nine.vercel.app/api/cron/price-monitor')
  .then(r => r.json())
  .then(data => {
    console.log('⚡ Alert check triggered:', data);
    console.log('Refresh page and check notification bell icon!');
  });
```

## Common Issues and Fixes

### Issue 1: Email Not Configured
**Symptom:** Diagnosis shows "Email: NOT SET"
**Fix:**
1. Go to Settings in the app
2. Enter your email address
3. Click Save

### Issue 2: Email Channel Not Enabled
**Symptom:** Email configured but channel disabled
**Fix:**
1. Go to Settings
2. Toggle ON the "Email Alerts" switch
3. Click Save Settings

### Issue 3: Alert Doesn't Have Email Selected
**Symptom:** Alert exists but email not in notification channels
**Fix:**
1. Go to Price Alerts
2. Click Edit on your BTC alert
3. Check "Email" in notification channels
4. Save alert

### Issue 4: Alert in Cooldown
**Symptom:** Notification was created but no email sent
**Fix:** Alerts have 1-hour cooldown between triggers to prevent spam. Wait 1 hour or delete and recreate the alert.

### Issue 5: RESEND_API_KEY Not Working
**Symptom:** Test email shows "RESEND_API_KEY not configured"
**Fix:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Verify RESEND_API_KEY exists and starts with "re_"
3. Redeploy the app after confirming

### Issue 6: Email in Spam
**Symptom:** Everything looks correct but no email
**Fix:** Check your spam/junk folder for emails from "onboarding@resend.dev"

## Vercel Logs

If email should have been sent but wasn't, check Vercel logs:
1. Go to Vercel Dashboard
2. Your Project → Deployments
3. Click latest deployment → Functions
4. Look for `/api/cron/price-monitor` function logs
5. Search for `[Price Monitor]` or `[Email]` logs

Look for errors like:
- "No preferences found for user"
- "Email notification error"
- "RESEND_API_KEY not configured"
