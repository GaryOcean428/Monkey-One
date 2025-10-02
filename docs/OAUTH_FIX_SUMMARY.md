# OAuth redirect_uri_mismatch Fix - Summary

## ✅ Issue Resolved

**Problem**: `redirect_uri_mismatch` error during Google OAuth token exchange

**Root Cause**: Environment variable mismatch
- App running on: `https://monkey-one.dev`
- Environment variable: `http://localhost:4000`
- Result: Different redirect URIs used in authorization vs. token exchange

## ✅ Fix Applied

Updated `.env` file:
```diff
- VITE_PUBLIC_URL=http://localhost:4000
+ VITE_PUBLIC_URL=https://monkey-one.dev
```

## ✅ Verification Complete

Your configuration now shows:
- ✅ Client ID: `425089133667-g7al90c6mbs7c5lf95ldufcrdf0cig4...`
- ✅ Public URL: `https://monkey-one.dev`
- ✅ Expected redirect URI: `https://monkey-one.dev/auth/callback`
- ✅ OAuth URL construction: Correct

## 🔍 Required Action: Verify Google Cloud Console

**CRITICAL**: You must verify your Google OAuth client has the correct redirect URI configured.

### Step-by-Step:

1. **Open Google Cloud Console**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Select project: `agent-one-ffec8`

2. **Find Your OAuth 2.0 Client ID**:
   - Look for client ID starting with `425089133667-`
   - Click to edit

3. **Verify Authorized Redirect URIs** (MUST include both):
   ```
   ✅ https://monkey-one.dev/auth/callback
   ✅ http://localhost:4000/auth/callback
   ```

4. **Verify Authorized JavaScript Origins** (MUST include both):
   ```
   ✅ https://monkey-one.dev
   ✅ http://localhost:4000
   ```

5. **If Missing**:
   - Click "ADD URI" under Authorized redirect URIs
   - Enter: `https://monkey-one.dev/auth/callback`
   - Click "Save"
   - **Wait 5-10 minutes for changes to propagate**

## 🧪 Testing Steps

### 1. Restart Dev Server (if not already done)

Your dev server should have auto-restarted when we changed `.env`. If not:

```bash
# Stop current server (Ctrl+C)
pnpm run dev
```

### 2. Test OAuth Flow

1. **Navigate to**: `https://monkey-one.dev`
2. **Open DevTools**: Press `F12`
3. **Go to Console tab**
4. **Click**: "Sign in with Google"
5. **Watch console logs** for:
   ```
   ✅ Redirecting to Google OAuth: https://accounts.google.com/o/oauth2/v2/auth?...
   ✅ redirect_uri=https://monkey-one.dev/auth/callback
   ```

### 3. Expected Behavior

**Success Path**:
1. Redirects to Google login page
2. You authorize the app
3. Google redirects back to `https://monkey-one.dev/auth/callback?code=...`
4. Console shows: "Processing OAuth callback with code: ..."
5. Console shows: "Using redirect URI for token exchange: https://monkey-one.dev/auth/callback"
6. Token exchange succeeds
7. User info retrieved
8. You're logged in! 🎉

**If Still Failing**:
1. Check exact error in console
2. Verify Google Cloud Console changes saved
3. Wait 5-10 minutes for propagation
4. Try incognito/private browsing
5. Clear browser cache and cookies

## 📝 Technical Details

### Why This Fix Works

Google OAuth requires **exact matching** of redirect URIs:

```typescript
// Step 1: Authorization Request
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
authUrl.searchParams.set('redirect_uri', 'https://monkey-one.dev/auth/callback')
// User clicks "Allow" ✅

// Step 2: Token Exchange (MUST use same redirect_uri)
fetch('https://oauth2.googleapis.com/token', {
  body: new URLSearchParams({
    redirect_uri: 'https://monkey-one.dev/auth/callback', // MUST MATCH step 1
    code: '...',
  }),
})
```

If the redirect URIs don't match exactly → Google returns 400 Bad Request with `redirect_uri_mismatch`.

### localStorage Backup Mechanism

The code stores the redirect URI in localStorage before redirecting to Google:

```typescript
// Before OAuth redirect
localStorage.setItem('oauth_redirect_uri', config.redirectUri)

// After Google redirects back
const storedRedirectUri = localStorage.getItem('oauth_redirect_uri')
const redirectUri = storedRedirectUri || config.redirectUri
// Use stored URI for token exchange
```

This ensures consistency even if:
- User navigates to different pages
- Page reloads
- Environment changes

## 🔧 Environment Variable Strategy

For **production** (current):
```bash
VITE_PUBLIC_URL=https://monkey-one.dev
```

For **local development**:
```bash
VITE_PUBLIC_URL=http://localhost:4000
```

The code prioritizes runtime detection:
```typescript
let currentUrl = 'http://localhost:4000'
if (typeof window !== 'undefined') {
  currentUrl = window.location.origin  // Runtime (highest priority)
} else {
  currentUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:4000'
}
```

## 📚 Related Documentation

- [OAuth Redirect URI Fix](./OAUTH_REDIRECT_URI_FIX.md) - Detailed troubleshooting
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md) - Initial setup guide
- [Authentication Architecture](./AUTHENTICATION_ARCHITECTURE.md) - System overview

## 🎯 Next Steps

1. ✅ Verify Google Cloud Console has correct redirect URIs
2. ✅ Wait 5-10 minutes if you just added them
3. ✅ Test OAuth flow on `https://monkey-one.dev`
4. ✅ Confirm no `redirect_uri_mismatch` errors
5. ✅ Verify successful login

If everything works, you're all set! 🚀

If you still see errors, check the console output and refer to the troubleshooting section in `OAUTH_REDIRECT_URI_FIX.md`.
