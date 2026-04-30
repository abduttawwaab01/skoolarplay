# SkoolarPlay Production Deployment Checklist

## Pre-Deployment

### 1. Environment Variables Setup

Create a production `.env` file with all required secrets:

```bash
# Copy template
cp .env.example .env

# Generate required secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -hex 32     # For CRON_SECRET
```

#### Required Variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | Turso database URL | Turso Dashboard |
| `TURSO_AUTH_TOKEN` | Turso auth token | Turso Dashboard |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | Generate locally |
| `NEXTAUTH_URL` | Your domain URL | Your choice |
| `PAYSTACK_SECRET_KEY` | Paystack live key | Paystack Dashboard |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | Paystack Dashboard |
| `OPENROUTER_API_KEY` | OpenRouter API key | OpenRouter Dashboard |
| `VAPID_PUBLIC_KEY` | Push notification key | Generate with web-push CLI |
| `VAPID_PRIVATE_KEY` | Push notification key | Generate with web-push CLI |
| `VAPID_SUBJECT` | mailto: for push | Your email |
| `UPSTASH_REDIS_REST_URL` | Redis URL | Upstash Dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token | Upstash Dashboard |
| `CRON_SECRET` | Secret for cron auth | Generate locally |

### 2. Database Setup

```bash
# Push schema to production
npx prisma db push --env=production

# Generate Prisma client
npx prisma generate
```

### 3. Vercel Project Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
# ... add all other variables

# Deploy
vercel --prod
```

## Post-Deployment Verification

### 1. Test Critical Features

- [ ] User registration and login
- [ ] Course enrollment (free and paid)
- [ ] Lesson completion and XP awarding
- [ ] Payment flow (with test card)
- [ ] AI chat functionality
- [ ] Push notifications
- [ ] Offline mode

### 2. Configure Paystack (Live)

1. Go to Paystack Dashboard > Settings > API Keys
2. Copy live secret and public keys
3. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Enable required events: `charge.success`, `subscription.create`, `subscription.disable`, `refund.created`

### 3. Configure OpenRouter

1. Go to https://openrouter.ai/keys
2. Generate a new key with appropriate limits
3. Set spending limits to control costs
4. Configure default model (recommended: `anthropic/claude-3-haiku` for free tier)

### 4. Set Up Turso Replicas (Optional)

For better global performance:
1. Create replicas in regions near your users (Nigeria, Europe)
2. Update DATABASE_URL with replica URL

### 5. Monitor and Alerting

Set up monitoring:
- Vercel Analytics (built-in)
- Sentry for error tracking
- Upstash Redis metrics
- Turso usage dashboard

## Security Checklist

- [ ] All environment variables are set (no defaults)
- [ ] `NEXTAUTH_URL` points to production domain
- [ ] Paystack webhook URL is verified
- [ ] VAPID keys are generated and configured
- [ ] Rate limiting is working (check Upstash dashboard)
- [ ] CORS is configured for production domain only

## Performance Checklist

- [ ] Enable Vercel Analytics
- [ ] Configure CDN caching headers
- [ ] Enable Turso embedded replicas
- [ ] Test offline mode functionality
- [ ] Verify service worker is registered

## Backup & Recovery

- [ ] Turso automatic backups are enabled
- [ ] Know how to restore from backup
- [ ] Document recovery procedures

## Cost Management

### Vercel (Hobby vs Pro)

| Plan | Price | Limits |
|------|-------|--------|
| Hobby | Free | 100K serverless, 100GB bandwidth |
| Pro | $20/mo | 1M serverless, 1TB bandwidth |

### Turso

| Plan | Price | Limits |
|------|-------|--------|
| Free | Free | 9GB storage, 500 databases |
| Hobby | $5/mo | 30GB storage, unlimited DBs |

### Upstash Redis

| Plan | Price | Limits |
|------|-------|--------|
| Free | Free | 10K commands/day |
| Pay as you go | $0.20/10K | Unlimited |

### OpenRouter

| Model | Price | Free Tier |
|-------|-------|-----------|
| Claude 3 Haiku | $0.25/1M tokens | 30 RPM, 2000/day |
| Llama 3 | Free | 1000/day |

## Rollback Procedures

If deployment fails:

```bash
# Rollback to previous deployment
vercel rollback [deployment-url]

# Or redeploy previous commit
git revert HEAD
git push origin main
vercel --prod
```

## Emergency Contacts

- Vercel Support: support@vercel.com
- Turso Support: support@turso.tech
- Upstash Support: support@upstash.com
- Paystack Support: support@paystack.com

---

## Deployment Commands Summary

```bash
# 1. Clone repository
git clone https://github.com/your-org/skoolarplay.git
cd skoolarplay

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with production values

# 4. Push database schema
npx prisma db push

# 5. Deploy to Vercel
vercel --prod

# 6. Verify deployment
open https://your-app.vercel.app
```

## Support

For issues during deployment, check:
1. Vercel Deployment Logs
2. Serverless Function Logs
3. Browser Console
4. Network tab for API errors
