# 🚀 ORBIT Quick Start Implementation Guide

## From Prototype to Production in 12 Weeks

---

## 📦 Prerequisites

Before starting, ensure you have:

- **Node.js 20+** installed
- **Git** for version control
- **MongoDB Atlas** account (free tier is fine for development)
- **Redis Cloud** account (free tier available)
- **Vercel** account for deployment
- **API Keys** ready (see below)

---

## 🔑 Required API Keys

### Essential (Free Tier Available)

1. **Google Gemini API**
   - Get it: https://makersuite.google.com/app/apikey
   - Already using this! ✅

2. **MongoDB Atlas**
   - Get it: https://www.mongodb.com/cloud/atlas/register
   - Free tier: 512MB storage

3. **Redis Cloud**
   - Get it: https://redis.com/try-free/
   - Free tier: 30MB

4. **NextAuth.js Providers**
   - Google OAuth: https://console.cloud.google.com/apis/credentials
   - Apple Sign In: https://developer.apple.com/account/resources/identifiers/list

5. **Alchemy API**
   - Get it: https://dashboard.alchemy.com/
   - Free tier: 300M compute units/month

6. **CoinGecko API**
   - Get it: https://www.coingecko.com/en/api/pricing
   - Free tier: 10-50 calls/minute

### Optional (Enhance Later)

7. **CryptoPanic API** (News aggregation)
   - Get it: https://cryptopanic.com/developers/api/

8. **Firebase** (Push notifications)
   - Get it: https://console.firebase.google.com/

9. **Resend** (Email notifications)
   - Get it: https://resend.com/
   - Free tier: 3,000 emails/month

10. **Telegram Bot Token** (Telegram alerts)
    - Create bot: https://t.me/BotFather

---

## 🏗️ Step-by-Step Setup

### Step 1: Migrate to Next.js (Week 1, Day 1-2)

**Current Structure:**
```
orbit/
├── components/
├── services/
├── types.ts
├── App.tsx (Vite + React)
└── package.json
```

**Target Structure:**
```
orbit/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
├── components/
├── lib/
└── services/
```

**Commands:**
```bash
# 1. Create new Next.js app in separate folder
npx create-next-app@latest orbit-next --typescript --tailwind --app --no-src-dir

# 2. Copy your existing components
cp -r orbit/components orbit-next/components
cp -r orbit/services orbit-next/services
cp orbit/types.ts orbit-next/types.ts

# 3. Install additional dependencies
cd orbit-next
npm install @google/genai lucide-react recharts
npm install next-auth @auth/mongodb-adapter
npm install mongodb ioredis
npm install zod
```

**Convert App.tsx to app/layout.tsx:**
```tsx
// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ORBIT - Intelligent Crypto Command Center',
  description: 'Real-time crypto alerts, DeFi tracking, and AI-powered news',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**Convert to app/page.tsx:**
```tsx
// app/page.tsx
'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Dashboard } from '@/components/Dashboard'
import { NewsFeed } from '@/components/NewsFeed'
import { DeFiPortfolio } from '@/components/DeFiPortfolio'
import { AlertsView } from '@/components/AlertsView'
import { AppView } from '@/types'

export default function HomePage() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD)

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard />
      case AppView.NEWS: return <NewsFeed />
      case AppView.DEFI: return <DeFiPortfolio />
      case AppView.ALERTS: return <AlertsView />
      default: return <Dashboard />
    }
  }

  return (
    <div className="flex min-h-screen bg-orbit-900">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 p-10">
        {renderView()}
      </main>
    </div>
  )
}
```

### Step 2: Set Up Environment Variables (Week 1, Day 2)

**Create `.env.local`:**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/orbit?retryWrites=true&w=majority
REDIS_URL=redis://default:password@redis-server:6379

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret

# API Keys (Server-Side Only)
GEMINI_API_KEY=your-gemini-api-key
ALCHEMY_API_KEY=your-alchemy-api-key
COINGECKO_API_KEY=your-coingecko-api-key

# Notifications (Optional)
RESEND_API_KEY=your-resend-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
```

**Add to `.gitignore`:**
```
.env*.local
.env.production
```

### Step 3: Set Up Database (Week 1, Day 3)

**Create `lib/db/mongodb.ts`:**
```typescript
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development, use global variable to preserve connection
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production, create new client
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
```

**Create `lib/db/redis.ts`:**
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

redis.on('error', (err) => {
  console.error('Redis error:', err)
})

export default redis
```

**Create database indexes:**
```typescript
// scripts/setup-db.ts
import clientPromise from '@/lib/db/mongodb'

async function setupDatabase() {
  const client = await clientPromise
  const db = client.db()

  // Users collection
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('users').createIndex({ 'authProviderId': 1 })

  // Alerts collection
  await db.collection('alerts').createIndex({ userId: 1 })
  await db.collection('alerts').createIndex({ token: 1 })
  await db.collection('alerts').createIndex({ active: 1 })
  await db.collection('alerts').createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 7776000 } // Auto-delete after 90 days
  )

  // DeFi positions
  await db.collection('defi_positions').createIndex({ userId: 1 })
  await db.collection('defi_positions').createIndex({ walletAddress: 1 })

  console.log('✅ Database indexes created')
}

setupDatabase().catch(console.error)
```

**Run setup:**
```bash
npx tsx scripts/setup-db.ts
```

### Step 4: Implement Authentication (Week 1, Day 4-5)

**Create `lib/auth.ts`:**
```typescript
import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/db/mongodb'

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
```

**Create `app/api/auth/[...nextauth]/route.ts`:**
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**Create sign-in page `app/auth/signin/page.tsx`:**
```tsx
'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-orbit-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-orbit-800 p-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome to ORBIT</h1>
          <p className="mt-2 text-gray-400">
            Sign in to access your crypto command center
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full"
            variant="outline"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              {/* Google icon SVG */}
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Step 5: Move Gemini Service to Server-Side (Week 1, Day 5)

**CRITICAL FIX:** Your current implementation exposes API key in client code!

**Create `app/api/news/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY! // Server-side only
})

export async function POST(request: NextRequest) {
  // Verify authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { topic } = await request.json()

  try {
    const prompt = `
      Search for the latest real-time news, twitter/x discussions, and macro events affecting: "${topic}".
      Focus on the last 24-48 hours.

      Return JSON array with:
      - title, summary, source, url, sentiment ("BULLISH"/"BEARISH"/"NEUTRAL"), timestamp

      Provide at least 4 distinct items.
    `

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    })

    const data = JSON.parse(response.text)

    return NextResponse.json(data)
  } catch (error) {
    console.error('News fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
```

**Update `components/NewsFeed.tsx`:**
```typescript
// Replace geminiService import with API call
const fetchNews = async () => {
  setLoading(true)
  const response = await fetch('/api/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: query })
  })
  const items = await response.json()
  setNews(items)
  setLoading(false)
}
```

### Step 6: Implement Real-Time Prices (Week 2)

**Create `app/api/prices/stream/route.ts`:**
```typescript
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Subscribe to Redis price updates
      const subscriber = redis.duplicate()
      await subscriber.subscribe('price-updates')

      subscriber.on('message', (channel, message) => {
        const data = `data: ${message}\n\n`
        controller.enqueue(encoder.encode(data))
      })

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        subscriber.disconnect()
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

**Create `hooks/useRealTimePrices.ts`:**
```typescript
'use client'

import { useEffect, useState } from 'react'

export function useRealTimePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    const eventSource = new EventSource('/api/prices/stream')

    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data)
      setPrices(prev => ({
        ...prev,
        [update.symbol]: update.price
      }))
    }

    return () => eventSource.close()
  }, [])

  return { prices }
}
```

**Update `components/Dashboard.tsx` to use real prices:**
```tsx
'use client'

import { useRealTimePrices } from '@/hooks/useRealTimePrices'

export function Dashboard() {
  const { prices } = useRealTimePrices(['BTC', 'ETH', 'SOL'])

  return (
    <div>
      <h1>BTC: ${prices.BTC?.toLocaleString()}</h1>
      {/* ... */}
    </div>
  )
}
```

### Step 7: Create Background Worker for Alerts (Week 3)

**Create `workers/alert-monitor.ts`:**
```typescript
import { WebSocket } from 'ws'
import clientPromise from '@/lib/db/mongodb'
import redis from '@/lib/db/redis'

async function startAlertMonitor() {
  const client = await clientPromise
  const db = client.db()

  // Connect to Binance WebSocket
  const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr')

  ws.on('message', async (data: Buffer) => {
    const tickers = JSON.parse(data.toString())

    for (const ticker of tickers) {
      const symbol = ticker.s.replace('USDT', '')
      const price = parseFloat(ticker.c)

      // Cache price in Redis
      await redis.setex(`price:${symbol}`, 10, price)

      // Publish update
      await redis.publish('price-updates', JSON.stringify({
        symbol,
        price,
        change24h: parseFloat(ticker.P)
      }))

      // Check alerts
      const alerts = await db.collection('alerts').find({
        token: symbol,
        active: true
      }).toArray()

      for (const alert of alerts) {
        const shouldTrigger =
          (alert.condition === 'above' && price >= alert.targetPrice) ||
          (alert.condition === 'below' && price <= alert.targetPrice)

        if (shouldTrigger) {
          // Trigger alert
          await db.collection('alerts').updateOne(
            { _id: alert._id },
            { $set: { active: false, triggeredAt: new Date() } }
          )

          // Send notification (implement later)
          console.log(`🚨 Alert triggered: ${symbol} ${alert.condition} ${alert.targetPrice}`)
        }
      }
    }
  })

  console.log('✅ Alert monitor started')
}

startAlertMonitor().catch(console.error)
```

**Add script to `package.json`:**
```json
{
  "scripts": {
    "worker:alerts": "tsx watch workers/alert-monitor.ts"
  }
}
```

**Run worker in development:**
```bash
npm run worker:alerts
```

### Step 8: Deploy to Production (Week 12)

**Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add MONGODB_URI
vercel env add REDIS_URL
vercel env add NEXTAUTH_SECRET
# ... add all other env vars
```

**Deploy Workers to Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and init
railway login
railway init

# Deploy worker
railway up
```

---

## 🧪 Testing Your Implementation

### Test Authentication
```bash
# 1. Start dev server
npm run dev

# 2. Visit http://localhost:3000
# 3. Click "Sign In"
# 4. Sign in with Google
# 5. Should redirect to dashboard
```

### Test Real-Time Prices
```bash
# 1. Open browser console
# 2. Visit dashboard
# 3. Should see prices updating every few seconds
console.log('Checking EventSource connection...')
```

### Test Alerts
```bash
# 1. Create an alert in UI
# 2. Check MongoDB to verify it's saved
# 3. Check worker logs to see monitoring
# 4. Trigger alert by setting target price below current price
```

---

## 📊 Success Metrics

After completing this guide, you should have:

- ✅ Authentication working with Google OAuth
- ✅ Real-time price updates via WebSocket
- ✅ Alert creation and storage in MongoDB
- ✅ Background worker monitoring prices
- ✅ Secure API key management (server-side only)
- ✅ Production deployment on Vercel

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check connection string format
# Should be: mongodb+srv://username:password@cluster.mongodb.net/dbname
# Ensure IP whitelist includes your IP in MongoDB Atlas
```

### Issue: "NextAuth session undefined"
**Solution:**
```bash
# Generate new secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=your-generated-secret
```

### Issue: "WebSocket connection failed"
**Solution:**
```bash
# Check if worker is running
npm run worker:alerts

# Check Binance API status
curl https://api.binance.com/api/v3/ping
```

---

## 📚 Next Steps

Once you've completed this quick start:

1. **Add more features** from `DESIGN_ARCHITECTURE.md`
2. **Implement notifications** (email, Telegram, push)
3. **Add DeFi tracking** with wallet connection
4. **Enhance UI** with more interactive components
5. **Set up monitoring** with Sentry/Datadog
6. **Launch beta** to 10-20 users for feedback

---

## 🎓 Learning Resources

- **Next.js Docs:** https://nextjs.org/docs
- **NextAuth.js Tutorial:** https://next-auth.js.org/getting-started/example
- **MongoDB Node.js Driver:** https://www.mongodb.com/docs/drivers/node/current/
- **Redis with Node.js:** https://redis.io/docs/clients/nodejs/

---

**Questions?** Open an issue or ask in Discord/Telegram.

**Last Updated:** 2026-02-11
