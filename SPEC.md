# SkoolarPlay - Stay-Free-Forever Technical Specification

## Overview

SkoolarPlay is designed to remain free for users forever through strategic use of free-tier services, aggressive caching, and careful cost management.

## Cost Optimization Strategies

### 1. Database: Turso (Edge SQLite)

| Plan | Storage | Price | Rows/DB |
|------|---------|-------|---------|
| Free | 9GB | $0 | Unlimited |
| Hobby | 30GB | $5/mo | Unlimited |

**Why Turso:**
- True serverless with embedded replicas
- Zero cold start time
- SQLite is perfect for read-heavy educational content
- Data never sleeps

**Optimization:**
- Embed replicas in the client for offline access
- Batch writes to reduce database calls
- Use IndexedDB as first-level cache

### 2. Backend: Vercel Serverless

| Plan | Serverless Functions | Bandwidth | Price |
|------|----------------------|-----------|-------|
| Hobby | 100K/month | 100GB | Free |
| Pro | 1M/month | 1TB | $20/mo |

**Optimization:**
- Aggressive caching of API responses
- ISR (Incremental Static Regeneration) for course pages
- Edge caching via Cloudflare
- Batch database operations

### 3. AI: OpenRouter (Free Models)

| Model | Input | Output | Free Tier |
|-------|-------|--------|-----------|
| Claude 3 Haiku | $0.25/1M | $1.25/1M | 30 RPM, 2K/day |
| Llama 3 | $0 | $0 | 1000/day |
| Gemma 2B | $0 | $0 | Unlimited |

**Optimization:**
- Aggressive rate limiting (Redis-backed)
- Context caching for repeated queries
- Free model as default, premium models optional
- Fallback to cached responses when rate limited

### 4. Rate Limiting: Upstash Redis

| Plan | Commands/Day | Price |
|------|--------------|-------|
| Free | 10,000 | Free |
| Pay-as-you-go | Unlimited | $0.20/10K |

**Optimization:**
- Sliding window rate limiting
- Per-endpoint rate limits
- Free tier is sufficient for 10K users

### 5. Payments: Paystack

- 1.5% + ₦100 per transaction (Nigeria)
- No monthly fees
- Only pay when you earn

**Why Paystack:**
- Lowest rates in Nigeria
- Instant settlements
- No hidden fees

### 6. CDN: Cloudflare (Free)

- Unlimited bandwidth
- 200+ edge locations
- Free SSL
- Image optimization

## Architecture for Scale

```
                    ┌─────────────────────────────────────────┐
                    │              Cloudflare CDN             │
                    │  (Static assets, Edge caching, SSL)    │
                    └─────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Vercel Serverless                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Next.js   │  │   Next.js   │  │   Next.js   │              │
│  │  (Web App)  │  │  (API Routes)│  │ (Cron Jobs) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Upstash Redis  │    │    Turso       │    │  OpenRouter    │
│ (Rate Limiting) │    │  (Database)    │    │   (AI Chat)    │
│   10K/day free  │    │   9GB free    │    │   Free tier    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Client Cache   │
                    │  (IndexedDB)    │
                    │   Unlimited     │
                    └─────────────────┘
```

## Caching Strategy

### Client-Side (IndexedDB)

```
┌─────────────────────────────────────────────────────────────┐
│                      IndexedDB                                │
├─────────────────────────────────────────────────────────────┤
│  courses/          │ Courses list            │ 1 hour TTL  │
│  lessons/           │ Lesson content          │ 24 hours    │
│  questions/          │ Quiz questions          │ 24 hours    │
│  user-progress/      │ User progress          │ 5 minutes   │
│  pending-sync/        │ Offline mutations       │ Until sync  │
└─────────────────────────────────────────────────────────────┘
```

### API-Level Caching

| Endpoint | Strategy | TTL | Revalidation |
|----------|----------|-----|--------------|
| `/api/courses` | ISR | 1 hour | On-demand |
| `/api/courses/[id]` | ISR | 1 hour | On-demand |
| `/api/lessons/[id]` | SSR | None | Always |
| `/api/dashboard` | No cache | - | - |
| `/api/leaderboard` | Cache | 5 minutes | 5 minutes |

## Cost Projection

### Free Tier (100K MAU)

| Service | Free Limit | Actual Usage | Monthly Cost |
|---------|-----------|--------------|--------------|
| Vercel Hobby | 100K functions | ~30K/day | $0 |
| Turso Free | 9GB | ~100MB | $0 |
| Upstash Free | 10K/day | 5K/day | $0 |
| Cloudflare | Unlimited | - | $0 |
| OpenRouter | Varies | ~1000 calls | $0 |
| **Total** | | | **$0/month** |

### Scale to 100K MAU

When exceeding free tier:

| Service | Upgrade To | Monthly Cost |
|---------|-----------|--------------|
| Vercel | Pro | $20 |
| Turso | Hobby | $5 |
| Upstash | Pay-as-you-go | ~$10 |
| **Total** | | **$35/month** |

Revenue needed to break even: ~2-3 course sales/month at ₦5,000

## Anti-Abuse Measures

### Rate Limiting (Redis-Backed)

| Endpoint | Per Minute | Per Day |
|----------|-----------|---------|
| AI Chat | 10 | 100 |
| Spin Wheel | 5 | - |
| Lesson Complete | 20 | - |
| API General | 100 | 1000 |

### Fraud Prevention

- Server-side answer verification
- Progress replay detection
- Session fingerprinting
- IP-based throttling

## Sustainability Model

### Free Users
- All core features available
- Ads in non-disruptive places
- In-app purchases for cosmetics
- Referral rewards

### Revenue Streams
1. **Course Sales**: One-time purchases (teachers get 70%)
2. **Premium Subscription**: ₦2,000/month for ad-free + extras
3. **Teacher Marketplace**: Transaction fees
4. **Sponsorships**: University/corporate partnerships
5. **Certification**: Official exam vouchers

## Monitoring & Alerts

### Key Metrics
- API response time
- Database query count
- Cache hit rate
- Rate limit violations
- Error rate

### Cost Alerts
- Vercel functions approaching limit
- Turso storage approaching limit
- Upstash commands approaching limit

## Future Enhancements

### Phase 2 (6 months)
- [ ] Real-time collaboration
- [ ] Video lessons with HLS streaming
- [ ] Native mobile apps
- [ ] Offline sync with conflict resolution

### Phase 3 (1 year)
- [ ] AI-generated personalized content
- [ ] Blockchain certification verification
- [ ] Virtual study groups
- [ ] Live tutoring platform

---

**Last Updated**: April 2026
**Version**: 1.0
