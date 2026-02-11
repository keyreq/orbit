# 🔌 ORBIT API Specification

## RESTful API Endpoints for ORBIT Crypto Command Center

**Base URL (Development):** `http://localhost:3000/api`
**Base URL (Production):** `https://orbit.app/api`

**Authentication:** All endpoints require authentication via NextAuth.js session cookie, except where noted.

**Rate Limits:**
- Authenticated users: 60 requests/minute
- Unauthenticated: 10 requests/minute

---

## 📑 Table of Contents

1. [Authentication](#authentication)
2. [Price Alerts](#price-alerts)
3. [DeFi Positions](#defi-positions)
4. [News Feed](#news-feed)
5. [User Settings](#user-settings)
6. [WebSocket Endpoints](#websocket-endpoints)

---

## 🔐 Authentication

### POST `/api/auth/signin`
**Description:** Authenticate user via OAuth provider

**Request Body:**
```json
{
  "provider": "google" | "apple" | "twitter"
}
```

**Response:**
```json
{
  "success": true,
  "redirectUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### GET `/api/auth/session`
**Description:** Get current user session

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://...",
    "provider": "google"
  },
  "expires": "2026-03-15T12:00:00.000Z"
}
```

### POST `/api/auth/signout`
**Description:** Sign out current user

**Response:**
```json
{
  "success": true
}
```

---

## 🚨 Price Alerts

### GET `/api/alerts`
**Description:** Get all alerts for current user

**Query Parameters:**
- `active` (boolean, optional): Filter by active status
- `token` (string, optional): Filter by token symbol
- `limit` (number, optional): Max results (default: 50)
- `offset` (number, optional): Pagination offset

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_123",
      "token": "BTC",
      "condition": "above" | "below",
      "targetPrice": 45000,
      "active": true,
      "createdAt": "2026-02-11T10:00:00.000Z",
      "triggeredAt": null,
      "triggerCount": 0
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

### POST `/api/alerts`
**Description:** Create new price alert

**Request Body:**
```json
{
  "token": "BTC",
  "condition": "above" | "below",
  "targetPrice": 45000,
  "notificationChannels": ["email", "push", "telegram"]
}
```

**Validation:**
- `token`: 1-10 uppercase alphanumeric characters
- `condition`: Must be "above" or "below"
- `targetPrice`: Positive number, max 10,000,000
- `notificationChannels`: Array of enabled channels

**Response:**
```json
{
  "success": true,
  "alert": {
    "id": "alert_124",
    "token": "BTC",
    "condition": "above",
    "targetPrice": 45000,
    "active": true,
    "createdAt": "2026-02-11T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input
- `429 Too Many Requests`: Rate limit exceeded (10 alerts/hour)
- `401 Unauthorized`: Not authenticated

### PATCH `/api/alerts/:id`
**Description:** Update existing alert

**Request Body:**
```json
{
  "active": false,
  "targetPrice": 50000
}
```

**Response:**
```json
{
  "success": true,
  "alert": {
    "id": "alert_123",
    "active": false,
    "targetPrice": 50000
  }
}
```

### DELETE `/api/alerts/:id`
**Description:** Delete alert

**Response:**
```json
{
  "success": true,
  "deletedId": "alert_123"
}
```

---

## 💼 DeFi Positions

### GET `/api/defi/positions`
**Description:** Get all DeFi positions for connected wallets

**Query Parameters:**
- `walletAddress` (string, optional): Filter by specific wallet
- `protocol` (string, optional): Filter by protocol (e.g., "Aave", "Uniswap")
- `type` (string, optional): Filter by type ("liquidity_pool", "staking", "lending")

**Response:**
```json
{
  "positions": [
    {
      "id": "pos_123",
      "walletAddress": "0x1234...",
      "protocol": "Aave V3",
      "type": "lending",
      "asset": "USDC",
      "value": 8200.50,
      "apy": 4.2,
      "chain": "ethereum",
      "lastUpdated": "2026-02-11T10:00:00.000Z"
    },
    {
      "id": "pos_124",
      "walletAddress": "0x1234...",
      "protocol": "Uniswap V3",
      "type": "liquidity_pool",
      "asset": "ETH/USDC",
      "value": 4500.00,
      "apy": 18.5,
      "chain": "ethereum",
      "positionId": "12345",
      "lastUpdated": "2026-02-11T10:00:00.000Z"
    }
  ],
  "totalValue": 12700.50,
  "totalCount": 2
}
```

### POST `/api/defi/wallets`
**Description:** Connect new wallet for tracking

**Request Body:**
```json
{
  "address": "0x1234567890abcdef...",
  "chain": "ethereum" | "polygon" | "arbitrum" | "optimism",
  "signature": "0xabcdef..." // Wallet signature for verification
}
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": "wallet_123",
    "address": "0x1234...",
    "chain": "ethereum",
    "connectedAt": "2026-02-11T10:00:00.000Z",
    "verified": true
  }
}
```

### DELETE `/api/defi/wallets/:id`
**Description:** Disconnect wallet

**Response:**
```json
{
  "success": true,
  "deletedId": "wallet_123"
}
```

### POST `/api/defi/sync/:walletId`
**Description:** Manually trigger position sync for wallet

**Response:**
```json
{
  "success": true,
  "syncedAt": "2026-02-11T10:35:00.000Z",
  "positionsFound": 4
}
```

---

## 📰 News Feed

### POST `/api/news/search`
**Description:** Search crypto news with AI aggregation

**Request Body:**
```json
{
  "topic": "Ethereum Layer 2",
  "sources": ["all", "twitter", "reddit", "youtube", "news"],
  "sentiment": "all" | "bullish" | "bearish" | "neutral",
  "timeframe": "24h" | "7d" | "30d"
}
```

**Response:**
```json
{
  "articles": [
    {
      "id": "news_123",
      "title": "Ethereum Layer 2 TVL Reaches $50B",
      "summary": "Total value locked in Ethereum Layer 2 solutions...",
      "source": "CoinDesk",
      "sourceType": "news",
      "url": "https://...",
      "sentiment": "bullish",
      "timestamp": "2h ago",
      "relevanceScore": 0.95
    }
  ],
  "totalResults": 42,
  "searchedSources": 5
}
```

### GET `/api/news/trending`
**Description:** Get trending crypto news (cached, updates every 10 minutes)

**Response:**
```json
{
  "trending": [
    {
      "topic": "Bitcoin ETF",
      "mentionCount": 1250,
      "sentiment": "bullish",
      "topStories": [
        {
          "title": "...",
          "url": "...",
          "source": "Bloomberg"
        }
      ]
    }
  ],
  "lastUpdated": "2026-02-11T10:30:00.000Z"
}
```

---

## ⚙️ User Settings

### GET `/api/user/settings`
**Description:** Get user preferences and settings

**Response:**
```json
{
  "settings": {
    "notificationChannels": ["email", "push", "telegram"],
    "emailVerified": true,
    "telegramChatId": "123456789",
    "theme": "dark",
    "currency": "USD",
    "timezone": "America/New_York",
    "alertSound": true,
    "emailDigest": "daily" | "weekly" | "never"
  }
}
```

### PATCH `/api/user/settings`
**Description:** Update user settings

**Request Body:**
```json
{
  "notificationChannels": ["email", "telegram"],
  "theme": "light",
  "alertSound": false
}
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "notificationChannels": ["email", "telegram"],
    "theme": "light",
    "alertSound": false
  }
}
```

### POST `/api/user/telegram/link`
**Description:** Generate Telegram bot link token

**Response:**
```json
{
  "success": true,
  "linkUrl": "https://t.me/OrbitAlertsBot?start=user_123_abc",
  "expiresIn": 900 // seconds
}
```

---

## 📊 Price Data

### GET `/api/prices`
**Description:** Get current prices for multiple tokens

**Query Parameters:**
- `symbols` (string, required): Comma-separated list (e.g., "BTC,ETH,SOL")

**Response:**
```json
{
  "prices": {
    "BTC": {
      "price": 43850.50,
      "change24h": 2.5,
      "volume24h": "28000000000",
      "marketCap": "850000000000",
      "lastUpdated": "2026-02-11T10:35:45.000Z"
    },
    "ETH": {
      "price": 2380.12,
      "change24h": 1.8,
      "volume24h": "15000000000",
      "marketCap": "280000000000",
      "lastUpdated": "2026-02-11T10:35:45.000Z"
    }
  }
}
```

### GET `/api/prices/:symbol/history`
**Description:** Get historical price data

**Query Parameters:**
- `timeframe` (string): "1h", "24h", "7d", "30d", "1y"
- `interval` (string): "1m", "5m", "1h", "1d"

**Response:**
```json
{
  "symbol": "BTC",
  "timeframe": "24h",
  "interval": "1h",
  "data": [
    {
      "timestamp": "2026-02-10T10:00:00.000Z",
      "open": 42800,
      "high": 43000,
      "low": 42700,
      "close": 42950,
      "volume": 1250000000
    }
  ]
}
```

---

## 🌐 WebSocket Endpoints

### WS `/api/ws/prices`
**Description:** Real-time price updates via WebSocket

**Connection:**
```javascript
const ws = new WebSocket('wss://orbit.app/api/ws/prices')

ws.onopen = () => {
  // Subscribe to symbols
  ws.send(JSON.stringify({
    type: 'subscribe',
    symbols: ['BTC', 'ETH', 'SOL']
  }))
}

ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  console.log(update)
  // {
  //   type: 'price_update',
  //   symbol: 'BTC',
  //   price: 43850.50,
  //   change24h: 2.5,
  //   timestamp: '2026-02-11T10:35:45.000Z'
  // }
}
```

**Message Types:**

**Subscribe:**
```json
{
  "type": "subscribe",
  "symbols": ["BTC", "ETH"]
}
```

**Unsubscribe:**
```json
{
  "type": "unsubscribe",
  "symbols": ["BTC"]
}
```

**Price Update (Server → Client):**
```json
{
  "type": "price_update",
  "symbol": "BTC",
  "price": 43850.50,
  "change24h": 2.5,
  "timestamp": "2026-02-11T10:35:45.000Z"
}
```

**Error (Server → Client):**
```json
{
  "type": "error",
  "message": "Invalid symbol: INVALID"
}
```

---

## 🔒 Error Response Format

All API errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "token": "Must be 1-10 uppercase characters",
      "targetPrice": "Must be a positive number"
    }
  },
  "requestId": "req_abc123"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## 🧪 Testing the API

### Using cURL

**Get prices:**
```bash
curl -X GET \
  'https://orbit.app/api/prices?symbols=BTC,ETH' \
  -H 'Cookie: next-auth.session-token=your-session-token'
```

**Create alert:**
```bash
curl -X POST \
  https://orbit.app/api/alerts \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=your-session-token' \
  -d '{
    "token": "BTC",
    "condition": "above",
    "targetPrice": 50000
  }'
```

### Using Postman

1. Import this collection: [ORBIT API Collection](https://www.postman.com/orbit-api)
2. Set environment variable `BASE_URL` to `http://localhost:3000/api`
3. Authenticate via `/api/auth/signin` to get session cookie
4. Test endpoints

---

## 📚 SDK & Client Libraries

### TypeScript Client (Recommended)

```typescript
import { OrbitClient } from '@orbit/api-client'

const client = new OrbitClient({
  apiKey: process.env.ORBIT_API_KEY,
  baseUrl: 'https://orbit.app/api'
})

// Get prices
const prices = await client.prices.get(['BTC', 'ETH'])

// Create alert
const alert = await client.alerts.create({
  token: 'BTC',
  condition: 'above',
  targetPrice: 50000
})

// Subscribe to real-time prices
client.prices.subscribe(['BTC', 'ETH'], (update) => {
  console.log(`${update.symbol}: $${update.price}`)
})
```

### Python Client

```python
from orbit import OrbitClient

client = OrbitClient(api_key='your-api-key')

# Get prices
prices = client.prices.get(['BTC', 'ETH'])

# Create alert
alert = client.alerts.create(
    token='BTC',
    condition='above',
    target_price=50000
)
```

---

## 🔄 Versioning

**Current Version:** v1

API versions are specified in the URL:
- `https://orbit.app/api/v1/alerts`
- `https://orbit.app/api/v2/alerts` (future)

We maintain backward compatibility for at least 6 months after a new version release.

---

## 📞 Support

- **API Status:** https://status.orbit.app
- **Documentation:** https://docs.orbit.app
- **Support Email:** api@orbit.app
- **Discord:** https://discord.gg/orbit

---

**Last Updated:** 2026-02-11
**API Version:** v1.0.0
