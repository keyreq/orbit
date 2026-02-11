# ORBIT - System Architecture

**Current State:** Infrastructure Complete ✅
**Next.js Version:** 16.1.6
**Status:** Ready for Phase 2 Development

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js 15 App Router (Server + Client Components)     │   │
│  │  - app/page.tsx (Main Dashboard)                         │   │
│  │  - app/layout.tsx (Root Layout)                          │   │
│  │  - components/* (React Components)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │ HTTPS / API Calls                 │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                        API Gateway Layer                          │
│                    (Next.js API Routes)                           │
│                                                                   │
│  app/api/                                                         │
│  ├── health/route.ts          ✅ Health Check                    │
│  ├── auth/[...nextauth]/      ⏳ Authentication (Auth Agent)     │
│  ├── alerts/route.ts          ⏳ Alerts (Alert Agent)            │
│  ├── prices/route.ts          ⏳ Prices (Price Agent)            │
│  ├── prices/stream/route.ts  ⏳ Real-time Prices (SSE)           │
│  ├── defi/route.ts            ⏳ DeFi Positions (DeFi Agent)     │
│  └── news/route.ts            ⏳ News Aggregation (News Agent)   │
│                              │                                    │
└──────────────────────────────┼───────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼─────────┐  ┌────────▼─────────┐  ┌──────▼──────────┐
│   Database Layer │  │   Cache Layer    │  │  External APIs  │
│                  │  │                  │  │                 │
│  MongoDB Atlas   │  │  Redis Cloud     │  │  Gemini AI      │
│  ┌────────────┐  │  │  ┌────────────┐  │  │  Binance        │
│  │ users      │  │  │  │ price:*    │  │  │  CoinGecko      │
│  │ alerts     │  │  │  │ session:*  │  │  │  Alchemy        │
│  │ positions  │  │  │  │ ratelimit:*│  │  │  CryptoPanic    │
│  │ wallets    │  │  │  └────────────┘  │  │                 │
│  │ news_cache │  │  │                  │  │                 │
│  └────────────┘  │  │  Pub/Sub:        │  │                 │
│                  │  │  - price-updates │  │                 │
└──────────────────┘  └──────────────────┘  └─────────────────┘
```

---

## Application Structure

```
orbit/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main dashboard page
│   ├── globals.css                   # Global styles
│   │
│   └── api/                          # API Routes
│       ├── health/
│       │   └── route.ts              ✅ Health check
│       ├── auth/
│       │   └── [...nextauth]/        ⏳ NextAuth routes
│       ├── alerts/
│       │   ├── route.ts              ⏳ CRUD operations
│       │   └── [id]/route.ts         ⏳ Individual alert
│       ├── prices/
│       │   ├── route.ts              ⏳ Current prices
│       │   ├── stream/route.ts       ⏳ Real-time SSE
│       │   └── history/[symbol]/     ⏳ Historical data
│       ├── defi/
│       │   ├── positions/route.ts    ⏳ Get positions
│       │   └── wallets/route.ts      ⏳ Wallet management
│       └── news/
│           └── route.ts              ⏳ News search
│
├── components/                       # React Components
│   ├── Sidebar.tsx                   ✅ Navigation
│   ├── Dashboard.tsx                 ✅ Market overview
│   ├── NewsFeed.tsx                  ✅ AI-powered news
│   ├── DeFiPortfolio.tsx             ✅ Portfolio view
│   ├── AlertsView.tsx                ✅ Alert management
│   └── ArchitectureView.tsx          ✅ Meta view
│
├── lib/                              # Shared Libraries
│   ├── db/
│   │   ├── mongodb.ts                ✅ MongoDB connection
│   │   └── redis.ts                  ✅ Redis connection
│   ├── auth.ts                       ⏳ NextAuth config
│   ├── ratelimit.ts                  ⏳ Rate limiting
│   └── validation.ts                 ⏳ Zod schemas
│
├── services/                         # Business Logic
│   ├── geminiService.ts              ✅ AI news (needs securing)
│   ├── price-feeds/
│   │   ├── binance.ts                ⏳ Binance WebSocket
│   │   └── coingecko.ts              ⏳ CoinGecko API
│   ├── alert-monitor/
│   │   └── index.ts                  ⏳ Alert monitoring
│   └── defi-indexer/
│       └── index.ts                  ⏳ Position indexing
│
├── scripts/
│   └── setup-db.ts                   ✅ Database initialization
│
├── types.ts                          ✅ TypeScript definitions
│
└── agent-outputs/                    # Agent Documentation
    └── infrastructure-agent/
        ├── STATUS.md                 ✅ Current status
        ├── QUESTIONS.md              ✅ Decisions
        ├── HANDOFF.md                ✅ Technical docs
        └── COMPLETED.md              ✅ Completion report
```

---

## Database Schema

### MongoDB Collections

#### 1. users
```typescript
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

Indexes:
- email (unique)
- authProvider
- authProviderId
- createdAt
```

#### 2. alerts
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'price' | 'defi' | 'news',
  token: string,
  condition: 'above' | 'below',
  targetPrice: number,
  active: boolean,
  triggeredAt: Date?,
  createdAt: Date,
  expiresAt: Date // TTL: 90 days
}

Indexes:
- userId
- token
- active
- userId + active (compound)
- token + active (compound)
- createdAt (TTL: 90 days)
```

#### 3. defi_positions
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  walletAddress: string,
  protocol: string,
  type: 'liquidity_pool' | 'staking' | 'lending',
  asset: string,
  value: number,
  apy: number,
  lastSyncedAt: Date,
  chain: string
}

Indexes:
- userId
- walletAddress
- userId + walletAddress (compound)
- protocol
- lastSyncedAt
```

#### 4. wallets
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  address: string,
  label: string?,
  chain: string,
  connectedAt: Date
}

Indexes:
- userId
- address (unique)
- userId + address (compound)
```

#### 5. news_cache
```typescript
{
  _id: ObjectId,
  topic: string,
  items: Array<NewsItem>,
  cachedAt: Date,
  expiresAt: Date // TTL: 6 hours
}

Indexes:
- topic
- cachedAt (TTL: 6 hours)
```

#### 6. notifications
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'alert' | 'defi' | 'news',
  title: string,
  body: string,
  read: boolean,
  createdAt: Date
}

Indexes:
- userId
- userId + read (compound)
- createdAt (TTL: 30 days)
```

---

## Redis Data Structures

### Cache Keys
```
price:{symbol}              → string (price value)
  TTL: 10 seconds
  Example: price:BTC → "45000.50"

news:cache:{topic}          → JSON (cached news)
  TTL: 6 hours
  Example: news:cache:bitcoin → {...}

defi:tvl:{protocol}         → JSON (TVL data)
  TTL: 5 minutes
  Example: defi:tvl:aave → {...}
```

### Session Keys
```
user:session:{token}        → JSON (session data)
  TTL: 30 days
  Example: user:session:abc123 → {userId, expiresAt}
```

### Rate Limiting
```
ratelimit:{userId}:{endpoint} → counter
  TTL: 60 seconds
  Example: ratelimit:user123:/api/prices → 15
```

### Pub/Sub Channels
```
price-updates               → Real-time price changes
  Message: {symbol, price, change24h}

alert-triggers              → Alert notifications
  Message: {alertId, userId, token, price}
```

---

## API Endpoints

### Current Status
✅ = Implemented
⏳ = Ready for implementation
❌ = Not yet planned

### Health & Monitoring
```
GET  /api/health                 ✅ System health check
```

### Authentication
```
POST /api/auth/signin            ⏳ Sign in with OAuth
POST /api/auth/signout           ⏳ Sign out
GET  /api/auth/session           ⏳ Get current session
```

### Alerts
```
GET    /api/alerts               ⏳ List user alerts
POST   /api/alerts               ⏳ Create alert
GET    /api/alerts/[id]          ⏳ Get alert details
PATCH  /api/alerts/[id]          ⏳ Update alert
DELETE /api/alerts/[id]          ⏳ Delete alert
```

### Prices
```
GET  /api/prices                 ⏳ Get current prices
GET  /api/prices/stream          ⏳ Real-time SSE stream
GET  /api/prices/history/[symbol] ⏳ Historical data
```

### DeFi
```
GET    /api/defi/positions       ⏳ Get user positions
POST   /api/defi/wallets         ⏳ Connect wallet
GET    /api/defi/wallets         ⏳ List wallets
DELETE /api/defi/wallets/[id]    ⏳ Disconnect wallet
```

### News
```
POST /api/news                   ⏳ Search crypto news
GET  /api/news/trending          ⏳ Get trending news
```

---

## Data Flow Examples

### 1. Real-Time Price Updates
```
┌──────────────┐
│   Binance    │
│   WebSocket  │
└──────┬───────┘
       │ price update
       ▼
┌──────────────────┐
│  Price Worker    │
│  (Background)    │
└──────┬───────────┘
       │
       ├─── Redis SET price:BTC → 45000
       │    (10 second TTL)
       │
       └─── Redis PUBLISH price-updates
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │  Alert   │ │   SSE    │ │  Cache   │
   │  Monitor │ │ Endpoint │ │  Update  │
   └──────────┘ └──────────┘ └──────────┘
```

### 2. Alert Trigger Flow
```
┌──────────────┐
│ Redis PubSub │
│ price-updates│
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Alert Monitor    │
│ 1. Get alerts    │─────► MongoDB: alerts collection
│ 2. Check trigger │
│ 3. Send notify   │
└──────┬───────────┘
       │
       ├─── Update MongoDB: set triggeredAt
       │
       └─── Send Notification
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Email  │ │  Push  │ │Telegram│
└────────┘ └────────┘ └────────┘
```

### 3. DeFi Position Sync
```
┌──────────────┐
│   Frontend   │
│ Connect Wallet│
└──────┬───────┘
       │ POST /api/defi/wallets
       ▼
┌──────────────────┐
│  DeFi API Route  │
│ 1. Save wallet   │─────► MongoDB: wallets
│ 2. Trigger sync  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  DeFi Indexer    │
│ (Background)     │
├──────────────────┤
│ 1. Query Alchemy │◄───── Alchemy API
│ 2. Get positions │◄───── Aave, Uniswap, etc.
│ 3. Save to DB    │─────► MongoDB: defi_positions
└──────────────────┘
```

---

## Security Architecture

### 1. Authentication Flow
```
User Browser
    │
    ├─ OAuth (Google/Apple)
    │   └─► Redirect to provider
    │       └─► Callback to /api/auth/callback
    │           └─► NextAuth creates JWT
    │               └─► Store in secure cookie
    │
    └─ Protected Routes
        └─► middleware.ts checks JWT
            ├─ Valid: Allow access
            └─ Invalid: Redirect to login
```

### 2. API Security Layers
```
API Request
    │
    ├─► 1. Rate Limiting (Redis)
    │      ├─ Check: ratelimit:{userId}:{endpoint}
    │      ├─ Allowed: Continue
    │      └─ Exceeded: 429 Too Many Requests
    │
    ├─► 2. Authentication (NextAuth)
    │      ├─ Check: Valid session
    │      ├─ Valid: Continue
    │      └─ Invalid: 401 Unauthorized
    │
    ├─► 3. Input Validation (Zod)
    │      ├─ Parse request body
    │      ├─ Valid: Continue
    │      └─ Invalid: 400 Bad Request
    │
    └─► 4. Business Logic
           └─► Response
```

### 3. Environment Variables
```
Client-Side (NEXT_PUBLIC_*)
    ├─ NEXT_PUBLIC_APP_URL
    └─ NEXT_PUBLIC_SENTRY_DSN

Server-Side Only
    ├─ MONGODB_URI
    ├─ REDIS_URL
    ├─ NEXTAUTH_SECRET
    ├─ GEMINI_API_KEY
    ├─ ALCHEMY_API_KEY
    └─ All other sensitive keys
```

---

## Performance Optimization

### 1. Caching Strategy
```
Hot Data (Redis, 10s-60s)
    ├─ Current prices
    ├─ Active sessions
    └─ Rate limit counters

Warm Data (Redis, 5m-6h)
    ├─ News cache
    ├─ DeFi protocol TVL
    └─ User preferences

Cold Data (MongoDB)
    ├─ Historical alerts
    ├─ Old positions
    └─ Archived notifications
```

### 2. Query Optimization
```
MongoDB Indexes
    ├─ Single field: userId, email, token
    ├─ Compound: userId+active, token+active
    └─ TTL: createdAt (automatic cleanup)

Redis Patterns
    ├─ Hash: User sessions
    ├─ String: Simple caching
    ├─ Sorted Set: Leaderboards (future)
    └─ Pub/Sub: Real-time updates
```

---

## Deployment Architecture

### Development
```
Local Machine
    ├─ Next.js Dev Server (localhost:3000)
    ├─ MongoDB Atlas (M0 Free Tier)
    ├─ Redis Cloud (Free 30MB)
    └─ Environment: .env.local
```

### Production
```
Vercel (Web App)
    ├─ Next.js Production Build
    ├─ Automatic SSL/CDN
    ├─ Environment variables in dashboard
    └─ Auto-deploy from GitHub main

Railway (Workers)
    ├─ Alert Monitor Worker
    ├─ DeFi Indexer Worker
    ├─ News Aggregator Worker
    └─ Environment variables in settings

MongoDB Atlas (Database)
    ├─ Production cluster (M10)
    ├─ Multi-region replication
    └─ Automatic backups

Redis Cloud (Cache)
    ├─ Production instance
    ├─ Persistence enabled (AOF)
    └─ Multi-AZ deployment
```

---

## Monitoring & Observability

### Application Monitoring
```
Sentry (Error Tracking)
    ├─ Frontend errors
    ├─ API route errors
    └─ Worker errors

Axiom (Logging)
    ├─ API request logs
    ├─ Worker logs
    └─ Performance metrics

Vercel Analytics
    ├─ Web vitals
    ├─ Page load times
    └─ User engagement
```

### Database Monitoring
```
MongoDB Atlas
    ├─ Query performance
    ├─ Connection pool status
    └─ Storage usage

Redis Cloud
    ├─ Memory usage
    ├─ Hit/miss ratio
    └─ Pub/sub throughput
```

---

## Next Phase: Implementation Plan

### Phase 1 (This Week)
```
Authentication Agent
    ├─ NextAuth configuration
    ├─ OAuth providers (Google, Apple)
    ├─ Session management
    └─ Protected routes

Security Agent
    ├─ Move Gemini to server-side
    ├─ Implement rate limiting
    ├─ Add input validation
    └─ Security headers
```

### Phase 2 (Next Week)
```
Price Agent
    ├─ Binance WebSocket integration
    ├─ Redis caching
    ├─ Real-time SSE endpoint
    └─ Historical data API

Alert Agent
    ├─ Alert CRUD API
    ├─ Background monitor worker
    ├─ Email notifications
    └─ Push notifications

DeFi Agent
    ├─ Wallet connection
    ├─ Alchemy integration
    ├─ Position indexer
    └─ Change detection

News Agent
    ├─ Multi-source aggregation
    ├─ CryptoPanic integration
    ├─ Twitter scraping
    └─ Sentiment analysis
```

---

## Architecture Benefits

### Scalability
- ✅ Horizontal scaling with Next.js
- ✅ MongoDB sharding support
- ✅ Redis clustering ready
- ✅ Background workers isolated

### Maintainability
- ✅ Clear separation of concerns
- ✅ TypeScript for type safety
- ✅ Documented patterns
- ✅ Modular agent architecture

### Performance
- ✅ Redis caching layer
- ✅ MongoDB indexed queries
- ✅ Real-time updates via Pub/Sub
- ✅ Efficient data structures

### Security
- ✅ Server-side API keys
- ✅ Rate limiting ready
- ✅ Input validation framework
- ✅ Authentication prepared

---

**Architecture Document Version:** 1.0
**Last Updated:** 2026-02-11
**Status:** Infrastructure Phase Complete ✅
