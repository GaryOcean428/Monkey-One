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

# Pinecone Configuration
VITE_PINECONE_API_KEY=your_pinecone_api_key
VITE_PINECONE_ENVIRONMENT=your_pinecone_environment
VITE_PINECONE_INDEX_NAME=your_pinecone_index_name
```

### 2. Vercel Project Setup

1. Create a new project in Vercel
2. Link your GitHub repository
3. Configure environment variables in Vercel dashboard
4. Set up build settings:
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

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
