# Testing Guide: OAuth and UI Rendering

## Overview
This guide covers testing the OAuth authentication flow and UI rendering fixes implemented to resolve issues where users could login but the URL still showed `/auth/callback` and navigation had rendering problems.

## Test Environment Setup

### Prerequisites
1. Google OAuth credentials configured in `.env`
2. Supabase project configured
3. Application running on the correct domain (e.g., `https://monkey-one.dev` or `http://localhost:4000`)

### Environment Variables
Ensure these are set correctly in `.env`:
```bash
VITE_PUBLIC_URL=https://monkey-one.dev  # or your deployment URL
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Test Scenarios

### 1. OAuth Login Flow (Happy Path)

**Objective**: Verify complete OAuth flow works correctly from start to finish

**Steps**:
1. Navigate to the application root (should redirect to `/login` if not authenticated)
2. Click "Sign in with Google" button
3. Complete Google OAuth consent screen
4. **Expected Results**:
   - Browser redirects to `/auth/callback` briefly (you may not see this)
   - Loading spinner shows "Processing authentication..."
   - After ~800ms, automatically redirects to `/dashboard`
   - URL bar shows `/dashboard` (NOT `/auth/callback`)
   - Dashboard page renders with all metrics
   - Sidebar navigation is visible and functional
   - User profile shows in header

**What to Check**:
- [ ] URL ends up at `/dashboard` (not `/auth/callback`)
- [ ] No console errors in browser DevTools
- [ ] No infinite redirect loops
- [ ] Dashboard content loads properly
- [ ] User info appears in header/profile section
- [ ] Sidebar is visible with all navigation items

### 2. Back Button Behavior

**Objective**: Verify back button doesn't return to callback page

**Steps**:
1. Complete OAuth login (see Test 1)
2. After landing on dashboard, click browser back button
3. **Expected Results**:
   - Should NOT go back to `/auth/callback`
   - Should go to the page before login was initiated (or stay on dashboard)

**What to Check**:
- [ ] Back button doesn't show callback page
- [ ] No authentication loop occurs
- [ ] Application remains functional

### 3. Navigation After Login

**Objective**: Verify all navigation works correctly after authentication

**Steps**:
1. Complete OAuth login
2. Click each item in the sidebar:
   - Dashboard
   - Chat
   - Agents
   - Workflow
   - Memory
   - Documents
   - Tools
   - GitHub
   - Performance
   - Profile
   - Settings
3. For each page:
   - Check URL updates correctly
   - Verify page content renders
   - Ensure no console errors
   - Verify sidebar highlights active page

**What to Check**:
- [ ] Each page loads without errors
- [ ] URLs are clean (no extra parameters)
- [ ] Content renders properly
- [ ] Navigation state persists
- [ ] Active page indicator works

### 4. OAuth Error Handling

**Objective**: Verify error scenarios are handled gracefully

#### Test 4a: User Cancels OAuth
**Steps**:
1. Click "Sign in with Google"
2. On Google consent screen, click "Cancel" or close the window
3. **Expected Results**:
   - Redirects back to application
   - Error message displays on callback page
   - "Try Again" button is available
   - No console errors or crashes

#### Test 4b: Network Error During OAuth
**Steps**:
1. Open DevTools > Network tab
2. Set to "Offline" mode
3. Click "Sign in with Google"
4. **Expected Results**:
   - Error message displays
   - User can retry or navigate away
   - Application doesn't crash

**What to Check**:
- [ ] Error messages are user-friendly
- [ ] No technical error details exposed
- [ ] Retry functionality works
- [ ] Can navigate to other pages

### 5. Session Persistence

**Objective**: Verify authentication persists across page refreshes

**Steps**:
1. Complete OAuth login
2. Navigate to different pages
3. Refresh the browser (F5 or Cmd+R)
4. **Expected Results**:
   - Stays authenticated (no redirect to login)
   - Current page remains (or redirects to dashboard if callback)
   - User info persists
   - Navigation state correct

**What to Check**:
- [ ] No re-authentication required
- [ ] Session persists across refreshes
- [ ] User data remains available

### 6. Direct URL Access

**Objective**: Verify protected routes are properly guarded

#### Test 6a: Authenticated User
**Steps**:
1. Login successfully
2. Directly access URLs by typing in address bar:
   - `/dashboard`
   - `/chat`
   - `/agents`
   - etc.
3. **Expected Results**:
   - All pages load correctly
   - No redirect to login
   - Content renders properly

#### Test 6b: Unauthenticated User
**Steps**:
1. Logout or clear cookies
2. Try to access protected URLs directly:
   - `/dashboard`
   - `/chat`
   - `/agents`
3. **Expected Results**:
   - Redirects to `/login`
   - After login, redirects back to intended page (if implemented)

**What to Check**:
- [ ] Protected routes require authentication
- [ ] Proper redirects occur
- [ ] Intended destination is remembered (optional feature)

### 7. Logout and Re-login

**Objective**: Verify logout works and can login again

**Steps**:
1. Login successfully
2. Click logout/sign out
3. Verify redirected to login page
4. Login again
5. **Expected Results**:
   - Successful logout clears session
   - Can login again without issues
   - Fresh session established

**What to Check**:
- [ ] Logout clears authentication
- [ ] Can re-login successfully
- [ ] No stale data from previous session

## Performance Checks

### Loading Times
- [ ] Initial page load < 3 seconds
- [ ] OAuth callback processing < 2 seconds
- [ ] Dashboard render < 1 second
- [ ] Navigation between pages < 500ms

### Console Output
Check browser console for:
- [ ] No red errors
- [ ] No React warnings
- [ ] Expected debug logs (if any):
  - "OAuth callback detected, processing..."
  - "OAuth callback processed successfully: [user]"

### Network Activity
Check DevTools Network tab:
- [ ] No failed requests (4xx, 5xx)
- [ ] OAuth token exchange succeeds
- [ ] Supabase sync succeeds (if applicable)
- [ ] No unnecessary repeated requests

## Known Issues to Avoid

### Issues That Were Fixed
These should NOT occur anymore:
- ❌ URL stuck on `/auth/callback` after login
- ❌ Infinite redirect loops
- ❌ Dashboard not rendering after OAuth
- ❌ Navigation not working
- ❌ Multiple AuthCallback implementations causing confusion

### Issues That May Still Exist
These are pre-existing and not related to this fix:
- Some unit tests failing (unrelated to auth)
- Linting errors in various files (pre-existing)

## Debugging Tips

### If OAuth Fails
1. Check console for errors
2. Verify environment variables are set
3. Check Google OAuth credentials configuration
4. Ensure redirect URI matches exactly: `https://your-domain.com/auth/callback`
5. Check Supabase project is active

### If Redirect Doesn't Work
1. Check console for navigation errors
2. Verify `isAuthenticated` state in React DevTools
3. Check for infinite redirect loops (browser will show error)
4. Verify `AuthContext` is properly initialized

### If Dashboard Doesn't Render
1. Check for React errors in console
2. Verify `DashboardPanel` component exists
3. Check for missing dependencies
4. Verify store data is accessible

## Success Criteria

All tests pass if:
- ✅ OAuth flow completes successfully
- ✅ URL shows `/dashboard` after login (not `/auth/callback`)
- ✅ Dashboard renders with content
- ✅ All navigation works
- ✅ No console errors
- ✅ Back button doesn't break flow
- ✅ Error scenarios handled gracefully
- ✅ Session persists across refreshes

## Reporting Issues

If you find issues during testing, please report:
1. Which test scenario failed
2. Steps to reproduce
3. Expected vs actual behavior
4. Console errors (if any)
5. Network errors (if any)
6. Screenshots or video

## Related Documentation
- `docs/UI_RENDERING_FIX.md` - Technical details of the fix
- `docs/OAUTH_AND_ERROR_HANDLING_FIXES.md` - Previous OAuth fixes
- `docs/GOOGLE_OAUTH_FIX.md` - Google OAuth setup
