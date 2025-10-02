#!/bin/bash

# OAuth Configuration Verification Script
# Checks if your Google OAuth client is properly configured

set -e

echo "🔍 Verifying OAuth Configuration..."
echo ""

# Load environment variables (handle inline comments)
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | sed 's/#.*$//' | sed '/^$/d' | xargs)
fi

# Check environment variables
echo "1. Checking Environment Variables..."
echo "   ----------------------------------------"

if [ -z "$VITE_GOOGLE_CLIENT_ID" ]; then
  echo "   ❌ VITE_GOOGLE_CLIENT_ID is not set"
  exit 1
else
  echo "   ✅ VITE_GOOGLE_CLIENT_ID: ${VITE_GOOGLE_CLIENT_ID:0:20}..."
fi

if [ -z "$VITE_PUBLIC_URL" ]; then
  echo "   ⚠️  VITE_PUBLIC_URL is not set (will use default)"
  VITE_PUBLIC_URL="http://localhost:4000"
else
  echo "   ✅ VITE_PUBLIC_URL: $VITE_PUBLIC_URL"
fi

echo ""

# Expected redirect URIs
REDIRECT_URI="${VITE_PUBLIC_URL}/auth/callback"
echo "2. Expected Configuration..."
echo "   ----------------------------------------"
echo "   Redirect URI: $REDIRECT_URI"
echo "   JavaScript Origin: $VITE_PUBLIC_URL"
echo ""

# Google Cloud Console instructions
echo "3. Verify in Google Cloud Console..."
echo "   ----------------------------------------"
echo "   1. Go to: https://console.cloud.google.com/apis/credentials"
echo "   2. Select project: agent-one-ffec8"
echo "   3. Find your OAuth 2.0 Client ID"
echo "   4. Verify these URIs are configured:"
echo ""
echo "   Authorized redirect URIs:"
echo "   • $REDIRECT_URI"
echo "   • http://localhost:4000/auth/callback (for local dev)"
echo ""
echo "   Authorized JavaScript origins:"
echo "   • $VITE_PUBLIC_URL"
echo "   • http://localhost:4000 (for local dev)"
echo ""

# Check if running on correct URL
echo "4. Runtime Check..."
echo "   ----------------------------------------"
if [ "$VITE_PUBLIC_URL" == "https://monkey-one.dev" ]; then
  echo "   ✅ Production URL configured"
  echo "   Make sure you're accessing the app at: https://monkey-one.dev"
elif [ "$VITE_PUBLIC_URL" == "http://localhost:4000" ]; then
  echo "   ✅ Local development URL configured"
  echo "   Make sure you're accessing the app at: http://localhost:4000"
else
  echo "   ⚠️  Custom URL: $VITE_PUBLIC_URL"
  echo "   Make sure you're accessing the app at this URL"
fi
echo ""

# Test OAuth URL construction
echo "5. OAuth URL Test..."
echo "   ----------------------------------------"
SCOPE="openid%20email%20profile"
AUTH_URL="https://accounts.google.com/o/oauth2/v2/auth?client_id=$VITE_GOOGLE_CLIENT_ID&redirect_uri=$REDIRECT_URI&response_type=code&scope=$SCOPE&access_type=offline&prompt=consent"
echo "   OAuth URL (first 100 chars):"
echo "   ${AUTH_URL:0:100}..."
echo ""

# Final instructions
echo "6. Next Steps..."
echo "   ----------------------------------------"
echo "   If all checks pass:"
echo "   1. Restart your dev server: pnpm run dev"
echo "   2. Navigate to: $VITE_PUBLIC_URL"
echo "   3. Open DevTools Console (F12)"
echo "   4. Click 'Sign in with Google'"
echo "   5. Check console for 'redirect_uri' in logs"
echo ""
echo "   If you see 'redirect_uri_mismatch':"
echo "   • Wait 5-10 minutes after updating Google Console"
echo "   • Try in incognito/private browsing"
echo "   • Clear browser cache and cookies"
echo ""
echo "✅ Verification complete!"
