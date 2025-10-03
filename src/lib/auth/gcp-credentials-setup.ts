import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

/**
 * Setup GCP credentials using Vercel OIDC token
 * This function exports the VERCEL_OIDC_TOKEN to a file that GCP client libraries can read
 */
export function setupVercelOIDCForGCP(): boolean {
  // Only run in Node.js environment
  if (typeof process === 'undefined') {
    console.warn('setupVercelOIDCForGCP: Not in Node.js environment')
    return false
  }

  const oidcToken = process.env.VERCEL_OIDC_TOKEN

  if (!oidcToken) {
    console.warn('VERCEL_OIDC_TOKEN not available - GCP authentication will not work')
    return false
  }

  try {
    // Token file path as specified in the credential configuration
    const tokenPath = '/tmp/vercel-oidc-token.txt'

    // Ensure the directory exists
    const tokenDir = dirname(tokenPath)
    if (!existsSync(tokenDir)) {
      mkdirSync(tokenDir, { recursive: true, mode: 0o755 })
    }

    // Write the OIDC token to the file
    writeFileSync(tokenPath, oidcToken, {
      encoding: 'utf-8',
      mode: 0o600, // Read/write for owner only
    })

    // Set the Google Application Credentials environment variable
    // Point to the credential configuration file
    const credentialsPath = process.cwd() + '/tmp/clientLibraryConfig-vercel.json'
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath

    console.log('✓ GCP credentials configured successfully')
    console.log(`  Token file: ${tokenPath}`)
    console.log(`  Credentials: ${credentialsPath}`)

    return true
  } catch (error) {
    console.error('Failed to setup GCP credentials:', error)
    return false
  }
}

/**
 * Verify GCP credentials are properly configured
 */
export function verifyGCPCredentials(): {
  configured: boolean
  tokenAvailable: boolean
  credentialsPath: string | null
  message: string
} {
  const tokenAvailable = !!process.env.VERCEL_OIDC_TOKEN
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || null
  const configured = tokenAvailable && !!credentialsPath

  let message = ''
  if (!tokenAvailable) {
    message = 'VERCEL_OIDC_TOKEN not available'
  } else if (!credentialsPath) {
    message = 'GOOGLE_APPLICATION_CREDENTIALS not set'
  } else if (!existsSync(credentialsPath)) {
    message = `Credentials file not found: ${credentialsPath}`
  } else {
    message = 'GCP credentials properly configured'
  }

  return {
    configured,
    tokenAvailable,
    credentialsPath,
    message,
  }
}

/**
 * Initialize GCP credentials on application startup
 * Call this function early in your application lifecycle
 */
export function initializeGCPCredentials(): void {
  // Only run in server-side or Node.js environment
  if (typeof window !== 'undefined') {
    return // Skip in browser
  }

  const success = setupVercelOIDCForGCP()

  if (success) {
    const verification = verifyGCPCredentials()
    console.log('GCP Credentials Status:', verification.message)
  }
}

// Auto-initialize if this module is imported and VERCEL_OIDC_TOKEN is available
if (typeof process !== 'undefined' && process.env.VERCEL_OIDC_TOKEN) {
  initializeGCPCredentials()
}
