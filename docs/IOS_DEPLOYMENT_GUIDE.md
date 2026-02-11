# iOS Mobile Deployment Guide

## Overview
This guide walks you through deploying ORBIT to iOS for testing and feedback.

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- MongoDB Atlas database (already configured)
- All API keys configured in environment variables

## Deployment Steps

### 1. Prepare for Deployment

**A. Create App Icons**
You need to create the following icons in the `public` folder:
- `icon-192.png` (192x192 px)
- `icon-512.png` (512x512 px)
- `apple-touch-icon.png` (180x180 px)
- `favicon.ico` (32x32 px)
- `splash-screen.png` (1170x2532 px for iPhone)

Use a tool like:
- https://realfavicongenerator.net/
- https://www.figma.com/ (design your icon)
- https://imageresizer.com/ (resize images)

**B. Verify Environment Variables**
Make sure you have all these configured:
```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# APIs
COINGECKO_API_KEY=...
GOOGLE_GEMINI_API_KEY=...

# Notifications
RESEND_API_KEY=...
EMAIL_FROM=ORBIT Alerts <onboarding@resend.dev>
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
TELEGRAM_BOT_TOKEN=...
SLACK_WEBHOOK_URL=...

# App URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 2. Deploy to Vercel

**A. Push to GitHub**
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Prepare for iOS deployment"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/orbit.git
git branch -M main
git push -u origin main
```

**B. Deploy on Vercel**

1. Go to https://vercel.com/
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Click "Environment Variables"
   - Add all variables from `.env.local`
   - Make sure to add them for Production, Preview, and Development
5. Click "Deploy"

**C. Update App URL**
Once deployed, update the environment variable:
```bash
NEXT_PUBLIC_APP_URL=https://orbit-xyz.vercel.app
```
Redeploy to apply the change.

### 3. Set Up Background Worker

The price monitoring worker needs to run separately. Options:

**Option A: Vercel Cron Jobs** (Recommended for MVP)
Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-alerts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Then create `app/api/cron/check-alerts/route.ts` that runs the price check logic.

**Option B: Separate Worker Service**
Deploy the worker to:
- Railway.app (free tier)
- Render.com (free tier)
- DigitalOcean App Platform

### 4. Test on iOS

**A. Access on Mobile Safari**
1. Open Safari on iPhone
2. Go to your Vercel URL: `https://your-app.vercel.app`
3. Test all features

**B. Install as PWA**
1. In Safari, tap the "Share" button (square with arrow)
2. Scroll and tap "Add to Home Screen"
3. Tap "Add"
4. The app will appear on your home screen like a native app

**C. Test Key Features**
- [ ] Dashboard loads correctly
- [ ] Price alerts work
- [ ] Notifications appear
- [ ] All navigation works
- [ ] Forms and inputs work on mobile
- [ ] Touch interactions feel native

### 5. Share for Testing

**Option A: Direct URL Sharing**
Share your Vercel URL with testers:
```
https://orbit-xyz.vercel.app
```

**Option B: QR Code**
Generate a QR code for easy access:
1. Go to https://qr-code-generator.com/
2. Enter your Vercel URL
3. Download and share the QR code

**Option C: TestFlight (For Native App)**
If you want a native iOS app distributed via TestFlight:
1. Use Capacitor to wrap the web app
2. Build for iOS using Xcode
3. Upload to App Store Connect
4. Invite testers via TestFlight

## Mobile Optimizations Already Done

✅ PWA manifest configured
✅ iOS meta tags added
✅ Touch-friendly UI with proper spacing
✅ Responsive design for all screen sizes
✅ Mobile-optimized navigation (hamburger menu)
✅ Notification panel positioned correctly
✅ Viewport configured for mobile
✅ Status bar styling for iOS

## Troubleshooting

### Issue: App doesn't install on iOS
- Make sure you have valid icons in `public` folder
- Check Safari doesn't have restrictions
- Try clearing cache and reloading

### Issue: Notifications don't work
- In-app notifications work in PWA
- Push notifications require native app or service worker
- For now, users see in-app notifications

### Issue: Worker not running
- Implement Vercel cron job (Option A above)
- Or deploy worker separately

### Issue: Environment variables not working
- Check Vercel dashboard under Settings > Environment Variables
- Make sure variables are added for all environments
- Redeploy after adding variables

## Next Steps

1. **Get App Icons**: Create professional icons for your app
2. **Deploy to Vercel**: Follow steps above
3. **Test on Your iPhone**: Install and test thoroughly
4. **Share with Testers**: Send URL or QR code to get feedback
5. **Iterate**: Make improvements based on feedback
6. **Consider Native App**: If you need App Store distribution, use Capacitor

## Resources

- Vercel Documentation: https://vercel.com/docs
- PWA on iOS: https://web.dev/learn/pwa/installation/
- Capacitor (for native): https://capacitorjs.com/
- App Icon Generator: https://realfavicongenerator.net/
