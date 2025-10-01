/**
 * Authenticated Fetch Hook
 *
 * Provides fetch function with automatic authentication headers
 */

import { useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createAuthenticatedFetch } from '../lib/auth/oidc-gcp'

export interface AuthenticatedFetchOptions extends RequestInit {
  useGCP?: boolean
  useOIDC?: boolean
}

export function useAuthenticatedFetch() {
  const { oidcToken, gcpCredentials, isAuthenticated } = useAuth()

  // Create GCP authenticated fetch function
  const gcpFetch = useMemo(async () => {
    if (!gcpCredentials) {
      return null
    }
    
    return createAuthenticatedFetch()
  }, [gcpCredentials])

  // Main authenticated fetch function
  const authenticatedFetch = useCallback(
    async (
      input: RequestInfo | URL,
      options: AuthenticatedFetchOptions = {}
    ): Promise<Response> => {
      const { useGCP = false, useOIDC = false, ...fetchOptions } = options

      // If not authenticated, throw error
      if (!isAuthenticated) {
        throw new Error('User not authenticated')
      }

      // Prepare headers
      const headers = new Headers(fetchOptions.headers)

      // Add GCP authentication if requested and available
      if (useGCP && gcpCredentials) {
        headers.set('Authorization', `${gcpCredentials.tokenType} ${gcpCredentials.accessToken}`)
      }
      // Add OIDC authentication if requested and available
      else if (useOIDC && oidcToken) {
        headers.set('Authorization', `Bearer ${oidcToken.token}`)
      }
      // Default to GCP if available, then OIDC
      else if (gcpCredentials) {
        headers.set('Authorization', `${gcpCredentials.tokenType} ${gcpCredentials.accessToken}`)
      } else if (oidcToken) {
        headers.set('Authorization', `Bearer ${oidcToken.token}`)
      }

      // Add common headers
      if (!headers.has('Content-Type') && fetchOptions.body) {
        headers.set('Content-Type', 'application/json')
      }

      // Make the request
      return fetch(input, {
        ...fetchOptions,
        headers,
      })
    },
    [isAuthenticated, oidcToken, gcpCredentials]
  )

  // Convenience methods for common HTTP verbs
  const get = useCallback(
    (url: RequestInfo | URL, options?: AuthenticatedFetchOptions) =>
      authenticatedFetch(url, { ...options, method: 'GET' }),
    [authenticatedFetch]
  )

  const post = useCallback(
    (url: RequestInfo | URL, data?: any, options?: AuthenticatedFetchOptions) =>
      authenticatedFetch(url, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),
    [authenticatedFetch]
  )

  const put = useCallback(
    (url: RequestInfo | URL, data?: any, options?: AuthenticatedFetchOptions) =>
      authenticatedFetch(url, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }),
    [authenticatedFetch]
  )

  const patch = useCallback(
    (url: RequestInfo | URL, data?: any, options?: AuthenticatedFetchOptions) =>
      authenticatedFetch(url, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }),
    [authenticatedFetch]
  )

  const del = useCallback(
    (url: RequestInfo | URL, options?: AuthenticatedFetchOptions) =>
      authenticatedFetch(url, { ...options, method: 'DELETE' }),
    [authenticatedFetch]
  )

  return {
    fetch: authenticatedFetch,
    get,
    post,
    put,
    patch,
    delete: del,
    isAuthenticated,
    hasOIDC: !!oidcToken,
    hasGCP: !!gcpCredentials,
  }
}