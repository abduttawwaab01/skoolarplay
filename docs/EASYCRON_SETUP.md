# EasyCron Setup for SkoolarPlay

This document explains how to set up EasyCron to automatically refill hearts for users.

## Current Heart Refill Cron

The heart refill cron endpoint is already implemented at `/api/cron/heart-refill`.

### Features:
- Automatically refills 1 heart per interval (configurable in AdminSettings)
- Only refills hearts for users below maxHearts
- Prevents over-filling (respects maxHearts limit)
- Creates audit logs for tracking

## EasyCron Setup Steps

### 1. Set CRON_SECRET Environment Variable

Generate a secure random string and add it to your environment variables:

```env
CRON_SECRET=your_secure_random_string_here
```

You can generate a random string using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Register at EasyCron

1. Go to https://www.easycron.com
2. Create a free account (or log in if you have one)
3. Verify your email address

### 3. Create a Cron Job

1. Click "Create Cron Job" button
2. Configure the following settings:

| Setting | Value |
|---------|-------|
| **URL** | `https://your-domain.com/api/cron/heart-refill?secret=YOUR_CRON_SECRET` |
| **Method** | GET |
| **Schedule** | Every 1 hour (or your preferred interval) |
| **Request Timeout** | 60 seconds |
| **Enabled** | Yes |

### 4. Schedule Options

**Recommended Schedule:** Every 1 hour
```
0 * * * *
```

**Alternative: Every 30 minutes**
```
*/30 * * * *
```

**Alternative: Every 2 hours**
```
0 */2 * * *
```

### 5. Test the Cron Job

1. Click "Run Now" button on your cron job
2. Check the "Last Execution" log to verify it worked
3. Expected response:
```json
{
  "success": true,
  "message": "Heart refill cron completed",
  "stats": {
    "usersRefilled": 5,
    "heartsRefilled": 10,
    "intervalHours": 1,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Configuring Heart Refill Rate

The heart refill rate can be configured in the Admin Dashboard under Settings > Gamification:

- **Heart Refill Hours**: How often (in hours) to refill 1 heart
  - Set to 1 for hourly refills
  - Set to 2 for every 2 hours, etc.

## Monitoring

EasyCron provides logs for:
- Last execution time
- Execution status (success/failure)
- Response from your server
- Error messages if any

Check these logs regularly to ensure the cron is running properly.

## Troubleshooting

### Cron not executing
- Verify CRON_SECRET is set correctly in your environment
- Check if the URL is correct and accessible
- Ensure your hosting provider allows external cron requests

### "Unauthorized" errors
- Make sure CRON_SECRET matches exactly
- The secret in the URL query parameter must match the environment variable

### Database errors
- Verify your DATABASE_URL is correct
- Check PostgreSQL connection is working

## Alternative: Vercel Cron (if hosted on Vercel)

If you're hosting on Vercel, you can use Vercel Cron instead:

Create `vercel.json` in the root:
```json
{
  "crons": [{
    "path": "/api/cron/heart-refill",
    "schedule": "0 * * * *"
  }]
}
```

And add this header check in the cron route to secure it:
```typescript
// Already implemented in /api/cron/heart-refill/route.ts
```

## Security

The cron endpoint is secured with:
- CRON_SECRET authentication (Bearer token in Authorization header or query param)
- If CRON_SECRET is not set, access is allowed (dev mode only)
- Always set CRON_SECRET in production!
