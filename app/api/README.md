# ORBIT API Routes

This directory contains all API routes for the ORBIT application.

## Structure

```
app/api/
├── health/           # Health check endpoint
├── alerts/           # Price alert management (Alert Agent)
├── prices/           # Real-time price data (Price Agent)
├── defi/             # DeFi position tracking (DeFi Agent)
├── news/             # News aggregation (News Agent)
├── notifications/    # Notification delivery (Notification Agent)
└── auth/             # Authentication (Auth Agent)
```

## Available Endpoints

### Health Check
- `GET /api/health` - Check API and database status

### Alerts (To be implemented by Alert Agent)
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/[id]` - Update alert
- `DELETE /api/alerts/[id]` - Delete alert

### Prices (To be implemented by Price Agent)
- `GET /api/prices` - Get current prices
- `GET /api/prices/stream` - Real-time price updates (SSE)
- `GET /api/prices/history/[symbol]` - Historical price data

### DeFi (To be implemented by DeFi Agent)
- `GET /api/defi/positions` - Get user's DeFi positions
- `POST /api/defi/wallets` - Connect new wallet
- `GET /api/defi/wallets` - Get connected wallets
- `DELETE /api/defi/wallets/[id]` - Disconnect wallet

### News (To be implemented by News Agent)
- `POST /api/news` - Search crypto news
- `GET /api/news/trending` - Get trending news

### Notifications (To be implemented by Notification Agent)
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/settings` - Update notification preferences

## API Standards

### Authentication
All protected routes should check for valid session:
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of handler
}
```

### Rate Limiting
Apply rate limiting to prevent abuse:
```typescript
import { redisHelpers } from '@/lib/db/redis'

const rateLimitKey = `ratelimit:${userId}:${endpoint}`
const allowed = await redisHelpers.rateLimit(rateLimitKey, 30, 60) // 30 req/min

if (!allowed) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  )
}
```

### Input Validation
Use Zod for request validation:
```typescript
import { z } from 'zod'

const CreateAlertSchema = z.object({
  token: z.string().min(1).max(10),
  condition: z.enum(['above', 'below']),
  targetPrice: z.number().positive(),
})

const body = await request.json()
const validated = CreateAlertSchema.parse(body)
```

### Error Handling
Standardized error responses:
```typescript
try {
  // ... operation
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: 'Internal server error', details: error.message },
    { status: 500 }
  )
}
```

### Response Format
Consistent JSON response structure:
```typescript
// Success
{
  "data": { ... },
  "timestamp": "2026-02-11T12:00:00Z"
}

// Error
{
  "error": "Error message",
  "details": "Additional details",
  "timestamp": "2026-02-11T12:00:00Z"
}
```

## Integration Points

### For Alert Agent
- Use `redisHelpers.publish('price-updates', data)` to subscribe to prices
- Use `getCollection('alerts')` to access MongoDB alerts collection

### For Price Agent
- Use `redisHelpers.setCache('price:BTC', price, 10)` to cache prices
- Use `redisHelpers.publish('price-updates', { symbol, price })` to broadcast

### For DeFi Agent
- Use `getCollection('defi_positions')` for position storage
- Use `getCollection('wallets')` for wallet management

### For News Agent
- Use `getCollection('news_cache')` for caching news
- Cache duration: 6 hours (TTL index configured)

## Security Notes

1. **Never expose API keys** - Use server-side environment variables only
2. **Always validate input** - Use Zod schemas
3. **Implement rate limiting** - Protect against abuse
4. **Check authentication** - Verify user sessions
5. **Use HTTPS only** - Enforce in production

## Testing

Test endpoints using:
```bash
# Health check
curl http://localhost:3000/api/health

# With authentication (after login)
curl http://localhost:3000/api/alerts \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

## Next Steps

Each agent will implement their respective API routes following these patterns.
Refer to this documentation when creating new endpoints.
