# Deployment Guide

This guide focuses on deploying Monkey-One using Vercel and Supabase.

## Prerequisites

### Required Tools

- Node.js v22.12.0 or higher
- pnpm (preferred package manager)
- Git
- Vercel CLI (optional, for local testing)
- Supabase CLI (optional, for local development)

### Required Accounts

- Vercel account
- Supabase account
- Pinecone account (for vector storage)

## Environment Setup

### 1. Environment Variables

Create a `.env` file with the following variables:

```bash
# Public URL (for local development)
VITE_PUBLIC_URL=http://localhost:3000

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Pinecone Configuration
VITE_PINECONE_API_KEY=your_pinecone_api_key
VITE_PINECONE_ENVIRONMENT=your_pinecone_environment
VITE_PINECONE_INDEX_NAME=your_pinecone_index_name

# Proxy Server Configuration (for local development)
PROXY_PORT=3004
```

#### Environment Variables in Vercel

When deploying to Vercel, add these variables in the Vercel dashboard:

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable above
4. Ensure the variables are enabled for the appropriate environments (Production, Preview, Development)

You can also use the provided script to set up Vercel secrets:

```bash
./scripts/setup-vercel-secrets.sh
```

### 2. Vercel Project Setup

1. Create a new project in Vercel
2. Link your GitHub repository
3. Configure environment variables in Vercel dashboard
4. Set up build settings:
   - Framework Preset: `Vite`
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
   - Development Command: `pnpm run dev`

#### Project Configuration (vercel.json)

The project includes a `vercel.json` file with important configurations:

```json
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "vite",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/manifest.json",
      "destination": "/manifest.json"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        },
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        }
      ]
    }
  ],
  "env": {
    "VITE_PUBLIC_URL": "${VITE_PUBLIC_URL}"
  }
}
```

#### Vercel Authentication Settings

For preview deployments, Vercel may enable authentication by default, which can cause issues with static assets like `manifest.json`. If you encounter 401 errors:

1. Go to Vercel Dashboard → Project → Settings → Authentication
2. Under "Authentication Protection", uncheck "Preview" environments if you don't need authentication for previews
3. Click "Save"

### 3. Supabase Setup

1. Create a new Supabase project
2. Set up database schema using migrations
3. Configure Row Level Security (RLS)
4. Enable required auth providers
5. Copy project URL and anon key to environment variables

## Deployment Process

### Automatic Deployments

1. Push to main branch
2. Vercel automatically builds and deploys
3. Monitor deployment in Vercel dashboard

### Manual Deployments

```bash
# Install dependencies
pnpm install

# Build application
pnpm build

# Deploy using Vercel CLI
vercel --prod
```

## Database Migrations

### Running Migrations

```bash
# Using Supabase CLI
supabase migration up

# Or using provided scripts
pnpm db:migrate
```

### Creating New Migrations

```bash
# Generate migration
supabase migration new my_migration_name

# Apply locally
supabase migration up
```

## Security Configuration

### Supabase Security

1. **Row Level Security (RLS)**

   ```sql
   -- Enable RLS
   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can only access their own data"
   ON your_table
   FOR ALL
   USING (auth.uid() = user_id);
   ```

2. **API Security**
   - Use anon key only for public routes
   - Implement proper role-based access
   - Enable SSL for database connections

### Vercel Security

1. **Environment Variables**

   - Store sensitive data in Vercel environment variables
   - Use different values for preview/production

2. **Edge Functions**
   - Implement proper authentication
   - Rate limiting where necessary
   - Input validation

## Monitoring

### Vercel Analytics

- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track deployment success

### Supabase Monitoring

- Database performance metrics
- Auth usage statistics
- API call monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check build logs in Vercel
   - Verify dependencies are installed
   - Check environment variables

2. **Database Connection Issues**

   - Verify Supabase connection string
   - Check RLS policies
   - Monitor database logs

3. **Performance Issues**

   - Check Vercel analytics
   - Monitor Supabase query performance
   - Review edge function logs

4. **401 Error for manifest.json**

   - Check if Vercel Authentication is enabled for preview deployments
   - Verify the HTML link has `crossorigin="use-credentials"` attribute:
     ```html
     <link rel="manifest" href="/manifest.json" crossorigin="use-credentials" />
     ```
   - Review the headers and rewrites in `vercel.json`:
     ```json
     {
       "headers": [
         {
           "source": "/manifest.json",
           "headers": [
             { "key": "Content-Type", "value": "application/manifest+json" },
             { "key": "Access-Control-Allow-Credentials", "value": "true" },
             { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
           ]
         }
       ],
       "rewrites": [{ "source": "/manifest.json", "destination": "/manifest.json" }]
     }
     ```
   - Ensure a static `manifest.json` file exists in the `public` directory

5. **Missing Environment Variables (VITE_PUBLIC_URL)**
   - Add VITE_PUBLIC_URL to Vercel environment variables
   - Set it to your deployment URL (e.g., `https://your-app.vercel.app`)
   - Include it in `vercel.json` env section:
     ```json
     "env": {
       "VITE_PUBLIC_URL": "${VITE_PUBLIC_URL}"
     }
     ```
   - Verify it's properly defined in `vite.config.ts`

### Support Resources

- Vercel Documentation: <https://vercel.com/docs>
- Supabase Documentation: <https://supabase.com/docs>
- Project Issues: Create issue in GitHub repository

## CI/CD Pipeline

### GitHub Actions

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/actions/deploy@v2
```

## Performance Optimization

### Build Optimization

1. Enable tree shaking
2. Configure proper chunking
3. Optimize asset loading

### Runtime Performance

1. Implement proper caching
2. Use edge functions where appropriate
3. Optimize database queries

### Monitoring Tools

1. Vercel Analytics
2. Supabase Dashboard
3. Custom monitoring solutions

### Network Optimization

1. Use a CDN for static assets
2. Enable HTTP/2 for multiplexing
3. Implement request compression
4. Use WebSocket connection pooling

## Vercel Environment Setup

### Environment Variables Management

To ensure consistent environment variables between local development and Vercel deployments:

1. **Pulling Vercel Environment Variables**:

   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel

   # Link your project (if not already linked)
   vercel link

   # Pull development environment variables
   vercel env pull .env.development.local

   # For preview environment variables
   vercel env pull .env.development.local --environment=preview

   # For production environment variables
   vercel env pull .env.production.local --environment=production
   ```

2. **Branch-Specific Variables** (Vercel CLI ≥v22.0.0):

   ```bash
   # Pull variables specific to a feature branch
   vercel env pull .env.development.local --git-branch=feature-branch
   ```

3. **Environment Variable Limits**:
   - Total size per deployment must not exceed 64KB
   - Edge Functions limited to 5KB
   - Encrypted sensitive values but still keep `.env.*.local` in `.gitignore`

## PWA and Static Assets

### Static Files Configuration

The application uses several static assets that need special configuration in Vercel:

1. **PWA Manifest**:

   - `manifest.json` in the public directory
   - Used by browsers for PWA installation
   - Requires special headers and crossorigin settings

2. **Icons and Images**:
   - Stored in the public directory
   - Automatically served by Vercel's static file system
   - Can be cached at the edge for better performance

### CORS and Preflight Requests

To properly handle CORS preflight requests for static assets:

1. **OPTIONS Allowlist Configuration**:

   - Go to Vercel Dashboard → Project → Settings → Deployment Protection → OPTIONS Allowlist
   - Add `/manifest.json` and other paths that need CORS support
   - This allows preflight requests to bypass authentication checks

2. **Vercel.json CORS Headers**:
   ```json
   {
     "headers": [
       {
         "source": "/manifest.json",
         "headers": [
           { "key": "Content-Type", "value": "application/manifest+json" },
           { "key": "Access-Control-Allow-Origin", "value": "*" },
           { "key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS" },
           {
             "key": "Access-Control-Allow-Headers",
             "value": "Content-Type, Accept, Authorization"
           },
           { "key": "Access-Control-Allow-Credentials", "value": "true" },
           { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
         ]
       }
     ]
   }
   ```

### Manifest.json Configuration

To ensure proper manifest.json handling:

1. **HTML Configuration**:

   ```html
   <link rel="manifest" href="/manifest.json" crossorigin="use-credentials" />
   ```

2. **Static File Placement**:
   - Place `manifest.json` in `/public/manifest.json`
   - This serves as a fallback if the server route fails

### Deployment Protection Bypass Options

Vercel's Deployment Protection can block access to static files. Here are options to bypass protection for specific files:

1. **OPTIONS Allowlist** (All plans):

   - Configure in Project Settings → Deployment Protection → OPTIONS Allowlist
   - Add `/manifest.json` and related paths
   - Ideal for browser-initiated CORS workflows

2. **Protection Bypass for Automation** (All plans):

   - Set up a bypass token in Vercel project settings
   - Can be used for automated testing or CI/CD pipelines
   - Token is available as `VERCEL_AUTOMATION_BYPASS_SECRET` in all environments
   - Example usage with query parameter:
     ```
     GET /manifest.json?x-vercel-protection-bypass=FprJbxxrfBtasFrrF8zgDb3axO66OPIt
     ```
   - Or with HTTP header:
     ```
     x-vercel-protection-bypass: FprJbxxrfBtasFrrF8zgDb3axO66OPIt
     ```

3. **Deployment Protection Exceptions** (Enterprise/Pro+):
   - Whitelist specific preview domains
   - Disable all protection features for designated URLs

### Handling Authentication and Static Assets

Vercel's authentication system can interfere with static file access. To prevent 401 errors:

1. **Option 1**: Disable authentication for preview environments

   - Go to Vercel Dashboard → Project → Settings → Authentication
   - Under "Authentication Protection", uncheck "Preview" environments

2. **Option 2**: Configure authentication to bypass static assets using OPTIONS Allowlist

3. **Option 3**: Use custom headers to ensure authenticated access works correctly

The current configuration in `vercel.json` uses a combination of these approaches.
