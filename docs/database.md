# Database Documentation

## Overview

The database layer is built on Supabase, providing a powerful PostgreSQL database with real-time capabilities and built-in authentication. The system uses Supabase's client SDK for database operations and real-time subscriptions.

## Database Configuration

### Supabase Client Setup

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Database Models

### Profile Model

```typescript
interface Profile {
  id: uuid;
  user_id: uuid;
  username: string;
  avatar_url?: string;
  created_at: timestamp;
  updated_at: timestamp;
}

// Migration
create table profiles (
  id uuid references auth.users primary key,
  user_id uuid references auth.users not null,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = user_id );
```

### Experience Model

```typescript
interface Experience {
  id: uuid;
  user_id: uuid;
  content: string;
  metadata: jsonb;
  created_at: timestamp;
  updated_at: timestamp;
}

// Migration
create table experiences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table experiences enable row level security;

-- Policies
create policy "Users can view own experiences"
  on experiences for select
  using ( auth.uid() = user_id );

create policy "Users can insert own experiences"
  on experiences for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own experiences"
  on experiences for update
  using ( auth.uid() = user_id );
```

## Database Operations

### Using Supabase Client

```typescript
// Select data
const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single()

// Insert data
const { data, error } = await supabase
  .from('profiles')
  .insert([{ user_id: userId, username: 'johndoe' }])
  .select()

// Update data
const { data, error } = await supabase
  .from('profiles')
  .update({ username: 'janedoe' })
  .eq('id', profileId)
  .select()

// Delete data
const { error } = await supabase.from('profiles').delete().eq('id', profileId)
```

### Real-time Subscriptions

```typescript
// Subscribe to changes
const subscription = supabase
  .channel('custom-channel-name')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
    console.log('Change received!', payload)
  })
  .subscribe()

// Cleanup subscription
subscription.unsubscribe()
```

## Best Practices

1. **Row Level Security (RLS)**

   - Always enable RLS on tables
   - Create appropriate policies
   - Test policies thoroughly
   - Use auth.uid() for user-specific policies

2. **Error Handling**

   ```typescript
   const { data, error } = await supabase.from('profiles').select('*')
   if (error) {
     console.error('Error fetching profiles:', error.message)
     throw error
   }
   ```

3. **Type Safety**

   ```typescript
   import { Database } from './types/supabase'
   const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
   ```

4. **Performance**

   - Use selective columns in select()
   - Implement pagination
   - Create appropriate indexes
   - Use count() with care

5. **Real-time**
   - Subscribe only when necessary
   - Clean up subscriptions
   - Handle reconnection
   - Filter subscriptions appropriately

## Migrations

### Creating Migrations

```bash
# Generate new migration
supabase migration new my_migration_name

# Apply migrations
supabase migration up
```

### Migration Best Practices

1. Make migrations reversible when possible
2. Test migrations on development first
3. Back up production before migrating
4. Use transactions for complex migrations

## Monitoring

### Supabase Dashboard

- Monitor database performance
- Track API usage
- Review error logs
- Monitor auth statistics

### Custom Monitoring

```typescript
const startTime = performance.now()
const { data, error } = await supabase.from('profiles').select('*')
const duration = performance.now() - startTime

// Log performance metrics
console.log(`Query took ${duration}ms`)
```

## Security

1. **Environment Variables**

   - Never commit API keys
   - Use different keys per environment
   - Rotate keys periodically

2. **Access Control**

   - Implement RLS policies
   - Use appropriate auth roles
   - Validate user permissions

3. **Data Validation**
   - Validate inputs server-side
   - Use PostgreSQL constraints
   - Implement appropriate triggers

## Backup and Recovery

1. **Automated Backups**

   - Enable point-in-time recovery
   - Configure backup schedule
   - Test recovery process

2. **Manual Backups**

   ```sql
   -- Backup specific table
   copy profiles to '/tmp/profiles_backup.csv' csv header;

   -- Restore from backup
   copy profiles from '/tmp/profiles_backup.csv' csv header;
   ```
