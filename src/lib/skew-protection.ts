/**
 * Vercel Skew Protection Implementation for Vite/React
 *
 * Implements version locking to prevent client-server version skew
 * by ensuring requests use the same deployment version.
 */

export interface SkewProtectionConfig {
  enabled: boolean
  deploymentId?: string
}

/**
 * Get skew protection configuration from environment
 */
export function getSkewProtectionConfig(): SkewProtectionConfig {
  const enabled =
    import.meta.env.VITE_VERCEL_SKEW_PROTECTION_ENABLED === '1' ||
    import.meta.env.VERCEL_SKEW_PROTECTION_ENABLED === '1'

  const deploymentId =
    import.meta.env.VITE_VERCEL_DEPLOYMENT_ID || import.meta.env.VERCEL_DEPLOYMENT_ID

  return {
    enabled,
    deploymentId,
  }
}

/**
 * Add skew protection parameters to a URL
 */
export function addSkewProtectionToUrl(url: string): string {
  const config = getSkewProtectionConfig()

  if (!config.enabled || !config.deploymentId) {
    return url
  }

  const urlObj = new URL(url, window.location.origin)
  urlObj.searchParams.set('dpl', config.deploymentId)

  return urlObj.toString()
}

/**
 * Add skew protection headers to fetch options
 */
export function addSkewProtectionHeaders(options: RequestInit = {}): RequestInit {
  const config = getSkewProtectionConfig()

  if (!config.enabled || !config.deploymentId) {
    return options
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      'x-deployment-id': config.deploymentId,
    },
  }
}

/**
 * Enhanced fetch with automatic skew protection
 */
export async function fetchWithSkewProtection(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const config = getSkewProtectionConfig()

  if (!config.enabled || !config.deploymentId) {
    return globalThis.fetch(input, init)
  }

  // Add deployment ID header
  const enhancedInit = addSkewProtectionHeaders(init)

  // If input is a string URL, add deployment ID as query parameter
  let enhancedInput = input
  if (typeof input === 'string' && input.startsWith('/')) {
    enhancedInput = addSkewProtectionToUrl(input)
  }

  return globalThis.fetch(enhancedInput, enhancedInit)
}

/**
 * Set skew protection cookie (for server-side rendering)
 */
export function setSkewProtectionCookie(): void {
  const config = getSkewProtectionConfig()

  if (!config.enabled || !config.deploymentId) {
    return
  }

  // Set the deployment ID cookie
  document.cookie = `__vdpl=${config.deploymentId}; Path=/; HttpOnly; SameSite=Strict`
}

/**
 * React hook to get skew protection status
 */
export function useSkewProtection(): SkewProtectionConfig {
  const [config] = React.useState<SkewProtectionConfig>(() => getSkewProtectionConfig())

  React.useEffect(() => {
    // Set cookie on mount if skew protection is enabled
    if (config.enabled && config.deploymentId) {
      setSkewProtectionCookie()
    }
  }, [config.enabled, config.deploymentId])

  return config
}

/**
 * Higher-order function to wrap API calls with skew protection
 */
export function withSkewProtection<T extends (...args: unknown[]) => Promise<Response>>(
  _apiCall: T
): T {
  return (async (...args: Parameters<T>) => {
    // Assume first argument is URL and second is options
    const [url, options] = args as [string, RequestInit?]

    return fetchWithSkewProtection(url, options)
  }) as T
}

// Re-export React for the hook
import * as React from 'react'
