/**
 * Authentication Guard Component
 *
 * Protects routes and components that require authentication
 */

import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { LoginButton } from './LoginButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireOIDC?: boolean
  requireGCP?: boolean
}

export function AuthGuard({
  children,
  fallback,
  requireOIDC = false,
  requireGCP = false,
}: AuthGuardProps): JSX.Element {
  const { isAuthenticated, isLoading, user, oidcToken, gcpCredentials, error } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Authentication Error</span>
            </CardTitle>
            <CardDescription>There was a problem with authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            <LoginButton variant="outline" className="w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Authentication Required</span>
            </CardTitle>
            <CardDescription>Please sign in to access this feature</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginButton className="w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check OIDC requirement
  if (requireOIDC && !oidcToken) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Limited Access</span>
            </CardTitle>
            <CardDescription>This feature requires Vercel OIDC authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              OIDC authentication is not available in this environment. Some features may be
              limited.
            </p>
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> OIDC tokens are automatically provided in Vercel deployments
                and may not be available in local development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check GCP requirement
  if (requireGCP && !gcpCredentials) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>GCP Access Required</span>
            </CardTitle>
            <CardDescription>This feature requires Google Cloud Platform access</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              GCP credentials could not be obtained. Please check your Workload Identity Federation
              configuration.
            </p>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Requirements:</strong> Valid OIDC token and properly configured Workload
                Identity Pool with service account impersonation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}

/**
 * Higher-order component version of AuthGuard
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireOIDC?: boolean
    requireGCP?: boolean
    fallback?: React.ReactNode
  }
) {
  const WrappedComponent = (props: P) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  )

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`

  return WrappedComponent
}
