# 🔐 Monkey-One Authentication System

## Overview

Monkey-One now features a **unified authentication system** that seamlessly integrates three authentication services:

- **🔑 Google OAuth** - Primary user authentication
- **🗄️ Supabase** - User profiles and database access
- **🚀 Vercel OIDC** - Backend service authentication

## ✅ Current Status: FULLY IMPLEMENTED

| Component | Status | Description |
|-----------|--------|-------------|
| Google OAuth | ✅ Ready | User sign-in with Google accounts |
| Supabase Sync | ✅ Ready | Automatic user profile synchronization |
| Vercel OIDC | ✅ Ready | Production backend authentication |
| GCP Integration | ✅ Ready | Workload Identity Federation |
| UI Components | ✅ Ready | Complete authentication interface |

## 🚀 Quick Start

### 1. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select project: `agent-one-ffec8`
3. Create OAuth 2.0 Client ID
4. Add these redirect URIs:
   ```
   https://monkey-one.dev/auth/callback
   http://localhost:4000/auth/callback
   ```
5. Update `.env`:
   ```bash
   VITE_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   ```

### 2. Deploy to Vercel

```bash
pnpm run build
vercel deploy --prod
```

### 3. Test Authentication

Visit `/auth-test` to verify all authentication services are working.

## 🏗️ Architecture

### Authentication Flow

```mermaid
graph TD
    A[User clicks "Sign in"] --> B[Google OAuth]
    B --> C[User grants permissions]
    C --> D[AuthContext receives user data]
    D --> E[Sync to Supabase]
    D --> F[Check for OIDC token]
    D --> G[Exchange for GCP credentials]
    E --> H[User fully authenticated]
    F --> H
    G --> H
```

### Data Synchronization

When a user signs in with Google:

1. **User data** is stored in localStorage
2. **Supabase profile** is automatically created/updated
3. **OIDC token** is retrieved (production only)
4. **GCP credentials** are exchanged via Workload Identity

## 🧩 Components

### Core Components

- **`AuthContext`** - Unified authentication state management
- **`LoginButton`** - Google OAuth sign-in button
- **`UserProfile`** - User dropdown with authentication status
- **`AuthGuard`** - Route protection with granular requirements
- **`AuthStatus`** - Detailed authentication status display

### Usage Examples

```typescript
// Protect a route
<AuthGuard requireOIDC={true}>
  <AdminPanel />
</AuthGuard>

// Access user data
const { user, supabaseProfile, isAuthenticated } = useAuth()

// Make authenticated API calls
const { fetch } = useAuthenticatedFetch()
const response = await fetch('/api/protected', { useGCP: true })
```

## 🔧 Configuration

### Environment Variables

```bash
# Authentication Control
VITE_AUTH_ENABLED=true
VITE_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"

# OIDC Configuration
VITE_OIDC_ENABLED=true
VITE_OIDC_ISSUER_MODE=team

# GCP Workload Identity (already configured)
GCP_PROJECT_ID="agent-one-ffec8"
GCP_PROJECT_NUMBER="425089133667"
GCP_SERVICE_ACCOUNT_EMAIL="vercel@agent-one-ffec8.iam.gserviceaccount.com"
GCP_WORKLOAD_IDENTITY_POOL_ID="vercel"
GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID="vercel"

# Supabase (already configured)
VITE_PUBLIC_SUPABASE_URL="https://kxdaxwvxaonnvjmqfvtj.supabase.co"
VITE_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Vercel Configuration

The `vercel.json` file includes:

```json
{
  "oidc": {
    "issuerMode": "team"
  },
  "env": {
    "VERCEL_OIDC_TOKEN": "@vercel-oidc-token",
    "VITE_GOOGLE_CLIENT_ID": "${VITE_GOOGLE_CLIENT_ID}",
    // ... other environment variables
  }
}
```

## 🗄️ Database Schema

### Supabase `profiles` Table

```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{
    "theme": "system",
    "language": "en",
    "notifications": true
  }'::jsonb
);
```

## 🔒 Security Features

### Authentication Levels

1. **Public** - No authentication required
2. **Google OAuth** - Requires Google sign-in
3. **Supabase Sync** - Requires Google + Supabase profile
4. **OIDC Enhanced** - Requires Google + OIDC token (Vercel only)
5. **Full Access** - Requires Google + Supabase + OIDC + GCP

### Token Management

- **Google OAuth**: Managed by Google Identity Services
- **Supabase**: Automatic session management
- **OIDC**: Auto-refresh every 5 minutes
- **GCP**: Token exchange via Workload Identity Federation

## 🧪 Testing

### Development Testing

```bash
# Run the OAuth configuration helper
node scripts/setup-oauth.js

# Start development server
pnpm run dev

# Visit test page
open http://localhost:4000/auth-test
```

### Production Testing

After deployment:

1. Visit your production URL
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Check `/auth-test` for full authentication status
5. Verify all services show as "Active"

## 📊 Monitoring

### Authentication Status Indicators

The UserProfile dropdown shows real-time status:

- **Google OAuth**: ✓ Active / ✗ Disconnected
- **Vercel OIDC**: ✓ Active / ⚠ Limited / ✗ Unavailable
- **GCP Access**: ✓ Available / ○ N/A
- **Supabase**: ✓ Synced / ✗ Not Synced

### Debug Information

Visit `/auth-test` for detailed authentication information:

- User data from Google OAuth
- Supabase profile details
- OIDC token information (production)
- GCP credentials status (production)
- Environment configuration

## 🚨 Troubleshooting

### Common Issues

**"redirect_uri_mismatch" Error**
- Verify exact URL matches in Google Console
- Check for trailing slashes
- Ensure both HTTP (dev) and HTTPS (prod) URLs added

**"User not synced to Supabase"**
- Check browser console for errors
- Verify Supabase connection
- Check database permissions

**"OIDC token unavailable"**
- Expected in development environment
- Deploy to Vercel for OIDC access
- Check Vercel project settings

**"GCP credentials not working"**
- Requires valid OIDC token
- Verify Workload Identity Federation setup
- Check service account permissions

### Debug Tools

1. **AuthStatus Component**: Detailed authentication state
2. **Browser Console**: Authentication flow logs
3. **OAuth Helper Script**: `node scripts/setup-oauth.js`
4. **Supabase Dashboard**: User profile verification

## 📚 Documentation

- **[Google OAuth Setup Guide](./docs/GOOGLE_OAUTH_SETUP.md)** - Detailed OAuth configuration
- **[Authentication Architecture](./docs/AUTHENTICATION_ARCHITECTURE.md)** - Technical deep dive
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification

## 🔄 Development vs Production

### Development Environment
- ✅ Google OAuth works with localhost
- ✅ Supabase full functionality
- ❌ OIDC not available (shows "Limited")
- ❌ GCP requires OIDC token

### Production Environment (Vercel)
- ✅ Google OAuth full functionality
- ✅ Supabase full functionality
- ✅ OIDC automatic token provision
- ✅ GCP Workload Identity Federation

## 🎯 Next Steps

### Immediate Actions
1. Configure Google OAuth Client ID
2. Deploy to Vercel
3. Test complete authentication flow
4. Monitor user sign-ups in Supabase

### Future Enhancements
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Additional OAuth providers (GitHub, Microsoft)
- Session management dashboard
- Audit logging

## 📞 Support

For authentication issues:

1. Check the troubleshooting section above
2. Review browser console logs
3. Verify environment variables
4. Test with `/auth-test` page
5. Check Vercel deployment logs

---

**Status**: ✅ Production Ready  
**Last Updated**: 2025-01-01  
**Version**: 1.0.0

The authentication system is fully implemented and ready for production use. Simply configure the Google OAuth Client ID and deploy to Vercel to enable complete authentication functionality.