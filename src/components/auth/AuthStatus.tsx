/**
 * Authentication Status Component
 *
 * Displays detailed authentication status for debugging and monitoring
 */

import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'

interface AuthStatusProps {
  className?: string
  detailed?: boolean
}

export function AuthStatus({ className, detailed = false }: AuthStatusProps): JSX.Element {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    oidcToken, 
    gcpCredentials, 
    supabaseProfile 
  } = useAuth()

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Clock className="h-4 w-4 text-gray-400" />
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: boolean | null, labels: [string, string, string]) => {
    if (status === null) return <Badge variant="secondary">{labels[2]}</Badge>
    return status ? 
      <Badge variant="default" className="bg-green-600">{labels[0]}</Badge> : 
      <Badge variant="destructive">{labels[1]}</Badge>
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Loading authentication status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon(isAuthenticated)}
          <span>Authentication Status</span>
        </CardTitle>
        <CardDescription>
          Current authentication state across all services
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Google OAuth Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Google OAuth</span>
              {getStatusBadge(!!user, ['Connected', 'Disconnected', 'Loading'])}
            </div>
            {user && detailed && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Email: {user.email}</div>
                <div>Name: {user.name}</div>
                <div>Verified: {user.verified_email ? 'Yes' : 'No'}</div>
              </div>
            )}
          </div>

          {/* Supabase Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Supabase Profile</span>
              {getStatusBadge(!!supabaseProfile, ['Synced', 'Not Synced', 'Loading'])}
            </div>
            {supabaseProfile && detailed && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Username: {supabaseProfile.username}</div>
                <div>Profile ID: {supabaseProfile.id.substring(0, 8)}...</div>
                <div>Created: {new Date(supabaseProfile.created_at).toLocaleDateString()}</div>
              </div>
            )}
          </div>

          {/* Vercel OIDC Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vercel OIDC</span>
              {getStatusBadge(!!oidcToken, ['Active', 'Unavailable', 'Loading'])}
            </div>
            {oidcToken && detailed && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Issuer: {oidcToken.issuer}</div>
                <div>Expires: {new Date(oidcToken.expiresAt).toLocaleString()}</div>
              </div>
            )}
            {!oidcToken && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                Only available in Vercel deployments
              </div>
            )}
          </div>

          {/* GCP Credentials Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">GCP Access</span>
              {getStatusBadge(!!gcpCredentials, ['Available', 'Unavailable', 'Loading'])}
            </div>
            {gcpCredentials && detailed && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Token Type: {gcpCredentials.tokenType}</div>
                <div>Expires: {gcpCredentials.expiresAt.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Overall Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Status</span>
            {getStatusBadge(isAuthenticated, ['Fully Authenticated', 'Authentication Required', 'Loading'])}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {isAuthenticated 
              ? 'All required authentication services are active'
              : 'Some authentication services are missing or inactive'
            }
          </div>
        </div>

        {/* Environment Info */}
        {detailed && (
          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Environment: {import.meta.env.DEV ? 'Development' : 'Production'}</div>
              <div>Auth Enabled: {import.meta.env.VITE_AUTH_ENABLED || 'false'}</div>
              <div>Public URL: {import.meta.env.VITE_PUBLIC_URL || 'Not set'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}