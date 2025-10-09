#!/usr/bin/env tsx

/**
 * Vercel Deployment & OIDC Debugger
 * 
 * This script helps debug Vercel deployment and OIDC integration including:
 * - Vercel CLI authentication
 * - Project deployment status
 * - Environment variables on Vercel
 * - OIDC configuration
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as dotenv from 'dotenv'

const execAsync = promisify(exec)

dotenv.config()

interface DebugResult {
  test: string
  status: 'pass' | 'fail' | 'warning' | 'info'
  message: string
  details?: string
}

const results: DebugResult[] = []

function addResult(
  test: string,
  status: 'pass' | 'fail' | 'warning' | 'info',
  message: string,
  details?: string
) {
  results.push({ test, status, message, details })
  const icons = { pass: '✅', fail: '❌', warning: '⚠️', info: 'ℹ️' }
  console.log(`  ${icons[status]} ${test}: ${message}`)
  if (details) {
    console.log(`     ${details}`)
  }
}

async function checkVercelCLI() {
  console.log('\n🔍 Checking Vercel CLI...\n')

  try {
    const { stdout } = await execAsync('npx vercel --version')
    const version = stdout.trim()
    addResult('CLI', 'pass', `Vercel CLI version ${version} installed`)
  } catch (error) {
    addResult('CLI', 'fail', 'Vercel CLI not available', String(error))
    return false
  }

  return true
}

async function checkVercelAuth() {
  console.log('\n🔍 Checking Vercel Authentication...\n')

  try {
    const { stdout, stderr } = await execAsync('npx vercel whoami 2>&1')
    if (stdout.includes('Error') || stderr.includes('Error') || stdout.includes('not authenticated')) {
      addResult('Auth', 'fail', 'Not authenticated with Vercel', 'Run: npx vercel login')
      return false
    } else {
      const username = stdout.trim().split('\n').pop()
      addResult('Auth', 'pass', `Authenticated as: ${username}`)
      return true
    }
  } catch (error) {
    addResult('Auth', 'fail', 'Failed to check Vercel authentication', String(error))
    return false
  }
}

async function listProjects() {
  console.log('\n🔍 Listing Vercel Projects...\n')

  try {
    const { stdout } = await execAsync('npx vercel list 2>&1')
    
    if (stdout.includes('Error') || stdout.includes('not authenticated')) {
      addResult('Projects', 'warning', 'Cannot list projects - authentication required')
      return
    }

    // Parse project names from output
    const lines = stdout.split('\n')
    const projectLines = lines.filter(line => line.includes('monkey-one') || line.includes('agent-one'))
    
    if (projectLines.length > 0) {
      addResult('Projects', 'pass', `Found ${projectLines.length} related project(s)`)
      projectLines.forEach(line => {
        addResult('Projects', 'info', line.trim())
      })
    } else {
      addResult('Projects', 'warning', 'No related projects found', 'Project may need to be linked or created')
    }
  } catch (error) {
    addResult('Projects', 'warning', 'Could not list projects', String(error))
  }
}

async function checkDeploymentStatus() {
  console.log('\n🔍 Checking Recent Deployments...\n')

  try {
    const { stdout } = await execAsync('npx vercel ls --prod 2>&1')
    
    if (stdout.includes('Error') || stdout.includes('not authenticated')) {
      addResult('Deployments', 'warning', 'Cannot check deployments - authentication required')
      return
    }

    // Try to get the most recent production deployment
    const lines = stdout.split('\n').filter(line => line.includes('https://'))
    if (lines.length > 0) {
      addResult('Deployments', 'pass', `Found ${lines.length} production deployment(s)`)
      const latestUrl = lines[0].match(/https:\/\/[^\s]+/)?.[0]
      if (latestUrl) {
        addResult('Deployments', 'info', `Latest deployment: ${latestUrl}`)
      }
    } else {
      addResult('Deployments', 'info', 'No production deployments found')
    }
  } catch (error) {
    addResult('Deployments', 'warning', 'Could not check deployment status', String(error))
  }
}

async function checkEnvironmentVariables() {
  console.log('\n🔍 Checking Vercel Environment Variables...\n')

  const requiredEnvVars = [
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_GOOGLE_CLIENT_SECRET',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_PUBLIC_URL',
  ]

  try {
    const { stdout } = await execAsync('npx vercel env ls 2>&1')
    
    if (stdout.includes('Error') || stdout.includes('not authenticated')) {
      addResult('Env Variables', 'warning', 'Cannot check environment variables - authentication required')
      return
    }

    // Check which variables are set
    for (const varName of requiredEnvVars) {
      if (stdout.includes(varName)) {
        addResult('Env Variables', 'pass', `${varName} is set on Vercel`)
      } else {
        addResult('Env Variables', 'warning', `${varName} not found on Vercel`, 
          `Add it using: npx vercel env add ${varName}`)
      }
    }
  } catch (error) {
    addResult('Env Variables', 'warning', 'Could not check environment variables', String(error))
  }
}

async function checkOIDCConfiguration() {
  console.log('\n🔍 Checking OIDC Configuration...\n')

  // Check local OIDC token (only available in Vercel environment)
  if (process.env.VERCEL_OIDC_TOKEN) {
    addResult('OIDC', 'pass', 'OIDC token is available in current environment')
    
    // Try to parse the token
    try {
      const parts = process.env.VERCEL_OIDC_TOKEN.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        addResult('OIDC', 'pass', `OIDC token issuer: ${payload.iss}`)
        
        const expiresAt = new Date(payload.exp * 1000)
        const now = new Date()
        if (expiresAt > now) {
          addResult('OIDC', 'pass', `OIDC token expires: ${expiresAt.toISOString()}`)
        } else {
          addResult('OIDC', 'warning', 'OIDC token is expired')
        }
      }
    } catch (error) {
      addResult('OIDC', 'warning', 'Could not parse OIDC token', String(error))
    }
  } else if (process.env.VERCEL) {
    addResult('OIDC', 'warning', 'OIDC token not available in Vercel environment',
      'Check Vercel project settings for OIDC configuration')
  } else {
    addResult('OIDC', 'info', 'OIDC token not available in local environment (expected)')
  }

  // Check vercel.json for OIDC configuration
  const fs = require('fs')
  const path = require('path')
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json')
  
  if (fs.existsSync(vercelJsonPath)) {
    try {
      const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'))
      if (vercelJson.oidc) {
        addResult('OIDC Config', 'pass', `OIDC configured in vercel.json: issuerMode=${vercelJson.oidc.issuerMode}`)
      } else {
        addResult('OIDC Config', 'warning', 'No OIDC configuration found in vercel.json',
          'Add OIDC configuration to enable token-based authentication')
      }
    } catch (error) {
      addResult('OIDC Config', 'warning', 'Could not parse vercel.json', String(error))
    }
  } else {
    addResult('OIDC Config', 'fail', 'vercel.json not found')
  }
}

async function suggestOIDCSetup() {
  console.log('\n📝 OIDC Setup Instructions...\n')
  
  console.log('To enable OIDC on Vercel:')
  console.log('1. Update vercel.json to include:')
  console.log('   {')
  console.log('     "oidc": {')
  console.log('       "issuerMode": "team"')
  console.log('     }')
  console.log('   }')
  console.log('')
  console.log('2. Deploy to Vercel:')
  console.log('   npx vercel --prod')
  console.log('')
  console.log('3. OIDC token will be automatically available in production as VERCEL_OIDC_TOKEN')
  console.log('')
  
  addResult('Setup', 'info', 'OIDC setup instructions provided above')
}

async function testProductionEndpoint() {
  console.log('\n🔍 Testing Production Endpoint...\n')

  const publicUrl = process.env.VITE_PUBLIC_URL || 'https://monkey-one.dev'
  
  try {
    const response = await fetch(`${publicUrl}/auth/callback`, {
      method: 'HEAD',
    })
    
    if (response.ok || response.status === 404 || response.status === 405) {
      addResult('Production', 'pass', `Production endpoint is reachable: ${publicUrl}`)
    } else {
      addResult('Production', 'warning', `Production endpoint returned status ${response.status}`)
    }
  } catch (error) {
    addResult('Production', 'warning', 'Could not reach production endpoint', String(error))
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(80))
  console.log('📊 VERCEL DEBUG SUMMARY')
  console.log('='.repeat(80) + '\n')

  const passCount = results.filter(r => r.status === 'pass').length
  const failCount = results.filter(r => r.status === 'fail').length
  const warnCount = results.filter(r => r.status === 'warning').length
  const infoCount = results.filter(r => r.status === 'info').length

  console.log(`✅ Passed: ${passCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`⚠️  Warnings: ${warnCount}`)
  console.log(`ℹ️  Info: ${infoCount}`)
  console.log('\n' + '='.repeat(80) + '\n')

  if (failCount > 0) {
    console.log('⚠️  CRITICAL ISSUES FOUND - Address failed items to enable Vercel integration\n')
    console.log('Quick fixes:')
    console.log('  - Run: npx vercel login')
    console.log('  - Run: npx vercel link')
    console.log('  - Run: npx vercel env pull .env.vercel.production\n')
  } else if (warnCount > 0) {
    console.log('⚠️  Some warnings found - Review and address if needed\n')
  } else {
    console.log('✅ All Vercel checks passed!\n')
  }
}

async function main() {
  console.log('🚀 Starting Vercel Deployment & OIDC Debugger...\n')

  const cliAvailable = await checkVercelCLI()
  if (!cliAvailable) {
    console.log('\n❌ Vercel CLI is not available. Install it with: npm install -g vercel\n')
    return
  }

  const isAuthenticated = await checkVercelAuth()
  
  if (isAuthenticated) {
    await listProjects()
    await checkDeploymentStatus()
    await checkEnvironmentVariables()
  } else {
    console.log('\n⚠️  To use Vercel features, authenticate with: npx vercel login\n')
  }

  await checkOIDCConfiguration()
  await testProductionEndpoint()
  await suggestOIDCSetup()

  printSummary()
}

main().catch(error => {
  console.error('Error running Vercel debugger:', error)
  process.exit(1)
})
