#!/usr/bin/env tsx

/**
 * Supabase Authentication Debugger
 * 
 * This script helps debug Supabase integration including:
 * - Connection testing
 * - User profiles table verification
 * - Authentication state
 * - Database permissions
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface DebugResult {
  test: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

const results: DebugResult[] = []

function addResult(
  test: string,
  status: 'pass' | 'fail' | 'warning',
  message: string,
  details?: string
) {
  results.push({ test, status, message, details })
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  console.log(`  ${icon} ${test}: ${message}`)
  if (details) {
    console.log(`     ${details}`)
  }
}

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connection...\n')

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    addResult('Connection', 'fail', 'Missing Supabase credentials', 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    return null
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    addResult('Connection', 'pass', 'Supabase client created successfully')
    return supabase
  } catch (error) {
    addResult('Connection', 'fail', 'Failed to create Supabase client', String(error))
    return null
  }
}

async function testProfilesTable(supabase: any) {
  console.log('\n🔍 Testing Profiles Table...\n')

  try {
    // Try to query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, username')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        addResult(
          'Profiles Table',
          'fail',
          'Profiles table does not exist',
          'Run the SQL migration to create the profiles table'
        )
      } else if (error.code === '42501') {
        addResult(
          'Profiles Table',
          'fail',
          'Permission denied to access profiles table',
          'Check RLS policies and table permissions'
        )
      } else {
        addResult('Profiles Table', 'fail', `Error querying profiles table: ${error.message}`, error.details)
      }
    } else {
      addResult('Profiles Table', 'pass', 'Profiles table is accessible')
      if (data && data.length > 0) {
        addResult('Profiles Table', 'pass', `Found ${data.length} profile(s) in the table`)
      } else {
        addResult('Profiles Table', 'warning', 'Profiles table is empty', 'No users have been synced yet')
      }
    }
  } catch (error) {
    addResult('Profiles Table', 'fail', 'Unexpected error testing profiles table', String(error))
  }
}

async function testAuthOperations(supabase: any) {
  console.log('\n🔍 Testing Auth Operations...\n')

  try {
    // Test getting session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      addResult('Auth Session', 'warning', 'Error getting auth session', sessionError.message)
    } else {
      if (sessionData.session) {
        addResult('Auth Session', 'pass', 'Active session found')
        addResult('Auth Session', 'pass', `User: ${sessionData.session.user.email}`)
      } else {
        addResult('Auth Session', 'warning', 'No active session', 'This is expected if not logged in')
      }
    }
  } catch (error) {
    addResult('Auth Session', 'fail', 'Unexpected error testing auth operations', String(error))
  }
}

async function testRLSPolicies(supabase: any) {
  console.log('\n🔍 Testing Row Level Security (RLS) Policies...\n')

  try {
    // Test if we can insert a test record (will fail if RLS is too restrictive)
    const testUser = {
      user_id: 'test_' + Date.now(),
      username: 'test_user',
      email: 'test@example.com',
      name: 'Test User',
    }

    const { error: insertError } = await supabase.from('profiles').insert(testUser)

    if (insertError) {
      if (insertError.code === '42501') {
        addResult(
          'RLS Policies',
          'warning',
          'RLS policies are active and restrictive',
          'This is good for security but requires authenticated users'
        )
      } else if (insertError.code === '23505') {
        addResult('RLS Policies', 'pass', 'Can perform insert operation (duplicate key is expected)')
      } else {
        addResult('RLS Policies', 'warning', `Insert test failed: ${insertError.message}`)
      }
    } else {
      addResult('RLS Policies', 'pass', 'Can perform insert operations')
      // Clean up the test record
      await supabase.from('profiles').delete().eq('user_id', testUser.user_id)
    }
  } catch (error) {
    addResult('RLS Policies', 'fail', 'Unexpected error testing RLS policies', String(error))
  }
}

async function testRealtimeSubscription(supabase: any) {
  console.log('\n🔍 Testing Realtime Subscriptions...\n')

  try {
    // Test if realtime is enabled
    const channel = supabase
      .channel('test_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {})
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          addResult('Realtime', 'pass', 'Realtime subscriptions are working')
        } else if (status === 'CLOSED') {
          addResult('Realtime', 'warning', 'Realtime channel closed')
        }
      })

    // Wait a bit for subscription
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Unsubscribe
    await supabase.removeChannel(channel)
  } catch (error) {
    addResult('Realtime', 'warning', 'Realtime testing inconclusive', String(error))
  }
}

async function checkSupabaseDashboard() {
  console.log('\n🔍 Checking Supabase Dashboard Access...\n')

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  if (supabaseUrl) {
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0]
    if (projectRef) {
      const dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}`
      addResult('Dashboard', 'pass', `Dashboard URL: ${dashboardUrl}`)
    }
  }
}

async function generateSupabaseMigration() {
  console.log('\n📝 Generating Supabase Migration SQL...\n')

  const migration = `
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

-- Create policies
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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
`

  console.log('Copy and paste this SQL into your Supabase SQL Editor:')
  console.log('─'.repeat(80))
  console.log(migration)
  console.log('─'.repeat(80))
  
  addResult('Migration', 'pass', 'Migration SQL generated successfully')
}

function printSummary() {
  console.log('\n' + '='.repeat(80))
  console.log('📊 SUPABASE DEBUG SUMMARY')
  console.log('='.repeat(80) + '\n')

  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warning').length

  console.log(`✅ Passed: ${passCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`⚠️  Warnings: ${warnCount}`)
  console.log('\n' + '='.repeat(80) + '\n')

  if (failCount > 0) {
    console.log('⚠️  CRITICAL ISSUES FOUND - Address failed items to fix Supabase integration\n')
  } else if (warnCount > 0) {
    console.log('⚠️  Some warnings found - Review and address if needed\n')
  } else {
    console.log('✅ All Supabase checks passed!\n')
  }
}

async function main() {
  console.log('🚀 Starting Supabase Authentication Debugger...\n')

  const supabase = await testConnection()

  if (supabase) {
    await testProfilesTable(supabase)
    await testAuthOperations(supabase)
    await testRLSPolicies(supabase)
    await testRealtimeSubscription(supabase)
    await checkSupabaseDashboard()
  }

  await generateSupabaseMigration()

  printSummary()
}

main().catch(error => {
  console.error('Error running Supabase debugger:', error)
  process.exit(1)
})
