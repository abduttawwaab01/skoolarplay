#!/bin/bash
# ===================================================
# SkoolarPlay — Turso Database Setup Script
# ===================================================
# Run this script to create and configure your Turso
# cloud database. Free forever! 🎉
#
# Prerequisites:
#   1. Turso CLI installed (curl -sSfL https://get.tur.so/install.sh | bash)
#   2. Turso account (turso auth signup)
# ===================================================

set -e

echo ""
echo "🟢 SkoolarPlay — Turso Database Setup"
echo "======================================="
echo ""

# Check if turso CLI is installed
if ! command -v turso &> /dev/null; then
    echo "❌ Turso CLI not found. Installing..."
    curl -sSfL https://get.tur.so/install.sh | bash
    export PATH="$HOME/.turso:$PATH"
    echo "✅ Turso CLI installed."
fi

# Check if user is authenticated
echo "🔐 Checking authentication..."
if ! turso auth whoami &> /dev/null; then
    echo "❌ Not authenticated. Starting signup..."
    turso auth signup
    echo ""
    echo "✅ After completing signup, run this script again."
    exit 0
fi

echo "✅ Authenticated as: $(turso auth whoami 2>/dev/null)"
echo ""

# Database name
DB_NAME="skoolarplay"
DB_REGION="iad"  # US East (closest to Nigeria for good latency)

# Check if database already exists
if turso db show "$DB_NAME" &> /dev/null; then
    echo "📦 Database '$DB_NAME' already exists."
else
    echo "📦 Creating database '$DB_NAME' in $DB_REGION..."
    turso db create "$DB_NAME" --region "$DB_REGION"
    echo "✅ Database created!"
fi

echo ""

# Get database URL
echo "🔗 Getting database URL..."
DB_URL=$(turso db show "$DB_NAME" --url 2>/dev/null)
echo "   URL: $DB_URL"
echo ""

# Create auth token
echo "🔑 Creating auth token (expires in 1 year)..."
TOKEN_NAME="skoolarplay-vercel-$(date +%Y%m%d)"
# Delete existing token if it exists
turso db tokens list "$DB_NAME" 2>/dev/null | grep -q "$TOKEN_NAME" && \
    turso db tokens delete "$DB_NAME" "$TOKEN_NAME" 2>/dev/null || true

AUTH_TOKEN=$(turso db tokens create "$DB_NAME" "$TOKEN_NAME" --expiry 8760h 2>/dev/null)
echo "   Token: ${AUTH_TOKEN:0:20}..."
echo ""

# Push schema
echo "📊 Pushing Prisma schema to Turso..."
cd "$(dirname "$0")/.."
npx prisma db push --skip-generate 2>&1
echo "✅ Schema pushed!"
echo ""

# Seed database
echo "🌱 Seeding database..."
echo "   This may take a moment..."
npx prisma db seed 2>&1
echo "✅ Database seeded!"
echo ""

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate 2>&1
echo "✅ Prisma client generated!"
echo ""

# Summary
echo "======================================================"
echo "         SETUP COMPLETE!"
echo "======================================================"
echo ""
echo "  Add these to Vercel > Settings > Environment Variables:"
echo ""
echo "  DATABASE_URL=$DB_URL"
echo "  TURSO_AUTH_TOKEN=$AUTH_TOKEN"
echo "  NEXTAUTH_SECRET=skoolarplay-super-secret-key-change-in-production-2024"
echo "  NEXTAUTH_URL=https://skoolarplay.space.z.ai"
echo ""
echo "======================================================"
echo ""
echo "  Free Tier Limits:"
echo "    - 500 databases"
echo "    - 9 GB total storage"
echo "    - 25 million row reads/month"
echo "    - 3 million row writes/month"
echo ""
echo "  Deploy with: vercel"
echo ""
