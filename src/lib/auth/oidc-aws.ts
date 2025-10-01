/**
 * AWS OIDC Integration
 *
 * Exchange Vercel OIDC tokens for AWS temporary credentials
 */

import { getValidOIDCToken } from './oidc'

export interface AWSCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
  expiration: Date
}

export interface AWSAssumeRoleConfig {
  roleArn: string
  roleSessionName?: string
  region?: string
  durationSeconds?: number
}

/**
 * Exchange OIDC token for AWS credentials using STS AssumeRoleWithWebIdentity
 */
export async function assumeRoleWithOIDC(
  config: AWSAssumeRoleConfig
): Promise<AWSCredentials | null> {
  const oidcToken = getValidOIDCToken()

  if (!oidcToken) {
    console.error('No valid OIDC token available')
    return null
  }

  const {
    roleArn,
    roleSessionName = 'vercel-oidc-session',
    region = 'us-east-1',
    durationSeconds = 3600,
  } = config

  try {
    // AWS STS AssumeRoleWithWebIdentity API call
    const stsEndpoint = `https://sts.${region}.amazonaws.com/`

    const params = new URLSearchParams({
      Action: 'AssumeRoleWithWebIdentity',
      Version: '2011-06-15',
      RoleArn: roleArn,
      RoleSessionName: roleSessionName,
      WebIdentityToken: oidcToken.token,
      DurationSeconds: durationSeconds.toString(),
    })

    const response = await globalThis.fetch(stsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AWS STS AssumeRoleWithWebIdentity failed:', errorText)
      return null
    }

    const xmlText = await response.text()

    // Parse XML response (simplified - in production use a proper XML parser)
    const credentials = parseSTSResponse(xmlText)

    return credentials
  } catch (error) {
    console.error('Failed to assume AWS role with OIDC:', error)
    return null
  }
}

/**
 * Simple XML parser for STS response
 * In production, use a proper XML parsing library
 */
function parseSTSResponse(xmlText: string): AWSCredentials | null {
  try {
    // Extract credentials from XML response
    const accessKeyMatch = xmlText.match(/<AccessKeyId>([^<]+)<\/AccessKeyId>/)
    const secretKeyMatch = xmlText.match(/<SecretAccessKey>([^<]+)<\/SecretAccessKey>/)
    const sessionTokenMatch = xmlText.match(/<SessionToken>([^<]+)<\/SessionToken>/)
    const expirationMatch = xmlText.match(/<Expiration>([^<]+)<\/Expiration>/)

    if (!accessKeyMatch || !secretKeyMatch || !sessionTokenMatch || !expirationMatch) {
      console.error('Failed to parse STS response')
      return null
    }

    return {
      accessKeyId: accessKeyMatch[1],
      secretAccessKey: secretKeyMatch[1],
      sessionToken: sessionTokenMatch[1],
      expiration: new Date(expirationMatch[1]),
    }
  } catch (error) {
    console.error('Failed to parse STS XML response:', error)
    return null
  }
}

/**
 * Create AWS SDK v3 compatible credentials provider
 */
export function createOIDCCredentialsProvider(config: AWSAssumeRoleConfig) {
  return async () => {
    const credentials = await assumeRoleWithOIDC(config)

    if (!credentials) {
      throw new Error('Failed to obtain AWS credentials via OIDC')
    }

    return {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
      expiration: credentials.expiration,
    }
  }
}

/**
 * Middleware to inject AWS credentials into function context
 */
export function withAWSCredentials<T extends (...args: unknown[]) => unknown>(
  config: AWSAssumeRoleConfig,
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    const credentials = await assumeRoleWithOIDC(config)

    if (credentials) {
      // Inject AWS credentials into the context
      const context = args[args.length - 1] || {}
      context.aws = credentials
      args[args.length - 1] = context
    }

    return handler(...args)
  }) as T
}

/**
 * React hook to get AWS credentials
 */
export function useAWSCredentials(config: AWSAssumeRoleConfig): AWSCredentials | null {
  const [credentials, setCredentials] = React.useState<AWSCredentials | null>(null)

  React.useEffect(() => {
    assumeRoleWithOIDC(config).then(setCredentials)
  }, [config.roleArn])

  return credentials
}

// Re-export React for the hook
import * as React from 'react'
