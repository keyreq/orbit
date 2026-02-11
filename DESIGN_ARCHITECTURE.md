# ORBIT - Intelligent Crypto Command Center
## Comprehensive Design & Architecture Documentation

---

## 📋 Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Storage Architecture](#storage-architecture)
3. [Authentication Strategy](#authentication-strategy)
4. [Security Framework](#security-framework)
5. [Core Features & Enhancements](#core-features--enhancements)
6. [Notification System](#notification-system)
7. [API Integration Strategy](#api-integration-strategy)
8. [Technical Architecture](#technical-architecture)
9. [UI/UX Design Principles](#uiux-design-principles)
10. [Implementation Roadmap](#implementation-roadmap)

---

## 🔍 Current State Analysis

### Existing Implementation
Your ORBIT app currently has:

**✅ Implemented Components:**
- **Dashboard View** (`components/Dashboard.tsx:1-142`) - Market overview with mock price data and charts
- **News Feed** (`components/NewsFeed.tsx:1-139`) - AI-powered news aggregation using Gemini API with Google Search
- **DeFi Portfolio** (`components/DeFiPortfolio.tsx:1-126`) - Position tracking with pie chart visualization
- **Alerts View** (`components/AlertsView.tsx:1-90`) - Basic price alert management UI
- **Architecture View** - Meta view for architectural analysis

**🔧 Technology Stack:**
- React 19.2.4 + TypeScript 5.8.2
- Vite 6.2.0 for build tooling
- Recharts 3.7.0 for data visualization
- Lucide React 0.563.0 for icons
- Google Gemini AI (@google/genai 1.40.0) for news intelligence

**⚠️ Current Gaps:**
- No real authentication system
- No persistent database storage
- Mock data for prices and DeFi positions
- No actual notification delivery system
- No API integration with real crypto data sources
- No user account management
- API keys exposed in client-side code (`services/geminiService.ts:4`)

---

## 🗄️ Storage Architecture

### Recommended Storage Strategy

Based on 2026 best practices research, implement a **hybrid storage approach**:

#### 1. **Primary Database: MongoDB Atlas** (Recommended)
**Use Case:** User data, alerts, preferences, portfolio tracking

**Rationale:**
- Document-oriented structure perfect for flexible crypto data models
- High-performance real-time queries for price monitoring
- Horizontal scaling for growing user base
- Change streams for real-time notifications
- Native time-series collections for price history

**Schema Design:**
```typescript
// User Collection
{
  _id: ObjectId,
  email: string,
  authProvider: 'google' | 'apple' | 'email',
  authProviderId: string,
  createdAt: Date,
  settings: {
    notificationChannels: ['email', 'push', 'telegram'],
    theme: 'dark' | 'light',
    defaultCurrency: 'USD'
  }
}

// Alert Collection (with TTL index for auto-cleanup)
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'price' | 'defi' | 'news',
  token: string,
  condition: 'above' | 'below',
  targetPrice: Number,
  active: boolean,
  triggeredAt: Date?,
  createdAt: Date,
  expiresAt: Date // TTL index
}

// DeFi Position Collection
{
  _id: ObjectId,
  userId: ObjectId,
  walletAddress: string,
  protocol: string,
  type: 'liquidity_pool' | 'staking' | 'lending',
  asset: string,
  value: Number,
  apy: Number,
  lastSyncedAt: Date,
  chain: string
}

// News Cache Collection (TTL: 6 hours)
{
  _id: ObjectId,
  topic: string,
  items: Array<NewsItem>,
  cachedAt: Date,
  expiresAt: Date
}
```

#### 2. **Time-Series Database: InfluxDB or TimescaleDB**
**Use Case:** Historical price data, performance metrics

**Rationale:**
- Optimized for time-series data (price ticks, volume, gas prices)
- Automatic data retention policies
- Efficient compression for storage optimization
- Fast aggregation queries for charting

#### 3. **Cache Layer: Redis**
**Use Case:** Real-time price caching, rate limiting, session management

**Rationale:**
- Sub-millisecond latency for price lookups
- Pub/Sub for real-time price updates to clients
- Rate limiting for API calls
- Session storage for authenticated users

**Redis Key Patterns:**
```
price:{symbol} -> "43850.50" (TTL: 10 seconds)
user:session:{token} -> {userId, expiresAt}
ratelimit:{userId}:{endpoint} -> counter (TTL: 60 seconds)
defi:tvl:{protocol} -> cached TVL data (TTL: 5 minutes)
```

#### 4. **Decentralized Storage: IPFS (Optional - Future Enhancement)**
**Use Case:** Storing proof of alert configurations, audit trails

**Rationale:**
- Immutable audit trail of alert triggers
- Censorship-resistant backup of user data
- Lower cost for archival data

### Storage Cost Optimization
- **Hot Data** (Redis): Last 10 minutes of prices, active sessions
- **Warm Data** (MongoDB): Last 90 days of alerts, user preferences
- **Cold Data** (TimescaleDB compressed / S3 Glacier): Historical prices beyond 90 days

### Backup & Disaster Recovery
- **MongoDB Atlas**: Automated continuous backups, point-in-time recovery
- **Redis**: AOF persistence + daily snapshots to S3
- **Multi-region replication**: Primary (US-East), Secondary (EU-West) for <50ms global latency

---

## 🔐 Authentication Strategy

### Recommended: Multi-Provider OAuth 2.1 + Passkeys

#### Primary Authentication Methods

**1. Social Login (OAuth 2.1 + PKCE)**
- **Google Sign-In** - Largest user base in crypto space
- **Apple Sign-In** - Required for iOS App Store, privacy-focused
- **Twitter/X OAuth** - Native crypto community authentication

**Implementation with NextAuth.js / Auth.js:**
```typescript
// lib/auth.ts
import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import TwitterProvider from "next-auth/providers/twitter"

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // PKCE automatically enabled by NextAuth
        }
      }
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0" // OAuth 2.0 with PKCE
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      session.user.provider = token.provider
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
}
```

**2. Passkeys (WebAuthn/FIDO2)** - Recommended for 2026+
- Passwordless authentication using biometrics
- No phishing risk (cryptographically secure)
- Better UX than passwords
- Supported by all major browsers and platforms

**Implementation:**
```typescript
// lib/webauthn.ts
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

export async function registerPasskey(userId: string) {
  // Request challenge from server
  const options = await fetch('/api/auth/passkey/register-options', {
    method: 'POST',
    body: JSON.stringify({ userId })
  }).then(r => r.json())

  // Trigger WebAuthn registration
  const credential = await startRegistration(options)

  // Verify on server
  const verification = await fetch('/api/auth/passkey/register-verify', {
    method: 'POST',
    body: JSON.stringify({ userId, credential })
  }).then(r => r.json())

  return verification
}
```

**3. Email Magic Links** (Backup method)
- For users without social accounts
- No password management needed
- Time-limited tokens (15-minute expiry)

#### Security Enhancements

**Multi-Factor Authentication (MFA)**
- TOTP (Google Authenticator, Authy) for high-value accounts
- SMS backup codes (with warning about SIM swap risks)
- Mandatory MFA for API key generation

**Session Management**
- Short-lived access tokens (15 minutes)
- Refresh token rotation on every use
- Device fingerprinting for anomaly detection
- Automatic logout after 30 days of inactivity

**Rate Limiting**
- 5 failed login attempts → 15-minute lockout
- 10 failed attempts → Account locked, email verification required

---

## 🛡️ Security Framework

### Critical Security Implementation (Based on 2026 Standards)

#### 1. **API Key Management**

**Current Vulnerability:** API keys exposed in client-side code
**Solution:** Server-side API proxy pattern

```typescript
// ❌ NEVER DO THIS (Current implementation)
// services/geminiService.ts:4
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ✅ CORRECT APPROACH
// Server-side API route
// app/api/news/route.ts
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  // Verify user authentication
  const session = await getServerSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // API key stored securely server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY! // Only accessible on server
  });

  const { topic } = await request.json()
  const news = await searchCryptoNews(topic)

  return Response.json(news)
}
```

#### 2. **Secrets Management**

**Development Environment:**
```bash
# .env.local (NEVER commit to git)
GEMINI_API_KEY=your_key_here
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .gitignore
.env.local
.env.*.local
```

**Production Environment:**
Use **AWS Secrets Manager** or **HashiCorp Vault**

```typescript
// lib/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"

const client = new SecretsManagerClient({ region: "us-east-1" })

export async function getSecret(secretName: string): Promise<string> {
  const command = new GetSecretValueCommand({ SecretId: secretName })
  const response = await client.send(command)
  return response.SecretString!
}

// Usage
const geminiKey = await getSecret('orbit/prod/gemini-api-key')
```

#### 3. **Encryption Standards**

**Data at Rest:**
- **AES-256-GCM** for sensitive user data (wallet addresses, alert configurations)
- MongoDB encryption at rest enabled by default in Atlas
- Encrypted backups with separate key management

**Data in Transit:**
- **TLS 1.3** mandatory for all API communications
- Certificate pinning for mobile apps
- HSTS headers with 1-year expiry

```typescript
// middleware.ts (Next.js)
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}
```

#### 4. **API Security Best Practices**

**Rate Limiting (Prevent DDoS)**
```typescript
// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true,
})

export async function checkRateLimit(userId: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(userId)

  if (!success) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds`)
  }

  return { limit, remaining, reset }
}
```

**Input Validation & Sanitization**
```typescript
import { z } from 'zod'

const CreateAlertSchema = z.object({
  token: z.string().min(1).max(10).regex(/^[A-Z0-9]+$/),
  condition: z.enum(['above', 'below']),
  targetPrice: z.number().positive().max(10_000_000),
})

export async function createAlert(data: unknown) {
  // Validate input
  const validated = CreateAlertSchema.parse(data)

  // Proceed with safe data
  return await db.alerts.create(validated)
}
```

#### 5. **Wallet Security**

**NEVER store private keys** - Use read-only integrations:
- **Wallet Connect** for DeFi position monitoring
- **Public address tracking** only
- **Sign-in with Ethereum (SIWE)** for wallet-based auth (no custody)

```typescript
// lib/wallet.ts
import { SiweMessage } from 'siwe'

export async function verifyWalletSignature(
  message: string,
  signature: string,
  address: string
) {
  try {
    const siweMessage = new SiweMessage(message)
    const fields = await siweMessage.verify({ signature })

    // Verify the address matches
    if (fields.data.address.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Address mismatch')
    }

    return true
  } catch (error) {
    return false
  }
}
```

#### 6. **Key Rotation Policy**

- **API Keys:** Rotate every 90 days
- **JWT Secrets:** Rotate every 180 days
- **Database Credentials:** Rotate every 90 days
- **Emergency rotation:** Within 1 hour of suspected compromise

---

## 🚀 Core Features & Enhancements

### 1. **Price Change Notifications** (Priority 1)

#### Current Implementation Gap
`components/AlertsView.tsx:1-90` shows UI but no backend logic or actual notifications.

#### Recommended Architecture

**Alert Monitoring Service (Node.js Worker)**
```typescript
// services/alert-monitor/index.ts
import { WebSocket } from 'ws'
import { connectToMongo } from './db'
import { sendNotification } from './notifications'

interface PriceUpdate {
  symbol: string
  price: number
  timestamp: number
}

class AlertMonitor {
  private ws: WebSocket
  private alertsCache: Map<string, Alert[]> = new Map()

  async start() {
    // Connect to WebSocket price feed
    this.ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr')

    // Load active alerts from MongoDB
    await this.loadActiveAlerts()

    // Listen for price updates
    this.ws.on('message', (data) => this.handlePriceUpdate(JSON.parse(data)))
  }

  async handlePriceUpdate(updates: PriceUpdate[]) {
    for (const update of updates) {
      const alerts = this.alertsCache.get(update.symbol) || []

      for (const alert of alerts) {
        if (this.shouldTrigger(alert, update.price)) {
          await this.triggerAlert(alert, update.price)
        }
      }
    }
  }

  shouldTrigger(alert: Alert, currentPrice: number): boolean {
    if (!alert.active) return false

    if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
      return true
    }

    if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
      return true
    }

    return false
  }

  async triggerAlert(alert: Alert, currentPrice: number) {
    // Mark alert as triggered
    await db.alerts.updateOne(
      { _id: alert._id },
      {
        $set: { triggeredAt: new Date(), active: false },
        $inc: { triggerCount: 1 }
      }
    )

    // Send notifications
    const user = await db.users.findOne({ _id: alert.userId })

    await sendNotification(user, {
      title: `🚨 ${alert.token} Alert Triggered`,
      body: `${alert.token} is now ${alert.condition} $${alert.targetPrice} (Current: $${currentPrice})`,
      channels: user.settings.notificationChannels
    })

    // Log for analytics
    console.log(`Alert triggered: ${alert._id} for user ${user.email}`)
  }
}

// Start the monitor
const monitor = new AlertMonitor()
monitor.start()
```

**Data Sources for Real-Time Prices:**
1. **Binance WebSocket API** - Free, real-time, 100+ trading pairs
2. **CoinGecko API** - 10,000+ coins, free tier: 10-50 calls/minute
3. **CryptoCompare API** - Real-time & historical data
4. **CoinCap API v2** - WebSocket for top 100 assets

### 2. **DeFi Position Monitoring** (Priority 2)

#### Architecture: Event-Driven Position Tracker

**Current Gap:** `components/DeFiPortfolio.tsx:1-126` shows mock data, no real wallet integration.

**Solution Components:**

**a) Wallet Connection (Frontend)**
```typescript
// hooks/useWallet.ts
import { useConnect, useAccount, useBalance } from 'wagmi'
import { mainnet, polygon, arbitrum } from 'wagmi/chains'

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  const connectWallet = async () => {
    // MetaMask, WalletConnect, Coinbase Wallet
    await connect({ connector: connectors[0] })
  }

  return { address, isConnected, connectWallet }
}
```

**b) Position Indexer (Backend Service)**
```typescript
// services/defi-indexer/index.ts
import { Alchemy, Network } from 'alchemy-sdk'
import { getDefiPositions } from './protocols'

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY!,
  network: Network.ETH_MAINNET
})

export async function indexWalletPositions(walletAddress: string) {
  const positions: DefiPosition[] = []

  // 1. Check Aave V3 positions
  const aavePositions = await getAavePositions(walletAddress)
  positions.push(...aavePositions)

  // 2. Check Uniswap V3 LP positions
  const uniswapPositions = await getUniswapV3Positions(walletAddress)
  positions.push(...uniswapPositions)

  // 3. Check Lido staking
  const lidoBalance = await getLidoStakedBalance(walletAddress)
  if (lidoBalance > 0) {
    positions.push({
      protocol: 'Lido',
      type: 'Staking',
      asset: 'stETH',
      value: lidoBalance,
      apy: 3.4, // Fetch from Lido API
    })
  }

  // 4. Update database
  await db.defiPositions.updateMany(
    { walletAddress, userId },
    { $set: positions },
    { upsert: true }
  )

  return positions
}

async function getAavePositions(address: string): Promise<DefiPosition[]> {
  const AAVE_V3_POOL = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'

  // Query Aave Pool contract for user deposits
  const userAccountData = await alchemy.core.call({
    to: AAVE_V3_POOL,
    data: alchemy.core.encodeFunctionData({
      abi: AAVE_POOL_ABI,
      functionName: 'getUserAccountData',
      args: [address]
    })
  })

  // Parse and return positions
  return parseAavePositions(userAccountData)
}
```

**c) Position Change Alerts**
```typescript
// services/defi-monitor/index.ts
setInterval(async () => {
  const users = await db.users.find({ 'settings.defiAlerts': true })

  for (const user of users) {
    const wallets = await db.wallets.find({ userId: user._id })

    for (const wallet of wallets) {
      const currentPositions = await indexWalletPositions(wallet.address)
      const previousPositions = await db.defiPositions.find({
        walletAddress: wallet.address
      })

      // Detect significant changes
      const changes = detectSignificantChanges(previousPositions, currentPositions)

      if (changes.length > 0) {
        await sendNotification(user, {
          title: '🔄 DeFi Position Update',
          body: `Detected ${changes.length} significant changes in your positions`,
          data: { changes }
        })
      }
    }
  }
}, 5 * 60 * 1000) // Check every 5 minutes
```

**Data Sources for DeFi:**
1. **Alchemy API** - Multi-chain wallet & smart contract data
2. **DefiLlama API** - Protocol TVL, APY, and analytics
3. **The Graph** - Decentralized indexing for Uniswap, Aave, etc.
4. **Covalent API** - Historical DeFi positions across 100+ chains

### 3. **Macro News & Social Intelligence** (Priority 3)

#### Enhancement to Current Implementation

**Current:** `components/NewsFeed.tsx:1-139` uses Gemini with Google Search (excellent start!)

**Recommended Additions:**

**a) Multi-Source News Aggregation**
```typescript
// services/news-aggregator/index.ts
import { searchCryptoNews as geminiSearch } from '../geminiService'
import axios from 'axios'

interface NewsSource {
  name: string
  fetch: (query: string) => Promise<NewsItem[]>
}

const newsSources: NewsSource[] = [
  {
    name: 'Gemini AI + Google Search',
    fetch: geminiSearch
  },
  {
    name: 'CryptoPanic API',
    fetch: async (query) => {
      const response = await axios.get('https://cryptopanic.com/api/v1/posts/', {
        params: {
          auth_token: process.env.CRYPTOPANIC_API_KEY,
          currencies: query,
          kind: 'news'
        }
      })
      return response.data.results.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.title,
        source: item.source.title,
        url: item.url,
        sentiment: item.votes.positive > item.votes.negative ? 'BULLISH' : 'BEARISH',
        timestamp: new Date(item.published_at).toLocaleString()
      }))
    }
  },
  {
    name: 'Twitter/X (via Apify)',
    fetch: async (query) => {
      // Use Apify's Twitter scraper (legal, TOS-compliant)
      const response = await axios.post(
        `https://api.apify.com/v2/acts/apify~twitter-scraper/runs`,
        {
          searchTerms: [`#${query}`, `$${query}`],
          maxTweets: 50,
          onlyVerifiedUsers: true
        },
        {
          headers: { Authorization: `Bearer ${process.env.APIFY_API_KEY}` }
        }
      )
      return parseTweets(response.data)
    }
  },
  {
    name: 'YouTube (Crypto News Channels)',
    fetch: async (query) => {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          q: `${query} crypto news`,
          part: 'snippet',
          type: 'video',
          order: 'date',
          maxResults: 10
        }
      })
      return parseYouTubeResults(response.data)
    }
  },
  {
    name: 'Reddit (r/CryptoCurrency)',
    fetch: async (query) => {
      const response = await axios.get(`https://www.reddit.com/r/CryptoCurrency/search.json`, {
        params: {
          q: query,
          sort: 'hot',
          limit: 25,
          t: 'day'
        }
      })
      return parseRedditPosts(response.data)
    }
  }
]

export async function aggregateNews(topic: string): Promise<NewsItem[]> {
  // Fetch from all sources in parallel
  const results = await Promise.allSettled(
    newsSources.map(source => source.fetch(topic))
  )

  // Combine and deduplicate
  const allNews = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  // Remove duplicates based on title similarity
  const deduplicated = deduplicateNews(allNews)

  // Sort by sentiment impact and recency
  return deduplicated
    .sort((a, b) => {
      const sentimentScore = (item: NewsItem) =>
        item.sentiment === 'BULLISH' ? 1 : item.sentiment === 'BEARISH' ? -1 : 0
      return Math.abs(sentimentScore(b)) - Math.abs(sentimentScore(a))
    })
    .slice(0, 50)
}
```

**b) Sentiment Analysis Enhancement**
```typescript
// services/sentiment-analyzer/index.ts
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function analyzeSentiment(text: string): Promise<'BULLISH' | 'BEARISH' | 'NEUTRAL'> {
  const result = await hf.textClassification({
    model: 'ProsusAI/finbert',
    inputs: text
  })

  const scores = result.reduce((acc, r) => {
    acc[r.label] = r.score
    return acc
  }, {} as Record<string, number>)

  if (scores.positive > 0.6) return 'BULLISH'
  if (scores.negative > 0.6) return 'BEARISH'
  return 'NEUTRAL'
}
```

**Data Sources:**
1. **CryptoPanic API** - Aggregated crypto news from 1000+ sources
2. **Apify Twitter Scraper** - Legal X/Twitter data extraction
3. **YouTube Data API v3** - Search crypto news channels
4. **Reddit API** - r/CryptoCurrency, r/Bitcoin, r/Ethereum
5. **NewsAPI.org** - Mainstream media (Bloomberg, Reuters, CNBC)
6. **Coinbase News API** - Official exchange announcements
7. **CoinMarketCap News** - Built-in news feed

---

## 🔔 Notification System

### Multi-Channel Delivery Architecture

#### 1. **Push Notifications (Web & Mobile)**

**Implementation: Firebase Cloud Messaging (FCM)**
```typescript
// services/notifications/push.ts
import admin from 'firebase-admin'

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
})

export async function sendPushNotification(
  userToken: string,
  notification: {
    title: string
    body: string
    data?: Record<string, string>
  }
) {
  const message = {
    token: userToken,
    notification: {
      title: notification.title,
      body: notification.body
    },
    data: notification.data,
    webpush: {
      fcmOptions: {
        link: 'https://orbit.app/alerts'
      },
      notification: {
        icon: '/icons/orbit-logo-192.png',
        badge: '/icons/orbit-badge-72.png',
        vibrate: [200, 100, 200],
        requireInteraction: true
      }
    }
  }

  return admin.messaging().send(message)
}
```

#### 2. **Email Notifications**

**Implementation: Resend (Best Developer Experience 2026)**
```typescript
// services/notifications/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailAlert(
  to: string,
  alert: {
    token: string
    condition: string
    targetPrice: number
    currentPrice: number
  }
) {
  return resend.emails.send({
    from: 'ORBIT Alerts <alerts@orbit.app>',
    to,
    subject: `🚨 ${alert.token} Alert: ${alert.condition} $${alert.targetPrice}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366F1;">Alert Triggered!</h1>
        <p><strong>${alert.token}</strong> is now <strong>${alert.condition}</strong> your target of <strong>$${alert.targetPrice}</strong></p>
        <p>Current Price: <span style="font-size: 24px; color: #10B981;">$${alert.currentPrice}</span></p>
        <a href="https://orbit.app/dashboard" style="display: inline-block; background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          View Dashboard
        </a>
      </div>
    `
  })
}
```

#### 3. **Telegram Bot**

**Implementation:**
```typescript
// services/notifications/telegram.ts
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false })

export async function sendTelegramAlert(chatId: string, message: string) {
  return bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    disable_web_page_preview: false
  })
}

// Setup webhook for user registration
export async function setupTelegramWebhook() {
  const webhookUrl = `${process.env.APP_URL}/api/telegram/webhook`
  await bot.setWebhook(webhookUrl)
}

// Handle /start command for linking account
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const userId = match![1] // Passed from web app

  // Link Telegram account to user
  await db.users.updateOne(
    { _id: userId },
    { $set: { 'settings.telegramChatId': chatId } }
  )

  bot.sendMessage(chatId, '✅ Successfully linked to ORBIT! You will now receive alerts here.')
})
```

**User Flow for Telegram Setup:**
1. User clicks "Connect Telegram" in app
2. Opens `https://t.me/OrbitAlertsBot?start={userId}`
3. Bot links account automatically
4. Confirmations sent to both web app and Telegram

#### 4. **SMS Notifications (Premium Feature)**

**Implementation: Twilio**
```typescript
// services/notifications/sms.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMSAlert(
  phoneNumber: string,
  message: string
) {
  return client.messages.create({
    body: message,
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER
  })
}
```

#### 5. **Discord Webhooks**

```typescript
// services/notifications/discord.ts
export async function sendDiscordAlert(webhookUrl: string, message: string) {
  return fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: '🚨 ORBIT Alert',
        description: message,
        color: 0x6366F1,
        timestamp: new Date().toISOString()
      }]
    })
  })
}
```

### Notification Preferences UI

```typescript
// components/NotificationSettings.tsx
const channels = [
  { id: 'email', name: 'Email', icon: Mail, free: true },
  { id: 'push', name: 'Push Notifications', icon: Bell, free: true },
  { id: 'telegram', name: 'Telegram', icon: MessageCircle, free: true },
  { id: 'discord', name: 'Discord Webhook', icon: Hash, free: true },
  { id: 'sms', name: 'SMS', icon: Phone, free: false, badge: 'Premium' }
]

export function NotificationSettings() {
  const [enabledChannels, setEnabledChannels] = useState<string[]>(['email'])

  return (
    <div className="space-y-4">
      <h3>Notification Channels</h3>
      {channels.map(channel => (
        <div key={channel.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <channel.icon className="w-5 h-5" />
            <span>{channel.name}</span>
            {!channel.free && <span className="badge">Premium</span>}
          </div>
          <Switch
            checked={enabledChannels.includes(channel.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setEnabledChannels([...enabledChannels, channel.id])
              } else {
                setEnabledChannels(enabledChannels.filter(c => c !== channel.id))
              }
            }}
          />
        </div>
      ))}
    </div>
  )
}
```

---

## 🔌 API Integration Strategy

### Real-Time Price Data

**Primary Provider: Binance WebSocket (Free)**
```typescript
// services/price-feeds/binance.ts
import WebSocket from 'ws'

export class BinancePriceFeed {
  private ws: WebSocket

  connect(symbols: string[]) {
    const streams = symbols.map(s => `${s.toLowerCase()}usdt@ticker`).join('/')
    this.ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)

    this.ws.on('message', (data) => {
      const { data: ticker } = JSON.parse(data.toString())

      // Update Redis cache
      redis.setex(`price:${ticker.s}`, 10, ticker.c)

      // Publish to subscribers
      redis.publish('price-updates', JSON.stringify({
        symbol: ticker.s,
        price: parseFloat(ticker.c),
        change24h: parseFloat(ticker.P)
      }))
    })
  }
}
```

**Fallback Provider: CoinGecko API**
```typescript
// services/price-feeds/coingecko.ts
export async function getPrices(coinIds: string[]) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
  )
  return response.json()
}
```

### DeFi Protocol Data

**Provider: DefiLlama API (Free)**
```typescript
// services/defi/defillama.ts
export async function getProtocolTVL(protocol: string) {
  const response = await fetch(`https://api.llama.fi/protocol/${protocol}`)
  return response.json()
}

export async function getChainTVL() {
  const response = await fetch('https://api.llama.fi/v2/chains')
  return response.json()
}
```

### On-Chain Data

**Provider: Alchemy SDK (Free tier: 300M compute units/month)**
```typescript
// services/blockchain/alchemy.ts
import { Alchemy, Network } from 'alchemy-sdk'

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY!,
  network: Network.ETH_MAINNET
})

export async function getWalletBalances(address: string) {
  const balances = await alchemy.core.getTokenBalances(address)
  return balances.tokenBalances
}

export async function getWalletNFTs(address: string) {
  const nfts = await alchemy.nft.getNftsForOwner(address)
  return nfts.ownedNfts
}
```

### Gas Price Data

```typescript
// services/gas/index.ts
export async function getCurrentGasPrice() {
  const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=' + process.env.ETHERSCAN_API_KEY)
  return response.json()
}
```

---

## 🏗️ Technical Architecture

### Recommended Stack Evolution

#### Current Stack
```
React 19 + TypeScript + Vite
├── Frontend only (no backend)
├── Gemini AI for news
└── Mock data for everything else
```

#### Recommended Production Stack
```
Next.js 15 App Router + TypeScript
├── Frontend (React Server Components + Client Components)
├── Backend (API Routes + Server Actions)
├── Database (MongoDB Atlas + Redis Cloud)
├── Authentication (NextAuth.js v5)
├── Real-time (WebSocket server for prices)
├── Background Jobs (BullMQ + Redis)
├── Deployment (Vercel for web, Railway for workers)
└── Monitoring (Sentry + Axiom)
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web App     │  │  Mobile App  │  │   Browser    │      │
│  │  (Next.js)   │  │ (React Native│  │  Extension   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS / WebSocket
┌────────────────────▼────────────────────────────────────────┐
│                     API Gateway (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth Routes │  │  API Routes  │  │  WebSocket   │      │
│  │ /api/auth/*  │  │  /api/*      │  │  Server      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Application Services                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Alert Monitor│  │ DeFi Indexer │  │News Aggregator│     │
│  │  (Worker)    │  │  (Worker)    │  │  (Worker)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  MongoDB     │  │    Redis     │  │  TimescaleDB │      │
│  │  (User Data) │  │  (Cache)     │  │ (Price Data) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  External Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Binance    │  │   Alchemy    │  │    Gemini    │      │
│  │  WebSocket   │  │     API      │  │     AI       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  DefiLlama   │  │  CoinGecko   │  │  CryptoPanic │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

### File Structure (Recommended)

```
orbit/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard
│   │   ├── news/page.tsx
│   │   ├── defi/page.tsx
│   │   └── alerts/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── alerts/route.ts
│   │   ├── prices/route.ts
│   │   ├── defi/route.ts
│   │   └── news/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── Dashboard.tsx
│   ├── NewsFeed.tsx
│   ├── DeFiPortfolio.tsx
│   ├── AlertsView.tsx
│   └── NotificationSettings.tsx
├── lib/
│   ├── db/
│   │   ├── mongodb.ts
│   │   ├── redis.ts
│   │   └── models/
│   │       ├── User.ts
│   │       ├── Alert.ts
│   │       └── DefiPosition.ts
│   ├── auth.ts                   # NextAuth configuration
│   ├── notifications/
│   │   ├── push.ts
│   │   ├── email.ts
│   │   ├── telegram.ts
│   │   └── sms.ts
│   └── utils.ts
├── services/
│   ├── alert-monitor/
│   │   └── index.ts
│   ├── defi-indexer/
│   │   └── index.ts
│   ├── news-aggregator/
│   │   └── index.ts
│   ├── price-feeds/
│   │   ├── binance.ts
│   │   └── coingecko.ts
│   └── geminiService.ts
├── workers/                      # Background job processors
│   ├── alert-monitor.worker.ts
│   ├── defi-indexer.worker.ts
│   └── news-aggregator.worker.ts
├── hooks/
│   ├── useWallet.ts
│   ├── useAlerts.ts
│   └── useRealTimePrices.ts
├── types/
│   └── index.ts
├── public/
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 UI/UX Design Principles

### Current Design Analysis

**Strengths:**
- Dark theme with glassmorphism (`glass-panel` class)
- Consistent color scheme (orbit-accent: #6366F1)
- Responsive mobile layout with sidebar
- Professional dashboard aesthetic

**Recommendations for Enhancement:**

#### 1. **Advanced Alert Configuration**

Replace simple price alerts with multi-condition alerts:
```tsx
<AlertBuilder>
  <Condition type="price" token="BTC" operator="above" value={45000} />
  <Condition type="volume" operator="increases_by" value={20} unit="percent" />
  <Condition type="rsi" operator="below" value={30} />
  <Action type="notify" channels={['telegram', 'push']} />
  <Action type="auto_trade" exchange="binance" action="buy" amount={0.01} />
</AlertBuilder>
```

#### 2. **Real-Time Price Ticker**

Add a scrolling ticker at the top:
```tsx
// components/PriceTicker.tsx
export function PriceTicker() {
  const { prices } = useRealTimePrices(['BTC', 'ETH', 'SOL', 'LINK'])

  return (
    <div className="bg-orbit-800 border-b border-orbit-600 overflow-hidden">
      <div className="animate-scroll flex gap-8 py-2 px-4">
        {prices.map(coin => (
          <div key={coin.symbol} className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-bold">{coin.symbol}</span>
            <span className="font-mono">${coin.price.toLocaleString()}</span>
            <span className={coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
              {coin.change24h >= 0 ? '↑' : '↓'} {Math.abs(coin.change24h)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### 3. **Portfolio Performance Dashboard**

```tsx
// components/PortfolioSummary.tsx
export function PortfolioSummary() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Value"
        value="$124,592"
        change="+$2,841"
        changePercent="+2.4%"
        trend="up"
      />
      <StatCard
        label="24h P&L"
        value="+$1,245"
        changePercent="+1.2%"
        trend="up"
      />
      <StatCard
        label="DeFi APY"
        value="8.4%"
        subtitle="Weighted Average"
      />
      <StatCard
        label="Active Positions"
        value="12"
        subtitle="Across 5 protocols"
      />
    </div>
  )
}
```

#### 4. **Customizable Dashboard Widgets**

Allow users to drag-and-drop widgets:
```tsx
import { Responsive, WidthProvider } from 'react-grid-layout'

const ResponsiveGridLayout = WidthProvider(Responsive)

export function CustomizableDashboard() {
  const [layout, setLayout] = useState([
    { i: 'prices', x: 0, y: 0, w: 6, h: 4 },
    { i: 'news', x: 6, y: 0, w: 6, h: 4 },
    { i: 'defi', x: 0, y: 4, w: 12, h: 6 }
  ])

  return (
    <ResponsiveGridLayout
      layouts={{ lg: layout }}
      onLayoutChange={setLayout}
      breakpoints={{ lg: 1200, md: 996, sm: 768 }}
      cols={{ lg: 12, md: 10, sm: 6 }}
    >
      <div key="prices"><PriceWidget /></div>
      <div key="news"><NewsWidget /></div>
      <div key="defi"><DeFiWidget /></div>
    </ResponsiveGridLayout>
  )
}
```

#### 5. **Advanced Filtering & Search**

```tsx
// components/AdvancedFilters.tsx
export function AdvancedFilters() {
  return (
    <div className="flex gap-4 flex-wrap">
      <Select placeholder="Asset Type">
        <option>All Assets</option>
        <option>Layer 1</option>
        <option>Layer 2</option>
        <option>DeFi</option>
        <option>NFT</option>
      </Select>

      <Select placeholder="Market Cap">
        <option>All</option>
        <option>Large Cap (&gt;$10B)</option>
        <option>Mid Cap ($1B-$10B)</option>
        <option>Small Cap (&lt;$1B)</option>
      </Select>

      <Select placeholder="Time Frame">
        <option>24 Hours</option>
        <option>7 Days</option>
        <option>30 Days</option>
        <option>1 Year</option>
      </Select>
    </div>
  )
}
```

---

## 🗺️ Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)

**Week 1: Infrastructure Setup**
- [ ] Migrate from Vite to Next.js 15 App Router
- [ ] Set up MongoDB Atlas cluster
- [ ] Set up Redis Cloud instance
- [ ] Configure environment variables & secrets management
- [ ] Set up Vercel deployment

**Week 2: Authentication**
- [ ] Implement NextAuth.js with Google & Apple OAuth
- [ ] Add email magic link authentication
- [ ] Create user registration flow
- [ ] Build user profile management
- [ ] Implement session management

**Week 3: Real-Time Price Integration**
- [ ] Connect to Binance WebSocket API
- [ ] Implement Redis caching layer
- [ ] Build price update pub/sub system
- [ ] Update Dashboard with real-time prices
- [ ] Add fallback to CoinGecko API

### Phase 2: Core Features (Weeks 4-6)

**Week 4: Alert System**
- [ ] Build alert creation UI (enhanced from current `AlertsView.tsx:1-90`)
- [ ] Implement alert storage in MongoDB
- [ ] Create alert monitoring worker process
- [ ] Build notification delivery system (email + push)
- [ ] Add alert management (edit, delete, pause)

**Week 5: DeFi Integration**
- [ ] Integrate Wallet Connect
- [ ] Set up Alchemy SDK for on-chain data
- [ ] Build DeFi position indexer
- [ ] Create position change detection
- [ ] Update DeFiPortfolio component with real data

**Week 6: News Aggregation**
- [ ] Enhance Gemini news service (already in `services/geminiService.ts:8-67`)
- [ ] Add CryptoPanic API integration
- [ ] Implement Twitter/X scraping via Apify
- [ ] Add YouTube & Reddit sources
- [ ] Build news deduplication & ranking

### Phase 3: Advanced Features (Weeks 7-9)

**Week 7: Multi-Channel Notifications**
- [ ] Implement Telegram bot
- [ ] Add Discord webhook support
- [ ] Set up SMS via Twilio (premium feature)
- [ ] Build notification preferences UI
- [ ] Create notification history view

**Week 8: Advanced Analytics**
- [ ] Build portfolio performance tracking
- [ ] Add profit/loss calculations
- [ ] Implement historical data charts
- [ ] Create custom date range selection
- [ ] Add export functionality (CSV, PDF)

**Week 9: Mobile Optimization**
- [ ] Build Progressive Web App (PWA) manifest
- [ ] Implement offline support with Service Workers
- [ ] Add biometric authentication
- [ ] Optimize mobile UI/UX
- [ ] Test on iOS and Android devices

### Phase 4: Polish & Launch (Weeks 10-12)

**Week 10: Testing & Security**
- [ ] Comprehensive security audit
- [ ] Penetration testing
- [ ] Load testing (1000+ concurrent users)
- [ ] API rate limit testing
- [ ] End-to-end user testing

**Week 11: Documentation & Onboarding**
- [ ] Write user documentation
- [ ] Create video tutorials
- [ ] Build interactive onboarding flow
- [ ] Add help center / FAQ
- [ ] Prepare marketing materials

**Week 12: Launch**
- [ ] Beta launch to 100 users
- [ ] Collect feedback and iterate
- [ ] Full public launch
- [ ] Set up monitoring & alerting
- [ ] Plan post-launch feature roadmap

---

## 🎯 Competitive Advantages

### How ORBIT Will Be Better Than Competitors

#### vs. CoinMarketCap
- **Better:** AI-powered news aggregation with Gemini (you already have this!)
- **Better:** Multi-source intelligence (Twitter, Reddit, YouTube, not just articles)
- **Better:** DeFi position tracking (CMC doesn't have this)
- **Better:** Advanced multi-condition alerts

#### vs. CryptoAlerting
- **Better:** Built-in DeFi protocol monitoring
- **Better:** Integrated news feed in one app
- **Better:** Modern UI with glassmorphism design
- **Better:** Wallet-based authentication option

#### vs. Coinbase App
- **Better:** Cross-exchange price alerts (not locked to Coinbase)
- **Better:** DeFi protocol integrations
- **Better:** AI-powered macro news analysis
- **Better:** Customizable notification channels

### Unique Value Propositions

1. **All-in-One Platform:** Price alerts + DeFi tracking + News intelligence in single app
2. **AI-First:** Gemini AI for intelligent news summarization & sentiment analysis
3. **Privacy-Focused:** Non-custodial, read-only wallet integration
4. **Developer-Friendly:** Open API for power users
5. **Community-Driven:** Reddit, Twitter, YouTube integration for social sentiment

---

## 📊 Monetization Strategy (Optional)

### Freemium Model

**Free Tier:**
- Up to 10 price alerts
- 3 wallet addresses
- Email & push notifications
- Basic news feed (last 24 hours)
- Up to 5 DeFi positions

**Premium Tier ($9.99/month):**
- Unlimited alerts
- Advanced multi-condition alerts
- Unlimited wallet tracking
- SMS notifications
- Telegram bot
- Priority support
- Historical data (1 year)
- Custom webhooks
- Portfolio analytics

**Enterprise Tier ($99/month):**
- Everything in Premium
- API access
- Dedicated Telegram/Discord channel alerts
- Phone support
- Custom integrations
- White-label option

---

## 🔒 Compliance & Legal Considerations

### Not Financial Advice Disclaimer

**Required on every page:**
```tsx
<footer className="text-xs text-gray-500 text-center p-4 border-t border-orbit-600">
  <p>
    ORBIT is an informational tool only. We do not provide financial, investment, or trading advice.
    Cryptocurrency investments are highly volatile and risky. Always conduct your own research (DYOR)
    and consult with a licensed financial advisor before making investment decisions.
  </p>
</footer>
```

### Privacy Policy Requirements

- **GDPR Compliance:** (If serving EU users)
  - Right to access data
  - Right to deletion
  - Data portability
  - Cookie consent

- **CCPA Compliance:** (If serving California users)
  - Privacy policy disclosure
  - Opt-out of data sale

### Terms of Service

Key clauses needed:
- No liability for financial losses
- No guarantee of data accuracy
- Right to terminate accounts
- Acceptable use policy

---

## 📈 Success Metrics

### Key Performance Indicators (KPIs)

**User Engagement:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average session duration
- Alerts created per user
- Wallets connected per user

**Technical:**
- API response time (&lt;200ms p95)
- Alert delivery latency (&lt;10 seconds)
- Uptime (target: 99.9%)
- Error rate (&lt;0.1%)

**Business:**
- User acquisition cost (CAC)
- Monthly Recurring Revenue (MRR)
- Churn rate (&lt;5%)
- Premium conversion rate (target: 5%)

---

## 🛠️ Development Best Practices

### Code Quality Standards

**TypeScript Strict Mode:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**ESLint Configuration:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:security/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "security/detect-object-injection": "warn"
  }
}
```

**Commit Convention:**
```
feat: Add Telegram notification support
fix: Resolve race condition in alert monitor
docs: Update API documentation
test: Add unit tests for price feed
refactor: Extract notification logic to service
perf: Optimize MongoDB queries with indexes
```

### Testing Strategy

**Unit Tests (Jest + React Testing Library):**
```typescript
// __tests__/components/AlertsView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { AlertsView } from '@/components/AlertsView'

describe('AlertsView', () => {
  it('should toggle alert active state', async () => {
    render(<AlertsView />)

    const toggle = screen.getByRole('switch', { name: /btc/i })
    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })
})
```

**Integration Tests (Playwright):**
```typescript
// e2e/alerts.spec.ts
import { test, expect } from '@playwright/test'

test('create price alert flow', async ({ page }) => {
  await page.goto('/alerts')
  await page.click('text=Create Alert')

  await page.fill('input[name="token"]', 'BTC')
  await page.selectOption('select[name="condition"]', 'above')
  await page.fill('input[name="price"]', '50000')

  await page.click('button:has-text("Create")')

  await expect(page.locator('text=BTC')).toBeVisible()
})
```

---

## 🎓 Learning Resources for Your Team

### Recommended Courses
- **Next.js 15 App Router:** [Next.js Learn](https://nextjs.org/learn)
- **Web3 Development:** [Alchemy University](https://university.alchemy.com/)
- **MongoDB Schema Design:** [MongoDB University](https://learn.mongodb.com/)
- **Real-Time Systems:** [Building Real-Time Apps](https://www.udemy.com/course/realtime-apps/)

### Essential Documentation
- [Binance WebSocket API](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams)
- [Alchemy SDK Docs](https://docs.alchemy.com/reference/alchemy-sdk-quickstart)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

## 📝 Summary & Next Steps

### Immediate Action Items

1. **Review this document** with your team
2. **Set up development environment:**
   - Create MongoDB Atlas account
   - Get API keys: Binance, Alchemy, Gemini (you have this), CoinGecko
   - Set up GitHub repository with proper .gitignore
3. **Start with Phase 1, Week 1** tasks
4. **Set up project management:** Use Linear, Jira, or GitHub Projects
5. **Schedule daily standups** to track progress

### Questions to Answer Before Starting

- [ ] Will this be web-only or also mobile native apps?
- [ ] What's the target launch date?
- [ ] Budget for API costs and infrastructure?
- [ ] Who's on the dev team (frontend, backend, DevOps)?
- [ ] What's the marketing/go-to-market strategy?

---

## 🔗 Useful Links

### Research Sources

**Storage:**
- [Cryptocurrency Data Best Datasets 2026](https://datarade.ai/data-categories/cryptocurrency-data)
- [CoinAPI Blog - Best Crypto Data Platforms 2026](https://www.coinapi.io/blog/best-crypto-data-platforms-2026)
- [Top Blockchain Databases - LogRocket](https://blog.logrocket.com/top-7-blockchain-based-databases/)

**Authentication:**
- [OAuth for Mobile Apps Best Practices - Curity](https://curity.io/resources/learn/oauth-for-mobile-apps-best-practices/)
- [User Authentication Best Practices 2026 - Authgear](https://www.authgear.com/post/top-three-types-of-user-authentication-methods)
- [OWASP Mobile App Auth Security](https://mas.owasp.org/MASTG/0x04e-Testing-Authentication-and-Session-Management/)

**Security:**
- [Crypto APIs Safety Explained - Token Metrics](https://www.tokenmetrics.com/blog/crypto-apis-safety-explained)
- [API Key Management Best Practices 2025](https://multitaskai.com/blog/api-key-management-best-practices/)
- [FinTech App Security - Apriorit](https://www.apriorit.com/dev-blog/create-secure-fintech-apps)

**DeFi Monitoring:**
- [DefiLlama Dashboard](https://defillama.com/)
- [Liquidity Pool Monitoring - Veritas Protocol](https://www.veritasprotocol.com/blog/liquidity-pull-monitor-pool-changes-and-alerts)
- [Event Driven DeFi Portfolio Tracker - AWS](https://aws.amazon.com/blogs/web3/implementing-an-event-driven-defi-portfolio-tracker-on-aws/)

**Competitors:**
- [CoinMarketCap](https://coinmarketcap.com/)
- [CryptoAlerting](https://cryptocurrencyalerting.com/)
- [Coinbase](https://www.coinbase.com/)

---

**Document Version:** 1.0
**Last Updated:** 2026-02-11
**Prepared for:** ORBIT Development Team

---

*This document is a living blueprint. Update it as you progress through development and learn from user feedback.*
