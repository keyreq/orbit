# ORBIT iOS Deployment Checklist

## Pre-Deployment

### Code Ready
- [x] PWA manifest configured (`public/manifest.json`)
- [x] iOS meta tags added to layout
- [x] Mobile-responsive UI
- [x] Touch-optimized interactions
- [ ] App icons created and placed in `public/` folder
  - [ ] `icon-192.png`
  - [ ] `icon-512.png`
  - [ ] `apple-touch-icon.png`
  - [ ] `favicon.ico`
  - [ ] `splash-screen.png`

### Environment Variables
- [ ] All API keys documented
- [ ] MongoDB URI ready for production
- [ ] Notification service credentials ready
- [ ] Worker service configuration ready

## Deployment Steps

### 1. Create App Icons
- [ ] Design or generate icons (see `CREATING_APP_ICONS.md`)
- [ ] Place all required icons in `public/` folder
- [ ] Test icons locally

### 2. Set Up Git & GitHub
- [ ] Initialize git repository
  ```bash
  git init
  git add .
  git commit -m "Initial commit for iOS deployment"
  ```
- [ ] Create GitHub repository
- [ ] Push code to GitHub
  ```bash
  git remote add origin https://github.com/yourusername/orbit.git
  git push -u origin main
  ```

### 3. Deploy to Vercel
- [ ] Sign up/login to Vercel (https://vercel.com)
- [ ] Import GitHub repository
- [ ] Configure environment variables in Vercel dashboard
  - [ ] MONGODB_URI
  - [ ] COINGECKO_API_KEY
  - [ ] GOOGLE_GEMINI_API_KEY
  - [ ] RESEND_API_KEY
  - [ ] EMAIL_FROM
  - [ ] TWILIO_ACCOUNT_SID
  - [ ] TWILIO_AUTH_TOKEN
  - [ ] TWILIO_PHONE_NUMBER
  - [ ] TELEGRAM_BOT_TOKEN (optional)
  - [ ] SLACK_WEBHOOK_URL (optional)
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Note your deployment URL: `https://_______.vercel.app`

### 4. Configure Worker Service
- [ ] Create `vercel.json` with cron configuration, OR
- [ ] Deploy worker to Railway/Render
- [ ] Test worker is running and checking alerts

### 5. Update Production URLs
- [ ] Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
- [ ] Redeploy to apply changes

## Testing Phase

### Test on Desktop
- [ ] Open deployed URL in browser
- [ ] Test all major features
- [ ] Check console for errors
- [ ] Verify API calls working

### Test on iPhone
- [ ] Open Safari on iPhone
- [ ] Navigate to deployed URL
- [ ] Test all features on mobile
- [ ] Check responsive layout
- [ ] Test touch interactions
- [ ] Verify notifications work

### Install as PWA
- [ ] Tap Share button in Safari
- [ ] Tap "Add to Home Screen"
- [ ] Verify app icon appears
- [ ] Open app from home screen
- [ ] Test PWA features
- [ ] Check status bar styling

## Features to Test

### Core Features
- [ ] Dashboard loads and displays data
- [ ] Price charts render correctly
- [ ] News feed loads articles
- [ ] DeFi portfolio displays correctly

### Alerts System
- [ ] Can create new alert
- [ ] Can edit existing alert
- [ ] Can delete alert
- [ ] Alert notification types selectable
- [ ] Alerts trigger at correct prices

### Notifications
- [ ] In-app notifications appear
- [ ] Notification bell shows unread count
- [ ] Notification dropdown is readable
- [ ] Can mark notifications as read
- [ ] Email notifications send (if configured)
- [ ] SMS notifications send (if configured)

### Mobile UX
- [ ] Hamburger menu works
- [ ] Navigation is smooth
- [ ] Forms are easy to fill
- [ ] Buttons are touch-friendly
- [ ] Scrolling is smooth
- [ ] No content cut off

## Sharing with Testers

### Prepare Test Instructions
- [ ] Write simple testing guide for users
- [ ] List key features to test
- [ ] Provide feedback form/method

### Distribution Methods
- [ ] Share direct URL via text/email
- [ ] Create QR code for easy access
- [ ] Post in relevant communities (optional)

### Collect Feedback
- [ ] Set up feedback form (Google Forms, Typeform)
- [ ] Monitor for bug reports
- [ ] Track feature requests

## Post-Launch Monitoring

### Monitor Systems
- [ ] Check Vercel deployment logs
- [ ] Monitor MongoDB usage
- [ ] Check API rate limits
- [ ] Monitor notification delivery

### Performance
- [ ] Check page load times
- [ ] Monitor API response times
- [ ] Review error logs

## Troubleshooting Common Issues

### Icons not showing
- Verify files exist in `public/` folder
- Check file names match manifest
- Clear browser cache
- Redeploy

### Environment variables not working
- Check Vercel dashboard settings
- Verify all required variables added
- Redeploy after adding variables

### Worker not running
- Verify cron job configured
- Check worker logs
- Test worker endpoint manually

### Mobile layout broken
- Test on different iPhone models
- Check viewport meta tags
- Verify responsive CSS

## Next Steps After Feedback

- [ ] Compile feedback and bug reports
- [ ] Prioritize fixes and improvements
- [ ] Implement changes
- [ ] Redeploy and re-test
- [ ] Consider native app development if needed

## Resources

- Deployment Guide: `docs/IOS_DEPLOYMENT_GUIDE.md`
- Icon Guide: `docs/CREATING_APP_ICONS.md`
- Vercel Docs: https://vercel.com/docs
- PWA Testing: https://web.dev/learn/pwa/

---

**Note**: This is a Progressive Web App (PWA). For App Store distribution, you'll need to wrap it with Capacitor and submit through Apple's review process.
