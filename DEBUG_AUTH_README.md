# 🔧 Authentication Debugging Tools

This repository includes comprehensive debugging tools for the authentication flow using Vercel CLI, Supabase, and custom scripts.

## Quick Start

### Run All Debugging Tools

```bash
pnpm run debug:all
```

This runs all debugging scripts in sequence and provides a comprehensive report.

## Individual Tools

### 1. Environment Variables Validator

Validates all required environment variables for authentication:

```bash
pnpm run validate:env
```

**What it checks:**
- Presence of required variables
- Format validation (e.g., Google Client ID format)
- Placeholder value detection
- Provides setup suggestions

**Generate template:**
```bash
pnpm run validate:env -- --template
```

### 2. Authentication Flow Debugger

Complete check of the entire authentication flow:

```bash
pnpm run debug:auth
```

**What it checks:**
- Environment variables
- Google OAuth configuration
- Supabase connection
- Vercel deployment status
- OIDC token availability
- GCP Workload Identity setup
- Critical auth files existence

**Output:**
- Console report with pass/fail status
- JSON report saved to `auth-debug-report.json`

### 3. Supabase Debugger

Deep dive into Supabase integration:

```bash
pnpm run debug:supabase
```

**What it checks:**
- Supabase connection status
- Profiles table accessibility
- Row Level Security (RLS) policies
- Authentication operations
- Realtime subscriptions
- Database permissions

**Features:**
- Generates SQL migration if table doesn't exist
- Tests RLS policies
- Verifies database permissions

### 4. Vercel Debugger

Check Vercel deployment and OIDC configuration:

```bash
pnpm run debug:vercel
```

**What it checks:**
- Vercel CLI authentication
- Project listing
- Deployment status
- Environment variables on Vercel
- OIDC configuration
- Production endpoint accessibility

**Requirements:**
- Vercel CLI must be installed (comes with dependencies)
- Must be authenticated: `npx vercel login`

### 5. Web-Based Debug UI

Interactive debugging interface in the browser:

```bash
pnpm run dev
# Visit: http://localhost:4000/auth-debug
```

**Features:**
- Real-time authentication status
- Environment variables display
- Google OAuth status
- Supabase connection status
- OIDC token information
- Interactive test buttons
- Test results console

## Common Workflows

### First-Time Setup

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env and fill in your credentials
# ... edit .env file ...

# 3. Validate configuration
pnpm run validate:env

# 4. Run complete debug
pnpm run debug:all

# 5. Start development server
pnpm run dev

# 6. Visit debug UI
# Open: http://localhost:4000/auth-debug
```

### Debugging Auth Issues

```bash
# 1. Check environment variables
pnpm run validate:env

# 2. Test authentication flow
pnpm run debug:auth

# 3. Test Supabase specifically
pnpm run debug:supabase

# 4. Use web UI for interactive testing
pnpm run dev
# Visit: http://localhost:4000/auth-debug
```

### Pre-Deployment Check

```bash
# 1. Validate environment
pnpm run validate:env

# 2. Run all checks
pnpm run debug:all

# 3. Check Vercel configuration
pnpm run debug:vercel

# 4. Build the application
pnpm run build

# 5. Deploy to Vercel
npx vercel --prod
```

## Troubleshooting

### Google OAuth Not Working

**Check:**
```bash
pnpm run debug:auth
```

**Look for:**
- VITE_GOOGLE_CLIENT_ID configuration
- Client ID format validation
- Redirect URI configuration

**Fix:**
1. Ensure `VITE_GOOGLE_CLIENT_ID` is set in `.env`
2. Verify redirect URIs in Google Cloud Console
3. Check format: should end with `.apps.googleusercontent.com`

### Supabase Connection Issues

**Check:**
```bash
pnpm run debug:supabase
```

**Common issues:**
- Profiles table doesn't exist → Run the generated SQL migration
- RLS policies too restrictive → Check policies in Supabase dashboard
- Connection errors → Verify URL and keys in `.env`

### OIDC Token Not Available

**Note:** OIDC tokens are only available in Vercel production environments.

**In Development:**
- Expected behavior - OIDC not available
- Use local authentication only

**In Production:**
```bash
pnpm run debug:vercel
```

**Check:**
- OIDC configuration in `vercel.json`
- Vercel project settings
- Redeploy if needed: `npx vercel --prod`

### Environment Variables Missing

**Check:**
```bash
pnpm run validate:env
```

**Fix:**
1. Copy template: `cp .env.example .env`
2. Fill in required values
3. For Vercel: `npx vercel env add <VAR_NAME>`
4. Validate again: `pnpm run validate:env`

## Documentation

- **[AUTH_DEBUGGING_GUIDE.md](docs/AUTH_DEBUGGING_GUIDE.md)** - Comprehensive debugging guide
- **[README_AUTHENTICATION.md](README_AUTHENTICATION.md)** - Authentication system overview
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

## Files

### Scripts
- `scripts/debug-auth.ts` - Main authentication debugger
- `scripts/debug-supabase.ts` - Supabase integration debugger
- `scripts/debug-vercel.ts` - Vercel deployment debugger
- `scripts/validate-env.ts` - Environment validator

### UI Components
- `src/routes/auth-debug.tsx` - Web-based debug interface

### Configuration
- `package.json` - npm scripts for debugging
- `.env.example` - Environment template
- `vercel.json` - Vercel configuration

## Support

For issues or questions:

1. Run the relevant debugging tool
2. Check the documentation
3. Review browser console logs
4. Check Vercel deployment logs (if in production)
5. Review the generated `auth-debug-report.json`

## Tips

- Use `debug:all` for a comprehensive check
- Use web UI for interactive testing
- Run validators before deploying
- Check logs regularly during development
- Keep environment variables up to date

---

**Last Updated:** 2025-01-09
**Version:** 1.0.0
