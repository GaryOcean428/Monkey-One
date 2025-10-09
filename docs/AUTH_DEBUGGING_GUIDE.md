# 🔧 Authentication Flow Debugging Guide

This guide provides comprehensive instructions for debugging the authentication flow in Monkey-One using Vercel CLI, Supabase tools, and custom debugging scripts.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Debugging Tools](#debugging-tools)
4. [Common Issues](#common-issues)
5. [Step-by-Step Debugging](#step-by-step-debugging)
6. [Environment Setup](#environment-setup)
7. [Testing Procedures](#testing-procedures)

## Prerequisites

Before debugging, ensure you have:

- Node.js v20+ installed
- pnpm package manager
- Vercel CLI access (run `npx vercel login` if needed)
- Supabase project credentials
- Google OAuth credentials

## Quick Start

### 1. Install Dependencies

```bash
cd /path/to/Monkey-One
pnpm install
```

### 2. Run All Debug Scripts

```bash
# Run all debugging tools
pnpm run debug:all

# Or run individually
pnpm run debug:auth        # Complete auth flow check
pnpm run debug:supabase    # Supabase integration check
pnpm run debug:vercel      # Vercel deployment check
pnpm run validate:env      # Environment variables validation
```

### 3. Access Debug UI

Start the development server and visit the debug page:

```bash
pnpm run dev
# Visit: http://localhost:4000/auth-debug
```

## Debugging Tools

### 1. Authentication Flow Debugger (`debug:auth`)

**Purpose:** Comprehensive check of the entire authentication flow

**What it checks:**
- Environment variables configuration
- Google OAuth setup
- Supabase connection
- Vercel deployment status
- OIDC token availability
- GCP Workload Identity configuration
- Critical auth files existence

**Usage:**
```bash
pnpm run debug:auth
```

**Output:**
- Detailed report of each component
- Pass/Fail/Warning status for each check
- Actionable recommendations for failures
- JSON report saved to `auth-debug-report.json`

### 2. Supabase Debugger (`debug:supabase`)

**Purpose:** Deep dive into Supabase integration

**What it checks:**
- Supabase connection status
- Profiles table accessibility
- Row Level Security (RLS) policies
- Authentication operations
- Realtime subscriptions
- Database permissions

**Usage:**
```bash
pnpm run debug:supabase
```

**Output:**
- Connection test results
- Table structure validation
- RLS policy checks
- SQL migration script (if table doesn't exist)

### 3. Vercel Debugger (`debug:vercel`)

**Purpose:** Vercel deployment and OIDC configuration check

**What it checks:**
- Vercel CLI authentication
- Project listing
- Deployment status
- Environment variables on Vercel
- OIDC configuration
- Production endpoint accessibility

**Usage:**
```bash
pnpm run debug:vercel
```

**Output:**
- CLI authentication status
- Active deployments
- Environment variables status
- OIDC token information
- Setup instructions

### 4. Environment Validator (`validate:env`)

**Purpose:** Validate all required environment variables

**What it checks:**
- Presence of required variables
- Format validation
- Placeholder detection
- Value masking for security

**Usage:**
```bash
pnpm run validate:env

# Generate template
pnpm run validate:env -- --template
```

**Output:**
- Variable-by-variable validation
- Suggestions for missing variables
- Environment template generation

### 5. Web-Based Debug UI (`/auth-debug`)

**Purpose:** Interactive debugging in the browser

**Features:**
- Real-time authentication status
- Environment variables display
- Google OAuth status
- Supabase connection status
- OIDC token information
- Interactive test buttons
- Test results console

**Access:**
```bash
pnpm run dev
# Open: http://localhost:4000/auth-debug
```

## Common Issues

### Issue 1: Google OAuth Not Working

**Symptoms:**
- "redirect_uri_mismatch" error
- User not authenticated after redirect

**Debug Steps:**
```bash
# Check OAuth configuration
pnpm run debug:auth

# Verify environment variable
pnpm run validate:env | grep GOOGLE_CLIENT_ID
```

**Fix:**
1. Ensure `VITE_GOOGLE_CLIENT_ID` is set in `.env`
2. Verify redirect URIs in Google Cloud Console:
   - `http://localhost:4000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)
3. Check Client ID format: should end with `.apps.googleusercontent.com`

### Issue 2: Supabase Profile Not Syncing

**Symptoms:**
- User authenticated but profile not in database
- "Profile not synced" warning in debug UI

**Debug Steps:**
```bash
# Test Supabase connection
pnpm run debug:supabase
```

**Fix:**
1. Check if profiles table exists (run migration if needed)
2. Verify RLS policies allow inserts
3. Check browser console for sync errors
4. Use debug UI to manually trigger profile sync test

### Issue 3: OIDC Token Not Available

**Symptoms:**
- "OIDC token unavailable" warning
- GCP credentials not working

**Debug Steps:**
```bash
# Check Vercel configuration
pnpm run debug:vercel
```

**Fix:**
1. **In Development:** This is expected - OIDC only available in production
2. **In Production:**
   - Verify `vercel.json` has OIDC configuration
   - Check Vercel project settings
   - Redeploy: `npx vercel --prod`

### Issue 4: Environment Variables Missing

**Symptoms:**
- Application errors on startup
- "Missing environment variables" warnings

**Debug Steps:**
```bash
# Validate environment
pnpm run validate:env
```

**Fix:**
1. Copy `.env.example` to `.env`: `cp .env.example .env`
2. Fill in required values
3. For Vercel deployment, set variables: `npx vercel env add <VAR_NAME>`

## Step-by-Step Debugging

### Debugging a Failed Authentication Flow

1. **Check Environment Setup**
   ```bash
   pnpm run validate:env
   ```
   Fix any REQUIRED variables that are missing or invalid.

2. **Verify Google OAuth**
   ```bash
   pnpm run debug:auth
   ```
   Look for Google OAuth section - ensure Client ID is configured.

3. **Test Supabase Connection**
   ```bash
   pnpm run debug:supabase
   ```
   Ensure profiles table exists and is accessible.

4. **Check Vercel Deployment**
   ```bash
   pnpm run debug:vercel
   ```
   Verify CLI authentication and deployment status.

5. **Use Debug UI**
   - Start dev server: `pnpm run dev`
   - Visit: `http://localhost:4000/auth-debug`
   - Run each test individually
   - Review results for specific errors

6. **Check Browser Console**
   - Open browser DevTools (F12)
   - Look for auth-related errors
   - Check Network tab for failed API calls

7. **Review Logs**
   - Check `auth-debug-report.json` for detailed analysis
   - Review Vercel deployment logs if in production

## Environment Setup

### Local Development

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Set required variables:**
   ```bash
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_PUBLIC_URL=http://localhost:4000
   VITE_AUTH_ENABLED=true
   ```

3. **Validate configuration:**
   ```bash
   pnpm run validate:env
   ```

### Production (Vercel)

1. **Authenticate with Vercel:**
   ```bash
   npx vercel login
   ```

2. **Link project:**
   ```bash
   npx vercel link
   ```

3. **Set environment variables:**
   ```bash
   npx vercel env add VITE_GOOGLE_CLIENT_ID production
   npx vercel env add VITE_GOOGLE_CLIENT_SECRET production
   npx vercel env add VITE_SUPABASE_URL production
   npx vercel env add VITE_SUPABASE_ANON_KEY production
   ```

4. **Deploy:**
   ```bash
   npx vercel --prod
   ```

5. **Verify deployment:**
   ```bash
   pnpm run debug:vercel
   ```

## Testing Procedures

### Manual Testing Workflow

1. **Pre-deployment Testing:**
   ```bash
   # Validate everything locally
   pnpm run debug:all
   pnpm run build
   pnpm run preview
   ```

2. **Test Authentication Flow:**
   - Visit debug UI: `http://localhost:4000/auth-debug`
   - Click "Test Google Auth" button
   - Sign in with Google
   - Verify profile sync
   - Check all indicators are green

3. **Post-deployment Testing:**
   ```bash
   # After deploying to Vercel
   pnpm run debug:vercel
   ```
   - Visit production URL
   - Test auth flow in production
   - Verify OIDC token is available
   - Check Vercel deployment logs

### Automated Testing

Create a test script to run all checks:

```bash
#!/bin/bash
echo "Running comprehensive auth checks..."
pnpm run validate:env && \
pnpm run debug:auth && \
pnpm run debug:supabase && \
pnpm run debug:vercel && \
echo "All checks completed!"
```

## Supabase Setup

### Create Profiles Table

If the profiles table doesn't exist, run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
```

## Vercel OIDC Setup

### Configure vercel.json

Ensure your `vercel.json` includes:

```json
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "framework": "vite",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@2.0.0"
    }
  },
  "oidc": {
    "issuerMode": "team"
  },
  "env": {
    "VERCEL_OIDC_TOKEN": "@vercel-oidc-token"
  }
}
```

## Getting Help

If you're still experiencing issues after following this guide:

1. **Review the logs:**
   - Check `auth-debug-report.json`
   - Review browser console
   - Check Vercel deployment logs

2. **Collect debug information:**
   ```bash
   pnpm run debug:all > debug-output.txt 2>&1
   ```

3. **Check documentation:**
   - `README_AUTHENTICATION.md`
   - `DEPLOYMENT_CHECKLIST.md`
   - `docs/AUTHENTICATION_ARCHITECTURE.md`

4. **Common resources:**
   - Google OAuth: https://console.cloud.google.com/apis/credentials
   - Supabase Dashboard: https://supabase.com/dashboard
   - Vercel Dashboard: https://vercel.com/dashboard

## Summary

This debugging guide provides comprehensive tools and procedures for diagnosing authentication issues in Monkey-One. The combination of CLI debugging scripts, web-based UI, and manual testing procedures ensures you can quickly identify and resolve authentication problems.

**Key Commands:**
- `pnpm run debug:all` - Run all checks
- `pnpm run validate:env` - Validate environment
- `pnpm run debug:auth` - Check auth flow
- `pnpm run debug:supabase` - Test Supabase
- `pnpm run debug:vercel` - Verify Vercel
- Visit `/auth-debug` - Interactive debugging

**Remember:** OIDC tokens are only available in Vercel production deployments, not in local development.
