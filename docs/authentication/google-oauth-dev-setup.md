# 🔑 Google OAuth Setup for monkey-one.dev

## 📋 **UPDATED CONFIGURATION FOR YOUR DOMAIN**

### **✅ Authorized JavaScript Origins**
Copy these URLs exactly (includes both your custom domain and Vercel domain):
```
https://monkey-one.dev
https://monkey-one-nine.vercel.app
http://localhost:4000
http://localhost:3000
```

### **✅ Authorized Redirect URIs**
Copy these URLs exactly (includes both your custom domain and Vercel domain):
```
https://monkey-one.dev/auth/callback
https://monkey-one-nine.vercel.app/auth/callback
http://localhost:4000/auth/callback
http://localhost:3000/auth/callback
```

### **✅ OAuth Consent Screen Settings**
```
App Name: Monkey-One
App Domain: https://monkey-one.dev
Authorized Domains:
  - monkey-one.dev
  - vercel.app
```

## 🚀 **QUICK SETUP STEPS**

### **1. Go to Google Cloud Console**
- Visit: https://console.cloud.google.com
- Select project: `agent-one-ffec8`

### **2. Enable API**
- Go to: APIs & Services → Library
- Search: "Google Identity Services API"
- Click: Enable

### **3. Configure OAuth Consent Screen**
- Go to: APIs & Services → OAuth consent screen
- Choose: External
- App name: `Monkey-One`
- App domain: `https://monkey-one.dev`
- Authorized domains: `monkey-one.dev` and `vercel.app`
- Scopes: `openid`, `email`, `profile`

### **4. Create OAuth Client**
- Go to: APIs & Services → Credentials
- Click: + CREATE CREDENTIALS → OAuth 2.0 Client ID
- Type: Web application
- Name: `Monkey-One Web Client`

**Add JavaScript Origins:**
```
https://monkey-one.dev
https://monkey-one-nine.vercel.app
http://localhost:4000
http://localhost:3000
```

**Add Redirect URIs:**
```
https://monkey-one.dev/auth/callback
https://monkey-one-nine.vercel.app/auth/callback
http://localhost:4000/auth/callback
http://localhost:3000/auth/callback
```

### **5. Copy Your Client ID**
- Copy the Client ID (format: `123456789-abc...apps.googleusercontent.com`)
- Update your `.env` file:
```bash
VITE_GOOGLE_CLIENT_ID="your-actual-client-id.apps.googleusercontent.com"
```

### **6. Test Locally**
```bash
pnpm run dev
# Visit: http://localhost:4000
# Click "Sign in with Google"
# Test at: http://localhost:4000/auth-test
```

### **7. Deploy to Production**
```bash
pnpm run build
vercel deploy --prod
# Test at: https://monkey-one.dev/auth-test
# Also works at: https://monkey-one-nine.vercel.app/auth-test (redirects to monkey-one.dev)
```

## ✅ **SUCCESS CHECKLIST**

- [ ] Google Cloud Console project `agent-one-ffec8` selected
- [ ] Google Identity Services API enabled
- [ ] OAuth consent screen configured with `monkey-one.dev`
- [ ] OAuth 2.0 Client ID created with correct URLs
- [ ] Client ID copied and added to `.env`
- [ ] Local testing works (`http://localhost:4000`)
- [ ] Production testing works (`https://monkey-one.dev`)

## 🧪 **TESTING VERIFICATION**

### **Development (localhost:4000)**
Expected status:
- ✅ Google OAuth: Active
- ✅ Supabase: Synced
- ⚠️ Vercel OIDC: Limited (expected)
- ○ GCP Access: N/A (expected)

### **Production (monkey-one.dev)**
Expected status:
- ✅ Google OAuth: Active
- ✅ Supabase: Synced
- ✅ Vercel OIDC: Active
- ✅ GCP Access: Available

---

**Ready to proceed? Let me know when you have your Client ID and I'll help you test it!**