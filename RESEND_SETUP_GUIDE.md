# 📧 Resend Email Setup Guide

## Why You Need This

Email notifications require the **Resend API** to send emails. Without it, email alerts will fail silently (in-app notifications will still work).

---

## Step-by-Step Setup

### 1. Create Resend Account

1. Go to: https://resend.com
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with your email (Google/GitHub login available)
4. Verify your email address

**Free Tier:**
- 100 emails per day
- 1 domain
- Perfect for testing and personal use

---

### 2. Generate API Key

1. After login, go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Give it a name: `ORBIT Production`
4. **Permission:** Select "Sending access" (default)
5. Click **"Create"**
6. **COPY THE KEY IMMEDIATELY** (starts with `re_`)
   - Example: `re_123abc456def789ghi012jkl345mno678pqr`
   - You won't be able to see it again!

---

### 3. Add to Vercel Environment Variables

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **"orbit"** project
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)
5. Click **"Add New"**
6. Fill in:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (paste your key)
   - **Environments:** Check all (Production, Preview, Development)
7. Click **"Save"**

---

### 4. Optional: Verify Domain (For Production Use)

**Why?** By default, Resend sends from `onboarding@resend.dev`. To use your own domain (e.g., `alerts@yourdomain.com`), verify your domain.

**Steps:**
1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain: `yourdomain.com`
4. Add the DNS records Resend provides (TXT, MX, CNAME)
5. Wait for verification (usually 5-15 minutes)
6. Update Vercel env var:
   - **Key:** `EMAIL_FROM`
   - **Value:** `ORBIT Alerts <alerts@yourdomain.com>`

**If you skip this step:** Emails will come from `onboarding@resend.dev` (works fine, just less professional)

---

### 5. Redeploy Your App

After adding `RESEND_API_KEY`:

**Option A: Automatic**
- Just push any commit to GitHub
- Vercel will auto-deploy with new env vars

**Option B: Manual**
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Check "Use existing Build Cache" is OFF
5. Click **"Redeploy"**

---

## Testing Email Notifications

### Method 1: Use Test Endpoint (Recommended)

1. Go to production app: https://orbit-swart-nine.vercel.app/
2. Open browser console (F12)
3. Run this code:

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
  console.log('Test Email Result:', data);
  if (data.success) {
    alert('✅ Test email sent! Check your inbox.');
  } else {
    alert('❌ Email failed: ' + data.message);
  }
});
```

### Method 2: Create Real Alert

1. Go to **Settings** → Add your email
2. Go to **Price Alerts** → Create new alert
3. Select **"Email"** as notification channel
4. Set BTC below $100,000 (will trigger immediately)
5. Wait for your external cron to run
6. Check your email inbox

---

## Troubleshooting

### ❌ "RESEND_API_KEY not configured"
- You forgot to add the API key to Vercel environment variables
- Or you didn't redeploy after adding it

### ❌ "No email configured"
- Go to **Settings** in the app
- Add your email address
- Save preferences

### ❌ "Resend API error: 403 Forbidden"
- Your API key is invalid or expired
- Regenerate a new key at https://resend.com/api-keys

### ❌ "Resend API error: 422 Unprocessable Entity"
- Your domain is not verified
- Either verify your domain OR remove `EMAIL_FROM` env var to use default

### ❌ Email not received
- Check spam/junk folder
- Verify email address in Settings is correct
- Check Resend dashboard logs: https://resend.com/emails
- Make sure alert has "email" in notification channels

---

## Production Checklist

- [ ] Resend account created
- [ ] API key generated (starts with `re_`)
- [ ] `RESEND_API_KEY` added to Vercel environment variables
- [ ] App redeployed after adding env var
- [ ] Email address added in app Settings
- [ ] Test email sent successfully
- [ ] Real alert email received

---

## Cost & Limits

**Free Tier:**
- 100 emails per day
- 1 verified domain
- All features included

**Paid Plans:**
- Pro: $20/mo for 50,000 emails/month
- Only needed if you have many users

For personal use with a few testers, **free tier is more than enough**.

---

## Support

- Resend Docs: https://resend.com/docs
- ORBIT Email Code: `lib/notifications/channels/email.ts`
- Test Endpoint: `app/api/test-email/route.ts`
