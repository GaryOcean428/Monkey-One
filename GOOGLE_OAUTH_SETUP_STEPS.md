# 🔑 Google OAuth Client ID Setup - Step by Step

## 📋 **STEP 1: Access Google Cloud Console**

1. Go to: **https://console.cloud.google.com**
2. Sign in with your Google account
3. Select project: **`agent-one-ffec8`** (from the project dropdown at the top)

## 📋 **STEP 2: Enable Google Identity Services API**

1. In the left sidebar, go to: **APIs & Services** → **Library**
2. Search for: **"Google Identity Services API"**
3. Click on it and press **"Enable"** (if not already enabled)

## 📋 **STEP 3: Configure OAuth Consent Screen**

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Choose: **External** (for public access)
3. Fill in the required fields:

### **App Information**
```
App name: Monkey-One
User support email: [Your Email Address]
Developer contact information: [Your Email Address]
```

### **App Domain**
```
Application home page: https://monkey-one.dev
Application privacy policy link: https://monkey-one.dev/privacy
Application terms of service link: https://monkey-one.dev/terms
```

### **Authorized Domains**
Add these domains:
```
monkey-one.dev
vercel.app
```

4. Click **"Save and Continue"**

### **Scopes**
1. Click **"Add or Remove Scopes"**
2. Add these scopes:
   - `openid`
   - `email` 
   - `profile`
3. Click **"Update"** then **"Save and Continue"**

### **Test Users** (Optional)
- You can add test users or skip this step
- Click **"Save and Continue"**

## 📋 **STEP 4: Create OAuth 2.0 Client ID**

1. Go to: **APIs & Services** → **Credentials**
2. Click: **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
3. Choose: **"Web application"**

### **Configure the Client**
```
Name: Monkey-One Web Client
```

### **Authorized JavaScript Origins**
Add these URLs exactly as shown:
```
https://monkey-one.dev
http://localhost:4000
http://localhost:3000
```

### **Authorized Redirect URIs**
Add these URLs exactly as shown:
```
https://monkey-one.dev/auth/callback
http://localhost:4000/auth/callback
http://localhost:3000/auth/callback
```

4. Click **"Create"**

## 📋 **STEP 5: Copy Your Client ID**

1. After creation, you'll see a popup with your credentials
2. **Copy the Client ID** (it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
3. **Important**: You don't need the Client Secret for this setup

## 📋 **STEP 6: Update Environment Variables**

1. Open your `.env` file in the project
2. Find this line:
   ```bash
   VITE_GOOGLE_CLIENT_ID="your-google-client-id-here.apps.googleusercontent.com"
   ```
3. Replace it with your actual Client ID:
   ```bash
   VITE_GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
   ```

## 📋 **STEP 7: Test the Setup**

1. Save the `.env` file
2. Run the development server:
   ```bash
   pnpm run dev
   ```
3. Open: **http://localhost:4000**
4. You should see a "Sign in with Google" button
5. Click it to test the OAuth flow

## 📋 **STEP 8: Verify Authentication**

1. After signing in, visit: **http://localhost:4000/auth-test**
2. You should see:
   - ✅ Google OAuth: Active
   - ✅ Supabase: Synced
   - ⚠️ Vercel OIDC: Limited (expected in development)
   - ○ GCP Access: N/A (expected in development)

## 🚨 **Troubleshooting**

### **"redirect_uri_mismatch" Error**
- Double-check that redirect URIs are exactly as shown above
- Make sure there are no trailing slashes
- Verify you're using the correct port (4000)

### **"origin_mismatch" Error**
- Verify JavaScript origins are exactly as shown above
- Make sure you included both HTTP and HTTPS versions

### **OAuth Consent Screen Issues**
- Make sure the consent screen is configured for "External" users
- Verify all required fields are filled in
- Check that authorized domains are added

## ✅ **Success Indicators**

You'll know it's working when:
- ✅ Google sign-in popup appears
- ✅ User can complete OAuth flow
- ✅ User is redirected back to the app
- ✅ User profile appears in the top-right corner
- ✅ `/auth-test` page shows Google OAuth as "Active"
- ✅ Supabase profile is created (check Supabase dashboard)

## 📞 **Need Help?**

If you encounter issues:
1. Check the browser console for error messages
2. Verify all URLs are exactly as specified
3. Make sure the project `agent-one-ffec8` is selected
4. Ensure the OAuth consent screen is properly configured

---

**Once you complete these steps, paste your Client ID here and I'll help you test the authentication flow!**