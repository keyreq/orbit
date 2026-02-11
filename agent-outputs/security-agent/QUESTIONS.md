# Security Agent - Questions for Human Approval

**Agent:** Security Specialist (security-agent)
**Date:** 2026-02-11
**Status:** AWAITING DECISIONS

---

## URGENT Questions (Need Decision Before Implementation)

### Q1: Rate Limiting Configuration
**Context:** Need to implement rate limiting to prevent API abuse and DDoS attacks.

**Proposed Configuration:**
```typescript
const rateLimits = {
  // Per authenticated user
  perUser: {
    requests: 60,
    window: '1m',  // per minute
  },

  // Per IP address (for unauthenticated)
  perIP: {
    requests: 100,
    window: '1m',
  },

  // Specific endpoints
  newsSearch: {
    requests: 30,
    window: '1h',  // per hour
  },

  alertCreation: {
    requests: 10,
    window: '1h',
  },
}
```

**Alternative Options:**
1. **More Strict:** 30 req/min per user, 50 req/min per IP
2. **Less Strict:** 120 req/min per user, 200 req/min per IP
3. **Custom:** Specify your own limits

**Question:** Which rate limiting configuration should I implement?

**Impact:**
- Too strict: May frustrate legitimate users
- Too loose: May not prevent abuse effectively

**Recommendation:** Start with proposed (moderate), adjust based on usage patterns.

**Your Decision:** _____________

---

### Q2: Content Security Policy (CSP) Strictness
**Context:** CSP headers prevent XSS attacks but may break some features if too strict.

**Option A: Strict CSP (Maximum Security)**
```typescript
"Content-Security-Policy": `
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' wss://stream.binance.com https://api.coingecko.com;
  frame-ancestors 'none';
`
```
**Pros:** Maximum security, prevents most XSS attacks
**Cons:** May break Recharts, inline styles, CDN resources

**Option B: Moderate CSP (Balanced)**
```typescript
"Content-Security-Policy": `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' wss: https:;
  frame-ancestors 'none';
`
```
**Pros:** More compatible with React/Recharts, still secure
**Cons:** Allows inline scripts (higher XSS risk)

**Option C: Relaxed CSP (Development-Friendly)**
```typescript
"Content-Security-Policy": `
  default-src 'self' 'unsafe-inline' 'unsafe-eval';
  connect-src *;
  img-src *;
`
```
**Pros:** Won't break anything during development
**Cons:** Minimal security benefit

**Question:** Which CSP policy should I implement?

**Recommendation:** Start with Option B (Moderate), tighten to Option A after testing.

**Your Decision:** _____________

---

### Q3: Can I Start on Input Validation Now?
**Context:** Input validation with Zod schemas is NOT blocked by Infrastructure Agent. I can create the validation library now.

**Proposed Action:**
- Create `lib/validation.ts` with all Zod schemas
- Create validation utilities
- Document usage for other agents
- Won't integrate until API routes exist

**Files to Create:**
```
lib/
  validation.ts          (Zod schemas)
  middleware/
    validateRequest.ts   (Validation middleware - ready for API routes)
```

**Question:** Should I proceed with creating validation schemas now, or wait until API routes are ready?

**Pros of Starting Now:**
- Gets work done while waiting for Infrastructure
- Other agents can reference schemas
- Ready to integrate immediately

**Cons of Starting Now:**
- Can't test until API routes exist
- May need adjustments during integration

**Your Decision:** _____________

---

## HIGH Priority Questions (Need Decision This Week)

### Q4: X-Frame-Options Configuration
**Context:** Prevents clickjacking attacks by controlling iframe embedding.

**Option A: DENY (Strictest)**
```typescript
"X-Frame-Options": "DENY"
```
- Prevents embedding ORBIT in ANY iframe
- Maximum clickjacking protection
- **Impact:** Cannot embed dashboard in other sites

**Option B: SAMEORIGIN (Moderate)**
```typescript
"X-Frame-Options": "SAMEORIGIN"
```
- Allows embedding only from same domain
- Good protection, more flexible
- **Impact:** Can embed dashboard in your own sites

**Question:** Which X-Frame-Options setting?

**Recommendation:** DENY (unless you plan to embed dashboard elsewhere)

**Your Decision:** _____________

---

### Q5: API Key Rotation Schedule
**Context:** Regular key rotation improves security but requires coordination.

**Proposed Schedule:**
- **Development Keys:** Rotate every 90 days
- **Production Keys:** Rotate every 60 days
- **Emergency Rotation:** Within 1 hour of suspected compromise

**Alternative:**
- Manual rotation only (when needed)
- More frequent (every 30 days)
- Less frequent (every 180 days)

**Question:** Should I implement automated API key rotation now, or wait until after MVP launch?

**Pros of Implementing Now:**
- Better security from day 1
- Established process from the start

**Cons of Implementing Now:**
- Adds complexity
- May not be needed for MVP

**Recommendation:** Document the process now, implement automation post-launch.

**Your Decision:** _____________

---

### Q6: Error Reporting Configuration
**Context:** Need to decide how to handle security errors and logging.

**Option A: External Service (Sentry)**
- Centralized error tracking
- Better monitoring and alerting
- **Cost:** Free tier: 5,000 events/month
- **Privacy:** Error data sent to third party

**Option B: Internal Logging Only**
- Keep all data internal
- Lower cost
- **Downside:** Harder to monitor, no alerting

**Option C: Hybrid**
- Security errors: Internal only
- Application errors: Send to Sentry

**Question:** How should security errors be logged?

**Recommendation:** Option C (Hybrid) - keeps security data internal while getting Sentry benefits for app errors.

**Your Decision:** _____________

---

## MEDIUM Priority Questions (Can Decide Later)

### Q7: Security Monitoring Tools
**Context:** Need to set up ongoing security monitoring.

**Options:**
1. **Snyk** - Automated dependency scanning (Free tier available)
2. **SonarQube** - Code quality and security (Open source)
3. **GitHub Dependabot** - Automated dependency updates (Free)
4. **OWASP ZAP** - Penetration testing (Free, open source)

**Question:** Which security monitoring tools should we use?

**Recommendation:** Start with GitHub Dependabot (free, easy), add others later.

**Your Decision:** _____________

---

### Q8: Secrets Management for Production
**Context:** Need secure way to manage API keys in production.

**Option A: Vercel Environment Variables**
- Simple, integrated with deployment
- Encrypted at rest
- **Cost:** Free with Vercel

**Option B: AWS Secrets Manager**
- Enterprise-grade
- Automatic rotation
- **Cost:** $0.40 per secret per month + API calls

**Option C: HashiCorp Vault**
- Self-hosted or cloud
- Maximum control
- **Cost:** Free (open source) or paid (cloud)

**Question:** Which secrets management solution for production?

**Recommendation:** Start with Vercel env vars (simple), migrate to AWS Secrets Manager when needed.

**Your Decision:** _____________

---

### Q9: Security Headers - Permissions-Policy
**Context:** Controls what browser features the app can access.

**Proposed Configuration:**
```typescript
"Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()"
```

**This DISABLES:**
- Camera access
- Microphone access
- Geolocation
- Payment API

**Question:** Should ORBIT need any of these permissions in the future?

**Possible Use Cases:**
- Camera: QR code scanning for wallet addresses (future feature?)
- Geolocation: Region-specific content (unlikely)
- Payment: Web3 wallet integration (may need)

**Recommendation:** Start with all disabled, enable camera() if QR scanning is added.

**Your Decision:** _____________

---

### Q10: Rate Limit Response Format
**Context:** When rate limit is exceeded, what should the API return?

**Option A: Standard HTTP 429**
```json
{
  "error": "Too Many Requests",
  "retryAfter": 60,
  "limit": 60,
  "remaining": 0
}
```

**Option B: Detailed Response**
```json
{
  "error": "Rate limit exceeded",
  "message": "You have made 61 requests in the last minute. Limit is 60/minute.",
  "retryAfter": 45,
  "limit": 60,
  "remaining": 0,
  "resetAt": "2026-02-11T19:45:00Z"
}
```

**Question:** Which rate limit response format?

**Recommendation:** Option B (Detailed) - helps users understand the limit.

**Your Decision:** _____________

---

## Decision Summary

| Question | Priority | Status | Decision | Date |
|----------|----------|--------|----------|------|
| Q1: Rate Limiting Config | URGENT | 🟡 PENDING | | |
| Q2: CSP Strictness | URGENT | 🟡 PENDING | | |
| Q3: Start Validation Now? | URGENT | 🟡 PENDING | | |
| Q4: X-Frame-Options | HIGH | 🟡 PENDING | | |
| Q5: API Key Rotation | HIGH | 🟡 PENDING | | |
| Q6: Error Reporting | HIGH | 🟡 PENDING | | |
| Q7: Monitoring Tools | MEDIUM | 🟡 PENDING | | |
| Q8: Secrets Management | MEDIUM | 🟡 PENDING | | |
| Q9: Permissions-Policy | MEDIUM | 🟡 PENDING | | |
| Q10: Rate Limit Response | MEDIUM | 🟡 PENDING | | |

---

## How to Provide Decisions

**Option 1: Update This File**
Edit the "Your Decision" fields above and save.

**Option 2: Reply in Chat**
Provide answers in this format:
```
Q1: Proposed configuration (60 req/min)
Q2: Option B (Moderate CSP)
Q3: Yes, start validation now
...
```

**Option 3: Discuss**
Let's discuss any questions you're unsure about.

---

## Impact of Delayed Decisions

**If Q1-Q3 not decided:**
- Cannot complete rate limiting implementation
- Cannot finalize API security
- May delay entire security implementation by 1-2 days

**If Q4-Q6 not decided:**
- Can proceed with defaults
- Can adjust later without major rework

**If Q7-Q10 not decided:**
- No immediate impact
- Can use defaults and adjust post-launch

---

**Agent Status:** 🟡 AWAITING HUMAN DECISIONS
**Urgency:** HIGH (for Q1-Q3)
**Next Update:** After receiving decisions

---

*Please provide decisions at your earliest convenience so I can proceed with implementation.*
