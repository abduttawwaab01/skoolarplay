# Cloudflare R2 Setup Guide

## Step 1: Create a Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com) and sign up/log in
2. If new, verify your email address

## Step 2: Enable R2 Workers

1. In Cloudflare dashboard, go to **Workers & Pages** in the left sidebar
2. Click **Create application**
3. Select **Workers** tab
4. Click **Create Worker**
5. Name it `skoolar-r2` (or any name) and click **Deploy**
6. You can close the worker editor for now - we just need the Workers enabled on your account

## Step 3: Create R2 Bucket

1. In Cloudflare dashboard, go to **R2** (under Workers & Pages section)
2. Click **Create bucket**
3. Enter bucket name: `skoolarplay` (or your preferred name)
4. Select a region (leave as "Auto" for best performance)
5. Click **Create bucket**

## Step 4: Get R2 Credentials

### Option A: Using Cloudflare API Token (Recommended)

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Select **Edit R2 bucket templates** → **Edit R2 Buckets**
4. For **Account Resources**, select your account
5. For **Bucket Resources**, select your `skoolarplay` bucket with **Edit** permissions
6. Set expiration (recommend 1 year)
7. Click **Create Token**
8. **IMPORTANT**: Copy and save the token immediately - you won't see it again!

### Option B: Using R2 API Key

1. Go to **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Token name: `skoolarplay-admin`
4. Permissions: **Edit**
5. Click **Create**
6. **IMPORTANT**: Copy and save:
   - `Access Key ID`
   - `Secret Access Key`

## Step 5: Get Your Account ID

1. In Cloudflare dashboard, go to **Overview**
2. At the bottom, find **Account ID**
3. Copy this value

## Step 6: Configure Public Access (Optional but Recommended)

To serve files publicly without signed URLs:

1. Go to **R2** → Select your bucket (`skoolarplay`)
2. Click **Settings**
3. Under **Bucket Website**, click **Edit**
4. Enable **Bucket Website**
5. Set a custom domain or use the R2.dev subdomain:
   - Go to **Custom Domains**
   - Add a domain like `cdn.yoursite.com` pointing to Cloudflare
   - Or use: `https://<your-account-id>.r2.dev/skolplay/` (not automatically available)

### For R2 Public URL without Custom Domain:

1. Go to **R2** → **Manage R2 API Tokens**
2. Your bucket URL format: `https://pub-<random>.r2.dev/` (check your bucket's overview page)
3. Or enable Workers to serve files publicly

## Step 7: Add Environment Variables

Add these to your `.env` file:

```env
# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=skoolarplay
R2_PUBLIC_URL=https://your-cdn-domain.com  # Or R2 bucket URL
```

## Step 8: Set Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your project → **Settings**
2. Click **Environment Variables**
3. Add each variable:
   - `R2_ACCOUNT_ID` = your account ID
   - `R2_ACCESS_KEY_ID` = your access key ID
   - `R2_SECRET_ACCESS_KEY` = your secret access key
   - `R2_BUCKET_NAME` = `skoolarplay` (or your bucket name)
   - `R2_PUBLIC_URL` = your public URL (e.g., `https://cdn.yoursite.com`)

4. **Important**: Redeploy after adding environment variables

## Step 9: CORS Configuration (Optional)

To allow uploads from your frontend:

1. In R2 bucket settings, go to **CORS Policy**
2. Add rule:
```json
[
  {
    "AllowedOrigins": ["https://skoolarplay.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"]
  }
]
```

## Quick Reference - Where to Find Values

| Variable | Where to Find |
|----------|---------------|
| `R2_ACCOUNT_ID` | Cloudflare Dashboard → Overview → Account ID |
| `R2_ACCESS_KEY_ID` | R2 → Manage R2 API Tokens → Access Key ID |
| `R2_SECRET_ACCESS_KEY` | R2 → Manage R2 API Tokens → Secret Access Key |
| `R2_BUCKET_NAME` | R2 → Buckets → Your bucket name |

## Troubleshooting

### "Access Denied" Error
- Check your API token has Edit permissions
- Verify bucket name is correct
- Ensure R2_ACCOUNT_ID matches your Cloudflare account

### Files Not Publicly Accessible
- Set up a Workers function to serve files, OR
- Use R2's built-in public access feature
- Configure custom domain in bucket settings

### Upload Fails
- Check CORS settings allow your domain
- Verify API token hasn't expired
- Ensure file size is within limits (100MB default)
