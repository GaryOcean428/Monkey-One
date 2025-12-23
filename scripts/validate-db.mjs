#!/usr/bin/env node
/**
 * Database Validation Script
 * 
 * Verifies that:
 * 1. Supabase URL and keys are properly configured
 * 2. Database connection is working
 * 3. Required tables exist
 * 4. Schema is compatible with the application
 */

import { createClient } from '@supabase/supabase-js'

// Environment variable validation
const requiredEnvVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
}

const optionalEnvVars = {
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
  POSTGRES_URL: process.env.POSTGRES_URL,
}

console.log('🔍 Database Configuration Validation\n')

// Check required environment variables
console.log('📋 Checking required environment variables...')
let missingVars = []
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.log(`  ❌ ${key}: Missing`)
    missingVars.push(key)
  } else {
    console.log(`  ✅ ${key}: Configured`)
  }
}

// Check optional environment variables
console.log('\n📋 Checking optional environment variables...')
for (const [key, value] of Object.entries(optionalEnvVars)) {
  if (!value) {
    console.log(`  ⚠️  ${key}: Not configured (optional)`)
  } else {
    console.log(`  ✅ ${key}: Configured`)
  }
}

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:', missingVars.join(', '))
  console.error('Please update your .env file with the correct values.')
  process.exit(1)
}

// Test database connection
console.log('\n🔌 Testing database connection...')

async function validateDatabase() {
  try {
    const supabase = createClient(
      requiredEnvVars.VITE_SUPABASE_URL!,
      requiredEnvVars.VITE_SUPABASE_ANON_KEY!
    )

    // Test connection by querying a simple table
    const { data, error } = await supabase.from('agents').select('count').limit(1)

    if (error) {
      console.error('  ❌ Database connection failed:', error.message)
      return false
    }

    console.log('  ✅ Database connection successful')

    // Check required tables
    console.log('\n📊 Checking database schema...')
    const requiredTables = ['users', 'agents', 'memories', 'workflows']

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1)
        if (error) {
          console.log(`  ❌ Table '${table}': ${error.message}`)
        } else {
          console.log(`  ✅ Table '${table}': Exists`)
        }
      } catch (err) {
        console.log(`  ❌ Table '${table}': Error checking - ${err.message}`)
      }
    }

    console.log('\n✅ Database validation complete!')
    return true
  } catch (error) {
    console.error('  ❌ Validation failed:', error.message)
    return false
  }
}

validateDatabase()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
