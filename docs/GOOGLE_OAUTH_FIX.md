# Google OAuth Redirect URI Mismatch - Fix Documentation

## Problem Summary

The application was encountering a **`redirect_uri_mismatch`** error when attempting to sign in with Google OAuth:

```
oauth2.googleapis.com/token:1 Failed to load resource: the server responded with a status of 400 ()
google-auth.ts:150 Token exchange failed: {
  "error": "redirect_uri_mismatch",
  "error_description": "Bad Request"
}
```

## Root Cause

The issue was **NOT** with the Google Cloud Console configuration (redirect URIs were correctly configured). The problem was in the **OAuth flow implementation**:

1. **Popup Mode Mismatch**: The code was using `ux_mode: 'popup'` in Google's OAuth client initialization
2. **Redirect URI Confusion**: In popup mode, Google handles the redirect internally and doesn't use the custom redirect_uri
3. **Token Exchange Failure**: When exchanging the authorization code for tokens, the code sent a `redirect_uri` that didn't match what was used during authorization (because popup mode doesn't use one)

## Solution

### 1. Switch from Popup to Redirect Mode

Changed the OAuth flow from popup mode to proper redirect mode:

**Before (Popup Mode):**
```typescript
const client = window.google.accounts.oauth2.initCodeClient({
  client_id: config.clientId,
  scope: (config.scope || ['openid', 'email', 'profile']).join(' '),
  ux_mode: 'popup',  // ❌ Popup mode
  callback: async (response) => { /* ... */ }
})
```

**After (Redirect Mode):**
```typescript
const client = window.google.accounts.oauth2.initCodeClient({
  client_id: config.clientId,
  scope: (config.scope || ['openid', 'email', 'profile']).join(' '),
  ux_mode: 'redirect',  // ✅ Redirect mode
  redirect_uri: config.redirectUri  // ✅ Explicit redirect URI
})
```

### 2. Created OAuth Callback Handler

Added a new `handleOAuthCallback()` function to process the callback after Google redirects back:

```typescript
export async function handleOAuthCallback(config: GoogleAuthConfig): Promise<GoogleUser | null> {
  // 1. Extract authorization code from URL
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')

  // 2. Exchange code for tokens with matching redirect_uri
  const tokenResponse = await exchangeCodeForTokens(code, config)

  // 3. Get user info and store
  const userInfo = await getUserInfo(tokenResponse.access_token)
  storeGoogleUser(userInfo)

  // 4. Clean up URL
  window.history.replaceState({}, document.title, window.location.pathname)

  return userInfo
}
```

### 3. Updated AuthContext

Modified `AuthContext.tsx` to:
- Detect OAuth callbacks on initialization
- Call `handleOAuthCallback()` when a code is present in the URL
- Handle the full authentication flow including Supabase sync

### 4. Fixed TypeScript Configuration

- Created `src/vite-env.d.ts` with proper environment variable types
- Updated `tsconfig.json` to include `.d.ts` files
- Fixed all import.meta.env type errors

## Files Changed

1. **src/lib/auth/google-auth.ts**
   - Changed `signInWithGoogle()` to use redirect mode
   - Added `handleOAuthCallback()` function
   - Fixed environment variable access

2. **src/contexts/AuthContext.tsx**
   - Added OAuth callback detection on mount
   - Updated to use new redirect flow
   - Fixed function hoisting issues

3. **src/vite-env.d.ts** (NEW)
   - Added TypeScript definitions for Vite environment variables

4. **tsconfig.json**
   - Removed `.d.ts` from exclude list

## OAuth Flow (New)

### Step 1: User Initiates Sign-In
```
User clicks "Sign in with Google"
    ↓
signInWithGoogle() is called
    ↓
Stores redirect_uri in localStorage
    ↓
Redirects to Google OAuth page
```

### Step 2: Google Authorization
```
User sees Google consent screen
    ↓
User approves permissions
    ↓
Google redirects to: https://monkey-one.dev/auth/callback?code=AUTH_CODE
```

### Step 3: Callback Processing
```
App loads at /auth/callback
    ↓
AuthContext detects ?code= in URL
    ↓
handleOAuthCallback() is called
    ↓
Exchange code for tokens (with matching redirect_uri!)
    ↓
Get user info from Google
    ↓
Sync user to Supabase
    ↓
Store authentication state
    ↓
Clean up URL (remove ?code=)
    ↓
User is signed in ✅
```

## Testing Instructions

### Local Development (http://localhost:4000)

1. **Start the dev server:**
   ```bash
   pnpm run dev
   ```

2. **Open browser and navigate to:**
   ```
   http://localhost:4000
   ```

3. **Click "Sign in with Google"**
   - Should redirect to Google's OAuth consent screen
   - Select your Google account
   - Approve permissions

4. **After approval:**
   - Should redirect back to `http://localhost:4000/auth/callback?code=...`
   - Should automatically process the callback
   - Should see user logged in
   - URL should clean up to `http://localhost:4000/`

5. **Check console logs:**
   ```
   ✅ "OAuth callback detected, processing..."
   ✅ "Processing OAuth callback with code: XXXX..."
   ✅ "Using redirect URI for token exchange: http://localhost:4000/auth/callback"
   ✅ "OAuth callback processed successfully: {user object}"
   ```

### Production (https://monkey-one.dev)

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Open production URL:**
   ```
   https://monkey-one.dev
   ```

3. **Follow same testing steps as local**
   - Redirect URI will be `https://monkey-one.dev/auth/callback`

## Verified Configurations

### Google Cloud Console - OAuth Client

**Authorized JavaScript Origins:**
- `https://monkey-one.dev` ✅
- `https://monkey-one-nine.vercel.app` ✅
- `http://localhost:4000` ✅
- `http://localhost:3000` ✅

**Authorized Redirect URIs:**
- `https://monkey-one.dev/auth/callback` ✅
- `https://monkey-one-nine.vercel.app/auth/callback` ✅
- `http://localhost:4000/auth/callback` ✅
- `http://localhost:3000/auth/callback` ✅

### Environment Variables

Required in `.env`:
```env
VITE_GOOGLE_CLIENT_ID="425089133667-g7al90c6mbs7c5lf95ldufcrdf0cig4.apps.googleusercontent.com"
VITE_GOOGLE_CLIENT_SECRET="GOCSPX-****2Aj8"
VITE_PUBLIC_URL="https://monkey-one.dev"
```

## Common Issues & Solutions

### Issue: Still getting redirect_uri_mismatch

**Solution:** Check that:
1. The exact redirect URI is added in Google Cloud Console
2. No trailing slashes mismatch
3. HTTP vs HTTPS matches
4. Port numbers match (if using localhost)

### Issue: Code in URL but not processing

**Solution:** Check:
1. `handleOAuthCallback()` is being called in `AuthContext`
2. Console logs show "OAuth callback detected"
3. No JavaScript errors in console

### Issue: Token exchange fails

**Solution:** Verify:
1. `VITE_GOOGLE_CLIENT_SECRET` is set in environment
2. Client secret matches Google Cloud Console
3. Redirect URI sent to token exchange matches the one used in authorization

## Benefits of Redirect Mode

1. **More Reliable**: Works across all browsers and devices
2. **Better Mobile Support**: Popups are often blocked on mobile
3. **Clearer UX**: Users see full Google OAuth page
4. **Standards Compliant**: Follows OAuth 2.0 authorization code flow properly
5. **Debugging**: Easier to see and debug the full flow

## Next Steps

1. ✅ OAuth redirect flow implemented
2. ✅ TypeScript errors resolved
3. ✅ Callback handler integrated
4. 🔄 Test in local development
5. 🔄 Deploy to production and test
6. 📝 Consider adding error boundaries for OAuth failures
7. 📝 Add loading states during OAuth redirect
8. 📝 Implement OAuth state parameter for CSRF protection

## Related Documentation

- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [Vercel OIDC Documentation](https://vercel.com/docs/oidc)
- [GCP OIDC Setup](./GCP_OIDC_SETUP.md)
- [Authentication Architecture](./AUTHENTICATION_ARCHITECTURE.md)
