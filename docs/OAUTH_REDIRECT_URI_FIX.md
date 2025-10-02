# OAuth Redirect URI Mismatch Fix

## Issue Identified

**Error**: `redirect_uri_mismatch` during Google OAuth token exchange

**Root Cause**: Mismatch between the redirect URI used in the initial OAuth request and the token exchange request.

## What Was Wrong

1. **App runs on**: `https://monkey-one.dev`
2. **Initial OAuth redirect**: Used detected origin → `https://monkey-one.dev/auth/callback` ✅
3. **Token exchange**: Used `.env` variable → `http://localhost:4000/auth/callback` ❌
4. **Google's response**: "These don't match!" → 400 Bad Request

## Fix Applied

Updated `.env` file:
```bash
# Before
VITE_PUBLIC_URL=http://localhost:4000

# After
VITE_PUBLIC_URL=https://monkey-one.dev
```

## Verification Checklist

### Step 1: Verify Google OAuth Client Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: `agent-one-ffec8`
3. Navigate to: **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Click to edit and verify these redirect URIs are present:

**Required Redirect URIs**:
- ✅ `https://monkey-one.dev/auth/callback` (CRITICAL - must be present)
- ✅ `http://localhost:4000/auth/callback` (for local development)

**Required JavaScript Origins**:
- ✅ `https://monkey-one.dev`
- ✅ `http://localhost:4000`

If `https://monkey-one.dev/auth/callback` is missing:
1. Click **"Add URI"** under Authorized redirect URIs
2. Enter: `https://monkey-one.dev/auth/callback`
3. Click **"Save"**
4. Wait 5 minutes for changes to propagate

### Step 2: Restart Your Development Server

The environment variable change requires a server restart:

```bash
# Stop the current dev server (Ctrl+C)

# Start fresh
pnpm run dev
```

### Step 3: Test OAuth Flow

1. Open your browser to `https://monkey-one.dev`
2. Open browser DevTools (F12) → Console tab
3. Click "Sign in with Google"
4. Watch the console logs for:
   - ✅ "Redirecting to Google OAuth: ..." (should show correct redirect_uri)
   - ✅ "Processing OAuth callback with code: ..."
   - ✅ "Using redirect URI for token exchange: https://monkey-one.dev/auth/callback"

### Step 4: Expected Behavior

**Success indicators**:
- No `redirect_uri_mismatch` error
- Token exchange completes successfully
- User info retrieved from Google
- User logged in and redirected

**If still failing**:
1. Check browser console for exact error message
2. Verify Google Cloud Console changes have propagated (wait 5-10 minutes)
3. Try in incognito/private browsing mode
4. Clear browser cache and cookies

## Technical Details

### How OAuth Redirect URI Matching Works

Google OAuth requires **exact matching** of redirect URIs:

1. **Authorization Request**: App sends user to Google with `redirect_uri=X`
2. **User Authorizes**: Google redirects back with code to `redirect_uri=X`
3. **Token Exchange**: App sends code to Google with `redirect_uri=X` (MUST match step 1)
4. **Validation**: Google checks: "Did I send this code to the same URI?" If no → 400 Bad Request

### Why We Store redirect_uri in localStorage

```typescript
// Before redirect to Google
localStorage.setItem('oauth_redirect_uri', config.redirectUri)

// After Google redirects back
const storedRedirectUri = localStorage.getItem('oauth_redirect_uri')
// Use stored URI for token exchange to ensure consistency
```

This ensures the EXACT same URI is used for both steps, even if:
- User navigates to different pages
- Page reloads
- Environment changes

## Environment Variable Precedence

The code now uses this logic:
```typescript
let currentUrl = 'http://localhost:4000'
if (typeof window !== 'undefined') {
  currentUrl = window.location.origin  // Runtime detection (highest priority)
} else {
  currentUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:4000'  // Fallback
}
```

**For production**: Set `VITE_PUBLIC_URL=https://monkey-one.dev`
**For local dev**: Set `VITE_PUBLIC_URL=http://localhost:4000`

## Additional Troubleshooting

### Issue: "Client ID not found"
- Verify client ID in `.env` matches Google Cloud Console
- Remove quotes from environment variables (Vite includes them literally)

### Issue: "Access denied"
- Check OAuth consent screen is configured
- Verify your email is added as a test user (if in Testing mode)
- Publish the consent screen for public access

### Issue: "Token exchange always fails"
- Enable detailed logging in browser DevTools
- Check Network tab for the exact request/response
- Verify client secret is correct (if using server-side flow)

## Related Documentation

- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Authentication Architecture](./AUTHENTICATION_ARCHITECTURE.md)
- [Vercel OIDC Setup](./GCP_OIDC_SETUP.md)
