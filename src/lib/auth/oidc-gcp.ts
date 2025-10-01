/**
 * Google Cloud Platform OIDC Integration
 *
 * Exchange Vercel OIDC tokens for GCP access tokens using Workload Identity Federation
 */

import { getValidOIDCToken } from './oidc'

export interface GCPCredentials {
  accessToken: string
  tokenType: string
  expiresIn: number
  expiresAt: Date
}

export interface GCPWorkloadIdentityConfig {
  projectId: string
  projectNumber: string
  poolId: string
  providerId: string
  serviceAccountEmail: string
  scope?: string[]
}

/**
 * Exchange OIDC token for GCP access token using Workload Identity Federation
 */
export async function exchangeOIDCForGCPToken(
  config: GCPWorkloadIdentityConfig
): Promise<GCPCredentials | null> {
  const oidcToken = getValidOIDCToken()

  if (!oidcToken) {
    console.error('No valid OIDC token available')
    return null
  }

  const {
    projectNumber,
    poolId,
    providerId,
    serviceAccountEmail,
    scope = ['https://www.googleapis.com/auth/cloud-platform'],
  } = config

  try {
    // Step 1: Exchange OIDC token for GCP access token
    const stsEndpoint = 'https://sts.googleapis.com/v1/token'
    
    const audience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`
    
    const stsResponse = await globalThis.fetch(stsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        audience,
        scope: scope.join(' '),
        subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        subject_token: oidcToken.token,
        requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      }),
    })

    if (!stsResponse.ok) {
      const errorText = await stsResponse.text()
      console.error('GCP STS token exchange failed:', errorText)
      return null
    }

    const stsData = await stsResponse.json()

    // Step 2: Impersonate service account if needed
    if (serviceAccountEmail) {
      return await impersonateServiceAccount(stsData.access_token, serviceAccountEmail, scope)
    }

    // Return the federated token directly
    const expiresAt = new Date(Date.now() + stsData.expires_in * 1000)
    
    return {
      accessToken: stsData.access_token,
      tokenType: stsData.token_type || 'Bearer',
      expiresIn: stsData.expires_in,
      expiresAt,
    }
  } catch (error) {
    console.error('Failed to exchange OIDC token for GCP credentials:', error)
    return null
  }
}

/**
 * Impersonate a service account using the federated token
 */
async function impersonateServiceAccount(
  federatedToken: string,
  serviceAccountEmail: string,
  scope: string[]
): Promise<GCPCredentials | null> {
  try {
    const impersonateEndpoint = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`

    const response = await globalThis.fetch(impersonateEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${federatedToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scope,
        delegates: [],
        lifetime: '3600s',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Service account impersonation failed:', errorText)
      return null
    }

    const data = await response.json()
    const expiresAt = new Date(data.expireTime)

    return {
      accessToken: data.accessToken,
      tokenType: 'Bearer',
      expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      expiresAt,
    }
  } catch (error) {
    console.error('Failed to impersonate service account:', error)
    return null
  }
}

/**
 * Create GCP credentials from environment variables
 */
export function createGCPConfigFromEnv(): GCPWorkloadIdentityConfig | null {
  const projectId = import.meta.env.VITE_GCP_PROJECT_ID || process.env.GCP_PROJECT_ID
  const projectNumber = import.meta.env.VITE_GCP_PROJECT_NUMBER || process.env.GCP_PROJECT_NUMBER
  const poolId = import.meta.env.VITE_GCP_WORKLOAD_IDENTITY_POOL_ID || process.env.GCP_WORKLOAD_IDENTITY_POOL_ID
  const providerId = import.meta.env.VITE_GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID
  const serviceAccountEmail = import.meta.env.VITE_GCP_SERVICE_ACCOUNT_EMAIL || process.env.GCP_SERVICE_ACCOUNT_EMAIL

  if (!projectId || !projectNumber || !poolId || !providerId || !serviceAccountEmail) {
    console.warn('Missing GCP configuration environment variables')
    return null
  }

  return {
    projectId,
    projectNumber,
    poolId,
    providerId,
    serviceAccountEmail,
  }
}

/**
 * Get GCP credentials using environment configuration
 */
export async function getGCPCredentials(): Promise<GCPCredentials | null> {
  const config = createGCPConfigFromEnv()
  
  if (!config) {
    return null
  }

  return await exchangeOIDCForGCPToken(config)
}

/**
 * Middleware to inject GCP credentials into function context
 */
export function withGCPCredentials<T extends (...args: unknown[]) => unknown>(
  config: GCPWorkloadIdentityConfig,
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const credentials = await exchangeOIDCForGCPToken(config)

    if (credentials) {
      // Inject GCP credentials into the context
      const context = args[args.length - 1] || {}
      context.gcp = credentials
      args[args.length - 1] = context
    }

    return handler(...args)
  }) as T
}

/**
 * React hook to get GCP credentials
 */
export function useGCPCredentials(config?: GCPWorkloadIdentityConfig): GCPCredentials | null {
  const [credentials, setCredentials] = React.useState<GCPCredentials | null>(null)

  React.useEffect(() => {
    const configToUse = config || createGCPConfigFromEnv()
    
    if (configToUse) {
      exchangeOIDCForGCPToken(configToUse).then(setCredentials)
    }
  }, [config?.projectId, config?.serviceAccountEmail])

  return credentials
}

/**
 * Create authenticated fetch function with GCP credentials
 */
export async function createAuthenticatedFetch(
  config?: GCPWorkloadIdentityConfig
): Promise<typeof fetch | null> {
  const configToUse = config || createGCPConfigFromEnv()
  
  if (!configToUse) {
    return null
  }

  const credentials = await exchangeOIDCForGCPToken(configToUse)
  
  if (!credentials) {
    return null
  }

  return (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers)
    headers.set('Authorization', `${credentials.tokenType} ${credentials.accessToken}`)

    return globalThis.fetch(input, {
      ...init,
      headers,
    })
  }
}

// Re-export React for the hook
import * as React from 'react'