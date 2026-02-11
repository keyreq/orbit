# Infrastructure Agent - Questions for Human Approval

**Agent:** Infrastructure Architect
**Last Updated:** 2026-02-11

---

## Database Configuration

### Question 1: MongoDB Atlas Tier
**Decision Needed:** Which MongoDB Atlas tier should we use?

**Options:**
- **M0 Free Tier** (Recommended for development)
  - 512MB storage
  - Shared RAM
  - Free forever
  - Good for: Development, testing, MVP launch

- **M10 Paid Tier** ($57/month)
  - 10GB storage
  - 2GB RAM
  - Better performance
  - Good for: Production with < 1000 users

**Recommendation:** Start with M0 Free Tier for development. Can easily upgrade to M10 when launching to production or when we need better performance.

**Your Decision:** [PENDING]

---

### Question 2: Redis Configuration
**Decision Needed:** Which Redis solution should we use?

**Options:**
- **Redis Cloud Free Tier** (Recommended)
  - 30MB storage
  - Good for: Development, caching
  - Easy migration to paid tier

- **Upstash Redis** (Serverless)
  - Pay per request
  - 10,000 commands/day free
  - Good for: Low traffic, serverless deployment

- **Self-hosted Redis** (Docker)
  - Full control
  - No cost except hosting
  - Good for: Development only

**Recommendation:** Redis Cloud Free Tier for simplicity. Upstash if deploying to Vercel/serverless.

**Your Decision:** [PENDING]

---

## File Structure Preferences

### Question 3: Component Organization
**Decision Needed:** Keep existing component structure or reorganize?

**Current Structure:**
```
components/
├── Sidebar.tsx
├── Dashboard.tsx
├── NewsFeed.tsx
├── DeFiPortfolio.tsx
├── AlertsView.tsx
└── ArchitectureView.tsx
```

**Alternative Structure:**
```
components/
├── layout/
│   └── Sidebar.tsx
├── dashboard/
│   └── Dashboard.tsx
├── news/
│   └── NewsFeed.tsx
├── defi/
│   └── DeFiPortfolio.tsx
└── alerts/
    └── AlertsView.tsx
```

**Recommendation:** Keep existing flat structure for now. It's simple and works well. Can reorganize later if components grow.

**Your Decision:** [PENDING - Assuming keep existing structure unless you say otherwise]

---

## Security & Environment Variables

### Question 4: Environment Variable Management
**Decision Needed:** How should we handle environment variables in production?

**Options:**
- **Vercel Environment Variables** (Recommended)
  - Built-in UI for managing secrets
  - Automatic encryption
  - Easy to use

- **AWS Secrets Manager**
  - More complex
  - Better for enterprise
  - Requires AWS setup

- **.env files only**
  - Simple
  - Not recommended for production

**Recommendation:** Vercel Environment Variables for simplicity. We can always migrate to AWS Secrets Manager later if needed.

**Your Decision:** [PENDING - Assuming Vercel unless you say otherwise]

---

## API Rate Limiting

### Question 5: Rate Limiting Strategy
**Decision Needed:** How aggressive should rate limiting be?

**Options:**
- **Permissive** (100 requests/minute per user)
  - Good for: Development, testing
  - Risk: Potential abuse

- **Moderate** (30 requests/minute per user) - Recommended
  - Good for: Production with monitoring
  - Balance of security and usability

- **Strict** (10 requests/minute per user)
  - Good for: High security needs
  - May frustrate legitimate users

**Recommendation:** Start with Moderate (30/min). Can adjust based on real usage patterns.

**Your Decision:** [PENDING]

---

## Deployment Strategy

### Question 6: Worker Deployment
**Decision Needed:** Where should background workers run?

**Options:**
- **Railway** (Recommended in docs)
  - $5/month for basic worker
  - Easy deployment
  - Good monitoring

- **Vercel Cron Jobs**
  - Limited to scheduled jobs (not real-time)
  - Free tier available
  - Good for: Non-critical background tasks

- **Separate VPS**
  - More control
  - More complex setup
  - Good for: Complex worker needs

**Recommendation:** Railway for alert monitoring worker (needs real-time). Vercel Cron for less critical tasks like daily cleanup.

**Your Decision:** [PENDING]

---

## Action Items

If you approve the recommendations above, I will:
1. Proceed with M0 Free Tier MongoDB Atlas setup instructions
2. Use Redis Cloud Free Tier
3. Keep existing component structure
4. Set up for Vercel deployment
5. Implement moderate rate limiting (30/min)
6. Document Railway deployment for workers

**Please review and approve, or provide alternative direction.**

---

**Status:** Awaiting approval to proceed
