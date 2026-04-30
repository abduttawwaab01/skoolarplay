#!/bin/bash

echo "=== TTS Setup Verification ==="
echo ""

# Check environment variables
echo "Checking NEXT_PUBLIC_ZAI_API_KEY:"
if [ -z "$NEXT_PUBLIC_ZAI_API_KEY" ]; then
  echo "❌ MISSING: ZAI API key not configured"
else
  # Show first and last 4 characters for security
  key="$NEXT_PUBLIC_ZAI_API_KEY"
  if [ ${#key} -gt 8 ]; then
    echo "✅ Found: ZAI API key is set (${key:0:4}...${key: -4})"
  else
    echo "✅ Found: ZAI API key is set"
  fi
fi

echo ""
echo "Checking NEXT_PUBLIC_APP_URL:"
if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
  echo "⚠️  WARNING: NEXT_PUBLIC_APP_URL not set (using localhost for testing)"
else
  echo "✅ Found: NEXT_PUBLIC_APP_URL is set to $NEXT_PUBLIC_APP_URL"
fi

echo ""
echo "Testing TTS API endpoint..."
# Try to test the API if we're likely in a dev environment
if [ "$1" = "--test-api" ] || [ "$1" = "-t" ]; then
  # Determine the base URL
  BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
  
  echo "Testing $BASE_URL/api/tts..."
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/tts" \
    -H "Content-Type: application/json" \
    -d '{"text":"Hello world","voice":"jam","speed":0.85}' \
    --max-time 10)
  
  if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ TTS API endpoint is working correctly"
  elif [ "$STATUS_CODE" = "401" ] || [ "$STATUS_CODE" = "403" ]; then
    echo "❌ TTS API returned $STATUS_CODE - Authentication error (check API key)"
  elif [ "$STATUS_CODE" = "429" ]; then
    echo "⚠️  TTS API returned $STATUS_CODE - Rate limited (try again later)"
  elif [ "$STATUS_CODE" = "500" ]; then
    echo "❌ TTS API returned $STATUS_CODE - Server error"
  elif [ -z "$STATUS_CODE" ] || [ "$STATUS_CODE" = "000" ]; then
    echo "❌ Could not connect to TTS API endpoint"
    echo "   Make sure the development server is running ($BASE_URL)"
  else
    echo "❌ TTS API returned unexpected status: $STATUS_CODE"
  fi
else
  echo "💡 To test the API endpoint, run: $0 --test-api"
  echo "   (Make sure your Next.js dev server is running on localhost:3000)"
fi

echo ""
echo "=== Verification Complete ==="