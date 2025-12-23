# 🚀 Deployment Checklist

## ✅ Authentication System Status

### **COMPLETED IMPLEMENTATION**

✅ **Google OAuth Integration**
- Google OAuth client setup (needs real Client ID)
- User authentication flow
- Local storage management
- OAuth callback handling

✅ **Supabase Integration** 
- User profile synchronization
- Database schema ready
- Automatic profile creation/updates
- User preferences management

✅ **Vercel OIDC Integration**
- OIDC token handling
- GCP Workload Identity Federation
- Service account impersonation
- Automatic credential refresh

✅ **Unified Authentication Context**
- Single AuthContext managing all auth states
- Real-time sync status monitoring
- Automatic credential refresh
- Error handling and fallbacks

✅ **UI Components**
- LoginButton with Google branding
- UserProfile dropdown with auth status
- AuthGuard for route protection
- AuthStatus for debugging
- AuthTest page for verification

## 🔧 REQUIRED ACTIONS BEFORE DEPLOYMENT

### 1. **Configure Google OAuth Client ID**

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select project: `agent-one-ffec8`
3. Create OAuth 2.0 Client ID with these settings:

**Authorized JavaScript Origins:**
```
https://monkey-one.dev
http://localhost:4000
http://localhost:3000
```

**Authorized Redirect URIs:**
```
https://monkey-one.dev/auth/callback
http://localhost:4000/auth/callback
http://localhost:3000/auth/callback
```

4. Copy the Client ID and update `.env`:
```bash
VITE_GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
```

### 2. **Verify Environment Variables**

**Production (.env.production):**
```bash
# Authentication
VITE_AUTH_ENABLED=true
VITE_GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"

# Vercel OIDC (automatically provided)
VITE_OIDC_ENABLED=true
VITE_OIDC_ISSUER_MODE=team

# Supabase (already configured)
VITE_PUBLIC_SUPABASE_URL="https://kxdaxwvxaonnvjmqfvtj.supabase.co"
VITE_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# GCP OIDC (already configured)
GCP_PROJECT_ID="agent-one-ffec8"
GCP_PROJECT_NUMBER="425089133667"
GCP_SERVICE_ACCOUNT_EMAIL="vercel@agent-one-ffec8.iam.gserviceaccount.com"
GCP_WORKLOAD_IDENTITY_POOL_ID="vercel"
GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID="vercel"
```

### 3. **Deploy to Vercel**

```bash
# Build and deploy
pnpm run build
vercel deploy --prod

# Or use the deploy script
./deploy.sh
```

## 🧪 TESTING CHECKLIST

### **Development Testing**
- [ ] Build completes without errors: `pnpm run build`
- [ ] App loads without authentication (shows login screen)
- [ ] Google OAuth button displays correctly
- [ ] AuthTest page accessible at `/auth-test`
- [ ] Environment variables loaded correctly

### **Production Testing (After Deployment)**
- [ ] Google OAuth sign-in works
- [ ] User profile syncs to Supabase
- [ ] OIDC token available in production
- [ ] GCP credentials exchange works
- [ ] User profile dropdown shows all auth statuses
- [ ] AuthTest page shows complete auth information

## 📊 EXPECTED AUTHENTICATION FLOW

### **Development Environment**
```
User clicks "Sign in with Google"
↓
Google OAuth consent screen
↓
User grants permissions
↓
Redirect to /auth/callback
↓
User data stored in localStorage
↓
User profile synced to Supabase ✅
↓
OIDC token: ❌ Not available (expected)
↓
GCP credentials: ❌ Not available (expected)
↓
Authentication complete with limited backend access
```

### **Production Environment (Vercel)**
```
User clicks "Sign in with Google"
↓
Google OAuth consent screen
↓
User grants permissions
↓
Redirect to /auth/callback
↓
User data stored in localStorage
↓
User profile synced to Supabase ✅
↓
OIDC token: ✅ Automatically provided by Vercel
↓
GCP credentials: ✅ Exchanged via Workload Identity
↓
Full authentication with complete backend access
```

## 🔍 VERIFICATION STEPS

### **1. Check Authentication Status**
Visit `/auth-test` after deployment to verify:
- Google OAuth user data
- Supabase profile synchronization
- OIDC token presence (production only)
- GCP credentials availability (production only)

### **2. Monitor User Profile Dropdown**
The UserProfile component shows real-time status:
- **Google OAuth**: ✓ Active
- **Vercel OIDC**: ✓ Active (prod) / ⚠ Limited (dev)
- **GCP Access**: ✓ Available (prod) / ○ N/A (dev)
- **Supabase**: ✓ Synced / ✗ Not Synced

### **3. Database Verification**
Check Supabase dashboard for new user profiles:
- Navigate to Supabase project dashboard
- Check `profiles` table for new entries
- Verify user data matches Google OAuth info

## 🚨 TROUBLESHOOTING

### **Common Issues & Solutions**

**1. "redirect_uri_mismatch" Error**
- Verify exact URL matches in Google Console
- Check for trailing slashes
- Ensure both HTTP (dev) and HTTPS (prod) URLs added

**2. "User not synced to Supabase"**
- Check Supabase connection in browser console
- Verify database permissions
- Check for CORS issues

**3. "OIDC token unavailable"**
- Expected in development
- Verify deployment to Vercel
- Check Vercel project OIDC settings

**4. "GCP credentials not working"**
- Requires valid OIDC token
- Verify Workload Identity Federation setup
- Check service account permissions

## 📈 SUCCESS METRICS

### **Authentication System is Working When:**
- [ ] Users can sign in with Google OAuth
- [ ] User profiles automatically sync to Supabase
- [ ] OIDC tokens are available in production
- [ ] GCP credentials exchange successfully
- [ ] All auth statuses show as "Active" in production
- [ ] Users can access protected routes
- [ ] Authentication persists across browser sessions

## 🔄 POST-DEPLOYMENT ACTIONS

### **1. Monitor Authentication**
- Check Vercel deployment logs
- Monitor Supabase user creation
- Review Google OAuth usage in Cloud Console

### **2. User Experience**
- Test sign-in flow from different browsers
- Verify mobile compatibility
- Test sign-out functionality

### **3. Security Review**
- Verify no sensitive data in client-side code
- Check CORS settings
- Review OAuth scopes and permissions

---

## 📞 SUPPORT RESOURCES

- **Google OAuth Setup**: [./docs/GOOGLE_OAUTH_SETUP.md](./docs/GOOGLE_OAUTH_SETUP.md)
- **Authentication Architecture**: [./docs/AUTHENTICATION_ARCHITECTURE.md](./docs/AUTHENTICATION_ARCHITECTURE.md)
- **OAuth Configuration Helper**: `node scripts/setup-oauth.js`
- **Test Page**: Visit `/auth-test` after deployment

---

**Status**: ✅ Ready for deployment
**Next Step**: Configure Google OAuth Client ID and deploy to Vercel
**Estimated Time**: 15-30 minutes for complete setup and testing