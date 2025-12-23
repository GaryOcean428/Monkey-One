# Database Configuration Guide

## Overview

Monkey-One uses **Supabase** (PostgreSQL) as its primary database solution. This guide ensures your database is correctly configured and compatible with the application.

## Environment Variables

### Required Variables

The following environment variables **must** be configured:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Variables

Additional database configuration (optional but recommended for advanced use):

```env
# PostgreSQL Direct Connection (Optional)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NO_SSL=your_postgres_url_no_ssl
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling

# PostgreSQL Connection Details (Optional)
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
```

## Database Schema

The application uses the following core tables:

### Tables

1. **users** - User accounts and profiles
   - `id` (UUID, PK)
   - `email` (VARCHAR, UNIQUE)
   - `name` (VARCHAR)
   - `role` (VARCHAR)
   - `settings` (JSONB)
   - `created_at`, `updated_at` (TIMESTAMP)

2. **agents** - AI agent instances
   - `id` (UUID, PK)
   - `name` (VARCHAR)
   - `type` (VARCHAR)
   - `status` (VARCHAR)
   - `capabilities` (TEXT[])
   - `metadata` (JSONB)
   - `created_at`, `updated_at` (TIMESTAMP)

3. **memories** - Agent memory storage
   - `id` (UUID, PK)
   - `type` (VARCHAR)
   - `content` (TEXT)
   - `tags` (TEXT[])
   - `metadata` (JSONB)
   - `user_id` (UUID, FK → users)
   - `created_at`, `updated_at` (TIMESTAMP)

4. **workflows** - Workflow definitions
   - `id` (UUID, PK)
   - `name` (VARCHAR)
   - `description` (TEXT)
   - `status` (VARCHAR)
   - `steps` (JSONB)
   - `metadata` (JSONB)
   - `user_id` (UUID, FK → users)
   - `created_at`, `updated_at` (TIMESTAMP)

### Indexes

- `idx_memories_user_id` - Fast user memory lookups
- `idx_memories_type` - Fast type-based queries
- `idx_workflows_user_id` - Fast user workflow lookups
- `idx_workflows_status` - Fast status filtering

### Triggers

All tables have automatic `updated_at` triggers that update the timestamp on every record modification.

## Setup Instructions

### 1. Supabase Project Setup

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing one
3. Navigate to **Settings** → **API**
4. Copy your:
   - Project URL (for `VITE_SUPABASE_URL`)
   - Anon/Public key (for `VITE_SUPABASE_ANON_KEY`)

### 2. Database Migration

Run the initial schema migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL editor in Supabase Dashboard
# Copy contents of src/lib/db/migrations/001_initial_schema.sql
# and execute in Supabase SQL Editor
```

### 3. Validate Configuration

Run the validation script to ensure everything is set up correctly:

```bash
# Install dependencies if not already done
pnpm install

# Run database validation
node scripts/validate-db.mjs
```

Expected output:
```
🔍 Database Configuration Validation

📋 Checking required environment variables...
  ✅ VITE_SUPABASE_URL: Configured
  ✅ VITE_SUPABASE_ANON_KEY: Configured

🔌 Testing database connection...
  ✅ Database connection successful

📊 Checking database schema...
  ✅ Table 'users': Exists
  ✅ Table 'agents': Exists
  ✅ Table 'memories': Exists
  ✅ Table 'workflows': Exists

✅ Database validation complete!
```

## Troubleshooting

### Connection Issues

**Problem**: "Database connection failed"

**Solutions**:
1. Verify `VITE_SUPABASE_URL` is correct
2. Check `VITE_SUPABASE_ANON_KEY` is valid
3. Ensure Supabase project is active (not paused)
4. Check network/firewall settings

### Missing Tables

**Problem**: "Table does not exist"

**Solutions**:
1. Run the migration script (see Setup Instructions #2)
2. Verify SQL execution in Supabase Dashboard
3. Check for any SQL errors in Supabase logs

### Permission Errors

**Problem**: "Permission denied"

**Solutions**:
1. Verify you're using the correct API key
2. Check Row Level Security (RLS) policies in Supabase
3. For admin operations, use service role key (not anon key)

## Connection Management

### Singleton Pattern

The application uses a singleton pattern for the Supabase client:

```typescript
import { supabase } from '@/lib/supabase/client'

// Use the client
const { data, error } = await supabase
  .from('agents')
  .select('*')
```

### Redis Caching

Database queries are cached using Redis when available:

```typescript
import { userQueries } from '@/lib/db/queries'

// Automatically cached for 1 hour
const user = await userQueries.getById(userId)
```

## Schema Compatibility

### Current Schema Version
- **Version**: 1.0 (Initial Schema)
- **Migration File**: `src/lib/db/migrations/001_initial_schema.sql`
- **Compatibility**: ✅ Fully compatible with all current implementations

### Stateless & Pure

The database operations follow these principles:
- ✅ **Stateless queries**: No session state required
- ✅ **Pure functions**: Deterministic, no side effects in query logic
- ✅ **Clear separation**: Queries separated from business logic
- ✅ **Cached appropriately**: Read-heavy queries use Redis cache

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured in hosting platform
- [ ] Database migration executed successfully
- [ ] Row Level Security (RLS) policies configured
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured
- [ ] Connection pooling configured (if using direct PostgreSQL)
- [ ] Rate limiting configured on Supabase project

## Support

For database-related issues:
1. Check Supabase Dashboard logs
2. Review `docs/troubleshooting/` guides
3. Run validation script for diagnostics
4. Check Supabase status page

---

**Last Updated**: 2025-12-23  
**Schema Version**: 1.0  
**Compatibility**: ✅ Production Ready
