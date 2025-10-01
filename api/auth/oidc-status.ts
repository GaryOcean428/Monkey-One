/**
 * OIDC Status API Endpoint
 *
 * Demonstrates OIDC token usage in Vercel Functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getValidOIDCToken } from '../../src/lib/auth/oidc'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get OIDC token from environment or headers
    const oidcToken = getValidOIDCToken()

    if (!oidcToken) {
      return res.status(200).json({
        status: 'no_token',
        message: 'No valid OIDC token available',
        hasToken: false,
        environment: process.env.VERCEL_ENV || 'development',
      })
    }

    // Return token status without exposing the actual token
    return res.status(200).json({
      status: 'valid_token',
      message: 'OIDC token is available and valid',
      hasToken: true,
      issuer: oidcToken.issuer,
      expiresAt: new Date(oidcToken.expiresAt).toISOString(),
      environment: process.env.VERCEL_ENV || 'development',
      timeUntilExpiry: Math.max(0, oidcToken.expiresAt - Date.now()),
    })
  } catch (error) {
    console.error('OIDC status check failed:', error)

    return res.status(500).json({
      status: 'error',
      message: 'Failed to check OIDC token status',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
