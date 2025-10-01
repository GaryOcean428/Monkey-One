# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth for the Monkey-One application.

## Prerequisites

- Access to Google Cloud Console
- Project ID: `agent-one-ffec8` (already configured)
- Admin access to the GCP project

## Step 1: Enable Google Identity Services API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project `agent-one-ffec8`
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Identity Services API"
5. Click **Enable** if not already enabled

## Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (for public access)
3. Fill in the required information:
   - **App name**: `Monkey-One`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
   - **App domain**: `https://monkey-one.dev`
   - **Authorized domains**: 
     - `vercel.app`
     - `monkey-one.dev` (if using custom domain)
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Save and continue

## Step 3: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client ID**
3. Choose **Web application** as application type
4. Configure the client:
   - **Name**: `Monkey-One Web Client`
   - **Authorized JavaScript origins**:
     - `https://monkey-one.dev`
     - `http://localhost:4000` (for development)
     - `https://4000-workspaces-monkey-one-*.gitpod.io` (for Gitpod development)
   - **Authorized redirect URIs**:
     - `https://monkey-one.dev/auth/callback`
     - `http://localhost:4000/auth/callback`
     - `https://4000-workspaces-monkey-one-*.gitpod.io/auth/callback`
5. Click **Create**
6. Copy the **Client ID** (it will look like: `123456789-abcdef.apps.googleusercontent.com`)

## Step 4: Update Environment Variables

Update your `.env` file with the actual Client ID:

```bash
# Replace with your actual Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID="123456789-abcdef.apps.googleusercontent.com"
```

## Step 5: Verify Workload Identity Federation (Already Configured)

Your existing configuration should work with these settings:
- **Project ID**: `agent-one-ffec8`
- **Project Number**: `425089133667`
- **Service Account**: `vercel@agent-one-ffec8.iam.gserviceaccount.com`
- **Workload Identity Pool**: `vercel`
- **Provider**: `vercel`

## Step 6: Test the Setup

1. **Local Development**:
   ```bash
   pnpm run dev
   ```
   - Visit `http://localhost:4000`
   - Click "Sign in with Google"
   - Complete OAuth flow

2. **Production Testing**:
   - Deploy to Vercel
   - Visit your production URL
   - Test authentication flow

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Ensure all redirect URIs are added to OAuth client
   - Check for trailing slashes and exact URL matches

2. **"origin_mismatch" error**:
   - Add all JavaScript origins to OAuth client
   - Include both HTTP (dev) and HTTPS (prod) origins

3. **OIDC token not available**:
   - OIDC tokens are only available in Vercel deployments
   - Local development will show "Limited" status for OIDC

4. **GCP credentials not working**:
   - Verify Workload Identity Federation is properly configured
   - Check service account permissions

### Required Permissions:

The service account `vercel@agent-one-ffec8.iam.gserviceaccount.com` should have:
- **Service Account Token Creator** (for impersonation)
- Any additional permissions needed for your GCP resources

## Security Considerations

1. **Client ID**: Safe to expose in frontend code
2. **Client Secret**: Not needed for public web applications
3. **Redirect URIs**: Must be exact matches, no wildcards
4. **CORS Origins**: Must include all domains where your app runs

## Next Steps

After completing this setup:
1. Test authentication in development
2. Deploy to Vercel and test in production
3. Monitor authentication logs in Google Cloud Console
4. Set up additional OAuth scopes if needed for your application

## Support

If you encounter issues:
1. Check Google Cloud Console logs
2. Verify OAuth consent screen approval status
3. Review Vercel deployment logs
4. Test with different browsers/incognito mode