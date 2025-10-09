#!/usr/bin/env tsx

/**
 * Environment Variables Validator
 * 
 * Validates all required environment variables for authentication flow
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

interface EnvVar {
  name: string
  required: boolean
  description: string
  validator?: (value: string) => boolean | string
  suggestion?: string
}

const envVars: EnvVar[] = [
  {
    name: 'VITE_GOOGLE_CLIENT_ID',
    required: true,
    description: 'Google OAuth Client ID',
    validator: (value) => 
      value.endsWith('.apps.googleusercontent.com') || 'Should end with .apps.googleusercontent.com',
    suggestion: 'Get from: https://console.cloud.google.com/apis/credentials',
  },
  {
    name: 'VITE_GOOGLE_CLIENT_SECRET',
    required: false,
    description: 'Google OAuth Client Secret (for server-side token exchange)',
    validator: (value) => value.startsWith('GOCSPX-') || 'Should start with GOCSPX-',
    suggestion: 'Get from: https://console.cloud.google.com/apis/credentials',
  },
  {
    name: 'VITE_SUPABASE_URL',
    required: true,
    description: 'Supabase Project URL',
    validator: (value) => 
      value.includes('supabase.co') || 'Should be a valid Supabase URL',
    suggestion: 'Get from: https://supabase.com/dashboard',
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase Anonymous Key',
    validator: (value) => value.startsWith('eyJ') || 'Should be a valid JWT token starting with eyJ',
    suggestion: 'Get from: https://supabase.com/dashboard',
  },
  {
    name: 'VITE_PUBLIC_URL',
    required: true,
    description: 'Public URL of your application',
    validator: (value) => 
      (value.startsWith('http://') || value.startsWith('https://')) || 'Should be a valid URL',
  },
  {
    name: 'VITE_AUTH_ENABLED',
    required: false,
    description: 'Enable authentication system',
    validator: (value) => ['true', 'false'].includes(value.toLowerCase()) || 'Should be true or false',
  },
  {
    name: 'VITE_OIDC_ENABLED',
    required: false,
    description: 'Enable OIDC integration',
    validator: (value) => ['true', 'false'].includes(value.toLowerCase()) || 'Should be true or false',
  },
  {
    name: 'GCP_PROJECT_ID',
    required: false,
    description: 'Google Cloud Project ID (for GCP Workload Identity)',
    suggestion: 'Only required if using GCP services',
  },
  {
    name: 'GCP_PROJECT_NUMBER',
    required: false,
    description: 'Google Cloud Project Number',
    suggestion: 'Only required if using GCP services',
  },
  {
    name: 'GCP_SERVICE_ACCOUNT_EMAIL',
    required: false,
    description: 'GCP Service Account Email',
    validator: (value) => 
      value.includes('@') && value.includes('.iam.gserviceaccount.com') || 
      'Should be a valid service account email',
    suggestion: 'Only required if using GCP services',
  },
]

function validateEnvVar(envVar: EnvVar): {
  status: 'pass' | 'fail' | 'warning' | 'missing'
  message: string
} {
  const value = process.env[envVar.name]

  // Check if variable exists
  if (!value) {
    return {
      status: envVar.required ? 'fail' : 'missing',
      message: envVar.required 
        ? `REQUIRED but not set` 
        : `Optional but not set`,
    }
  }

  // Check for placeholder values
  if (value.includes('your_') || value.includes('example')) {
    return {
      status: envVar.required ? 'fail' : 'warning',
      message: 'Contains placeholder value',
    }
  }

  // Run custom validator if provided
  if (envVar.validator) {
    const validationResult = envVar.validator(value)
    if (validationResult !== true) {
      return {
        status: envVar.required ? 'fail' : 'warning',
        message: typeof validationResult === 'string' ? validationResult : 'Validation failed',
      }
    }
  }

  return {
    status: 'pass',
    message: 'Valid',
  }
}

function maskValue(value: string): string {
  if (value.length <= 10) {
    return '*'.repeat(value.length)
  }
  return value.substring(0, 8) + '...' + value.substring(value.length - 4)
}

function printResults() {
  console.log('\n' + '='.repeat(80))
  console.log('🔒 ENVIRONMENT VARIABLES VALIDATION')
  console.log('='.repeat(80) + '\n')

  let passCount = 0
  let failCount = 0
  let warnCount = 0
  let missingCount = 0

  for (const envVar of envVars) {
    const result = validateEnvVar(envVar)
    const value = process.env[envVar.name]

    const icons = {
      pass: '✅',
      fail: '❌',
      warning: '⚠️',
      missing: '○',
    }

    console.log(`${icons[result.status]} ${envVar.name}`)
    console.log(`   ${envVar.description}`)
    console.log(`   Status: ${result.message}`)
    
    if (value && result.status === 'pass') {
      console.log(`   Value: ${maskValue(value)}`)
    }

    if (result.status !== 'pass' && envVar.suggestion) {
      console.log(`   💡 ${envVar.suggestion}`)
    }

    console.log('')

    switch (result.status) {
      case 'pass':
        passCount++
        break
      case 'fail':
        failCount++
        break
      case 'warning':
        warnCount++
        break
      case 'missing':
        missingCount++
        break
    }
  }

  console.log('='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(`✅ Valid: ${passCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`⚠️  Warnings: ${warnCount}`)
  console.log(`○  Missing (Optional): ${missingCount}`)
  console.log('='.repeat(80) + '\n')

  if (failCount > 0) {
    console.log('❌ CRITICAL: Some required variables are missing or invalid\n')
    console.log('To fix:')
    console.log('1. Copy .env.example to .env')
    console.log('2. Fill in the required values')
    console.log('3. Run this script again to validate\n')
    process.exit(1)
  } else if (warnCount > 0) {
    console.log('⚠️  Some optional variables have issues. Review and update if needed.\n')
  } else {
    console.log('✅ All required environment variables are properly configured!\n')
  }
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env')
  const examplePath = path.join(process.cwd(), '.env.example')

  console.log('\n📁 Checking environment files...\n')

  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists')
  } else {
    console.log('❌ .env file not found')
    
    if (fs.existsSync(examplePath)) {
      console.log('💡 .env.example found - copy it to .env and fill in the values')
      console.log('   Command: cp .env.example .env')
    }
    console.log('')
  }

  if (fs.existsSync(examplePath)) {
    console.log('✅ .env.example file exists')
  }
  console.log('')
}

function generateEnvTemplate() {
  console.log('\n📝 Environment Template\n')
  console.log('Copy this template to your .env file:')
  console.log('─'.repeat(80))
  
  for (const envVar of envVars) {
    if (envVar.required) {
      console.log(`# ${envVar.description} (REQUIRED)`)
    } else {
      console.log(`# ${envVar.description} (Optional)`)
    }
    
    if (envVar.suggestion) {
      console.log(`# ${envVar.suggestion}`)
    }
    
    console.log(`${envVar.name}=`)
    console.log('')
  }
  
  console.log('─'.repeat(80) + '\n')
}

function main() {
  console.log('🚀 Starting Environment Variables Validation...\n')
  
  checkEnvFile()
  printResults()
  
  const args = process.argv.slice(2)
  if (args.includes('--template')) {
    generateEnvTemplate()
  }
}

main()
