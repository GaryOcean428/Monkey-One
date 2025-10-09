#!/usr/bin/env tsx

/**
 * Authentication Flow Debugger
 * 
 * This script helps debug the complete authentication flow including:
 * - Google OAuth configuration
 * - Supabase connection and user sync
 * - Vercel OIDC token availability
 * - Environment variables
 * - GCP Workload Identity setup
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)

interface DebugResult {
  category: string
  status: 'pass' | 'fail' | 'warning' | 'info'
  message: string
  details?: string
}

const results: DebugResult[] = []

function addResult(
  category: string,
  status: 'pass' | 'fail' | 'warning' | 'info',
  message: string,
  details?: string
) {
  results.push({ category, status, message, details })
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'pass':
      return '✅'
    case 'fail':
      return '❌'
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    default:
      return '○'
  }
}

async function checkEnvironmentVariables() {
  console.log('\n🔍 Checking Environment Variables...\n')

  const requiredEnvVars = [
    { name: 'VITE_GOOGLE_CLIENT_ID', critical: true },
    { name: 'VITE_GOOGLE_CLIENT_SECRET', critical: false },
    { name: 'VITE_SUPABASE_URL', critical: true },
    { name: 'VITE_SUPABASE_ANON_KEY', critical: true },
    { name: 'VITE_PUBLIC_URL', critical: true },
    { name: 'VITE_AUTH_ENABLED', critical: false },
    { name: 'VITE_OIDC_ENABLED', critical: false },
    { name: 'GCP_PROJECT_ID', critical: false },
    { name: 'GCP_SERVICE_ACCOUNT_EMAIL', critical: false },
  ]

  // Try to load .env file
  const envPath = path.join(process.cwd(), '.env')
  let envVars: Record<string, string> = {}

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        envVars[key] = value
      }
    })
    addResult('Environment', 'pass', '.env file found and loaded')
  } else {
    addResult('Environment', 'warning', '.env file not found', 'Using .env.example as reference')
  }

  for (const { name, critical } of requiredEnvVars) {
    const value = process.env[name] || envVars[name]
    if (!value || value.startsWith('your_') || value.includes('example')) {
      const status = critical ? 'fail' : 'warning'
      addResult(
        'Environment',
        status,
        `${name} is ${critical ? 'REQUIRED' : 'recommended'} but not configured`,
        `Set this variable in your .env file`
      )
    } else {
      const masked = value.substring(0, 10) + '...'
      addResult('Environment', 'pass', `${name} is configured`, masked)
    }
  }
}

async function checkGoogleOAuthConfig() {
  console.log('\n🔍 Checking Google OAuth Configuration...\n')

  const clientId = process.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    addResult(
      'Google OAuth',
      'fail',
      'VITE_GOOGLE_CLIENT_ID not configured',
      'Visit https://console.cloud.google.com/apis/credentials to create OAuth credentials'
    )
    return
  }

  if (clientId.includes('example') || clientId.startsWith('your_')) {
    addResult('Google OAuth', 'fail', 'VITE_GOOGLE_CLIENT_ID contains placeholder value')
    return
  }

  if (!clientId.endsWith('.apps.googleusercontent.com')) {
    addResult(
      'Google OAuth',
      'warning',
      'VITE_GOOGLE_CLIENT_ID may have incorrect format',
      'Should end with .apps.googleusercontent.com'
    )
  } else {
    addResult('Google OAuth', 'pass', 'Client ID format looks valid')
  }

  // Check redirect URIs
  const publicUrl = process.env.VITE_PUBLIC_URL || 'http://localhost:4000'
  addResult('Google OAuth', 'info', `Expected redirect URI: ${publicUrl}/auth/callback`)
}

async function checkSupabaseConnection() {
  console.log('\n🔍 Checking Supabase Configuration...\n')

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    addResult('Supabase', 'fail', 'Supabase credentials not configured')
    return
  }

  if (supabaseUrl.includes('example') || supabaseKey.includes('example')) {
    addResult('Supabase', 'fail', 'Supabase credentials contain placeholder values')
    return
  }

  // Check URL format
  if (!supabaseUrl.includes('supabase.co')) {
    addResult('Supabase', 'warning', 'Supabase URL format may be incorrect')
  } else {
    addResult('Supabase', 'pass', 'Supabase URL format looks valid')
  }

  // Try to ping Supabase (basic check)
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: supabaseKey,
      },
    })

    if (response.ok || response.status === 404) {
      addResult('Supabase', 'pass', 'Supabase endpoint is reachable')
    } else {
      addResult(
        'Supabase',
        'warning',
        `Supabase endpoint returned status ${response.status}`,
        'This might be expected depending on your configuration'
      )
    }
  } catch (error) {
    addResult('Supabase', 'fail', 'Cannot reach Supabase endpoint', String(error))
  }
}

async function checkVercelDeployment() {
  console.log('\n🔍 Checking Vercel Deployment Status...\n')

  try {
    // Check if we're running in Vercel environment
    const isVercel = !!process.env.VERCEL
    if (isVercel) {
      addResult('Vercel', 'info', 'Running in Vercel environment')
      addResult('Vercel', 'info', `Deployment: ${process.env.VERCEL_URL || 'unknown'}`)
    } else {
      addResult('Vercel', 'info', 'Running in local development environment')
    }

    // Check for OIDC token availability
    const oidcToken = process.env.VERCEL_OIDC_TOKEN
    if (oidcToken) {
      addResult('Vercel OIDC', 'pass', 'OIDC token is available')
    } else if (isVercel) {
      addResult('Vercel OIDC', 'warning', 'OIDC token not available in Vercel environment')
    } else {
      addResult('Vercel OIDC', 'info', 'OIDC token not available (expected in local development)')
    }

    // Try to get Vercel project info using CLI
    try {
      const { stdout } = await execAsync('npx vercel ls --scope=team_GaryOcean428 2>&1 || true')
      if (stdout.includes('Error') || stdout.includes('error')) {
        addResult('Vercel CLI', 'warning', 'Vercel CLI needs authentication', 'Run: npx vercel login')
      } else {
        addResult('Vercel CLI', 'pass', 'Vercel CLI is authenticated')
      }
    } catch (error) {
      addResult('Vercel CLI', 'info', 'Could not check Vercel CLI status')
    }
  } catch (error) {
    addResult('Vercel', 'warning', 'Could not fully check Vercel status', String(error))
  }
}

async function checkGCPConfiguration() {
  console.log('\n🔍 Checking GCP Workload Identity Configuration...\n')

  const gcpVars = [
    'GCP_PROJECT_ID',
    'GCP_PROJECT_NUMBER',
    'GCP_SERVICE_ACCOUNT_EMAIL',
    'GCP_WORKLOAD_IDENTITY_POOL_ID',
    'GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID',
  ]

  let allConfigured = true
  for (const varName of gcpVars) {
    const value = process.env[varName]
    if (!value || value.includes('your_')) {
      allConfigured = false
      addResult('GCP', 'warning', `${varName} not configured`, 'Required for GCP Workload Identity')
    }
  }

  if (allConfigured) {
    addResult('GCP', 'pass', 'All GCP Workload Identity variables are configured')
  } else {
    addResult('GCP', 'info', 'GCP Workload Identity is optional for basic auth flow')
  }
}

async function checkAuthFiles() {
  console.log('\n🔍 Checking Authentication Files...\n')

  const criticalFiles = [
    'src/lib/auth/google-auth.ts',
    'src/lib/auth/oidc.ts',
    'src/lib/auth/user-sync.ts',
    'src/lib/supabase/client.ts',
  ]

  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      addResult('Files', 'pass', `${file} exists`)
    } else {
      addResult('Files', 'fail', `${file} is missing`)
    }
  }
}

async function generateDebugReport() {
  console.log('\n📊 Generating Debug Report...\n')

  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    isVercel: !!process.env.VERCEL,
    results,
  }

  const reportPath = path.join(process.cwd(), 'auth-debug-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  addResult('Report', 'info', `Debug report saved to ${reportPath}`)
}

function printResults() {
  console.log('\n' + '='.repeat(80))
  console.log('🔐 AUTHENTICATION FLOW DEBUG RESULTS')
  console.log('='.repeat(80) + '\n')

  const categories = [...new Set(results.map(r => r.category))]

  for (const category of categories) {
    console.log(`\n${category}:`)
    console.log('-'.repeat(80))

    const categoryResults = results.filter(r => r.category === category)
    for (const result of categoryResults) {
      const icon = getStatusIcon(result.status)
      console.log(`  ${icon} ${result.message}`)
      if (result.details) {
        console.log(`     ${result.details}`)
      }
    }
  }

  // Summary
  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warning').length

  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(`✅ Passed: ${passCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`⚠️  Warnings: ${warnCount}`)
  console.log(`ℹ️  Info: ${results.length - passCount - failCount - warnCount}`)
  console.log('='.repeat(80) + '\n')

  if (failCount > 0) {
    console.log('⚠️  CRITICAL ISSUES FOUND - Please address failed items above\n')
    process.exit(1)
  } else if (warnCount > 0) {
    console.log('⚠️  Some warnings found - Review and address if needed\n')
  } else {
    console.log('✅ All checks passed! Authentication should work correctly.\n')
  }
}

async function main() {
  console.log('🚀 Starting Authentication Flow Debugger...\n')

  await checkEnvironmentVariables()
  await checkGoogleOAuthConfig()
  await checkSupabaseConnection()
  await checkVercelDeployment()
  await checkGCPConfiguration()
  await checkAuthFiles()
  await generateDebugReport()

  printResults()
}

main().catch(error => {
  console.error('Error running auth debugger:', error)
  process.exit(1)
})
