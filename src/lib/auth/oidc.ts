/**
 * Vercel OIDC Authentication Implementation
 *
 * This module provides OIDC token handling for secure backend access
 * without storing long-lived credentials.
 */

export interface OIDCToken {
  token: string
  expiresAt: number
  issuer: string
}

export interface OIDCConfig {
  issuerMode: 'team' | 'global'
  teamSlug?: string
}

/**
 * Get OIDC token from Vercel environment
 * Available in builds, functions, and local development
 */
export function getOIDCToken(): string | null {
  // In builds and local development
  if (typeof process !== 'undefined' && process.env?.VERCEL_OIDC_TOKEN) {
    return process.env.VERCEL_OIDC_TOKEN
  }

  // In Vercel Functions (browser/edge runtime)
  if (typeof globalThis !== 'undefined' && 'Request' in globalThis) {
    // This would be set by the function runtime
    const headers = (globalThis as Record<string, unknown>).__VERCEL_HEADERS__
    if (headers && typeof headers === 'object' && headers['x-vercel-oidc-token']) {
      return headers['x-vercel-oidc-token'] as string
    }
  }

  return null
}

/**
 * Parse and validate OIDC token
 */
export function parseOIDCToken(token: string): OIDCToken | null {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Invalid OIDC token format')
      return null
    }

    // Decode the payload (second part)
    let decodedPayload: string
    if (typeof globalThis !== 'undefined' && 'atob' in globalThis) {
      decodedPayload = globalThis.atob(parts[1])
    } else if (typeof process !== 'undefined' && process.versions?.node) {
      // Node.js environment
      decodedPayload = globalThis.Buffer.from(parts[1], 'base64').toString('utf-8')
    } else {
      // Fallback for environments without atob or Buffer
      throw new Error('No base64 decoding method available')
    }

    const payload = JSON.parse(decodedPayload)

    return {
      token,
      expiresAt: payload.exp * 1000, // Convert to milliseconds
      issuer: payload.iss,
    }
  } catch (error) {
    console.error('Failed to parse OIDC token:', error)
    return null
  }
}

/**
 * Check if OIDC token is valid and not expired
 */
export function isTokenValid(oidcToken: OIDCToken): boolean {
  const now = Date.now()
  const bufferTime = 5 * 60 * 1000 // 5 minutes buffer

  return oidcToken.expiresAt > now + bufferTime
}

/**
 * Get valid OIDC token or null if not available/expired
 */
export function getValidOIDCToken(): OIDCToken | null {
  const tokenString = getOIDCToken()
  if (!tokenString) {
    return null
  }

  const oidcToken = parseOIDCToken(tokenString)
  if (!oidcToken) {
    return null
  }

  if (!isTokenValid(oidcToken)) {
    console.warn('OIDC token is expired')
    return null
  }

  return oidcToken
}

/**
 * Exchange OIDC token for cloud provider credentials
 * This is a generic function - specific implementations would be in separate files
 */
export async function exchangeOIDCToken(
  oidcToken: string,
  provider: 'aws' | 'gcp' | 'azure',
  config: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // This would be implemented based on the specific cloud provider
  // For now, just return the token for demonstration
  console.log(`Exchanging OIDC token with ${provider}`)
  return { oidcToken, provider, config }
}

/**
 * Middleware to inject OIDC token into function requests
 */
export function withOIDC<T extends (...args: unknown[]) => unknown>(handler: T): T {
  return ((...args: Parameters<T>) => {
    const oidcToken = getValidOIDCToken()

    if (oidcToken) {
      // Inject OIDC token into the context
      const context = args[args.length - 1] || {}
      context.oidc = oidcToken
      args[args.length - 1] = context
    }

    return handler(...args)
  }) as T
}

/**
 * Hook for React components to access OIDC token
 */
export function useOIDC(): OIDCToken | null {
  const [oidcToken, setOidcToken] = React.useState<OIDCToken | null>(null)

  React.useEffect(() => {
    const token = getValidOIDCToken()
    setOidcToken(token)
  }, [])

  return oidcToken
}

// Re-export React for the hook
import * as React from 'react'
