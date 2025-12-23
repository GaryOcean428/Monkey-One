/**
 * Authentication Test Page
 *
 * Test page for verifying authentication functionality
 */

import React from 'react'
import { AuthStatus, LoginButton, UserProfile } from '../components/auth'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export function AuthTest(): JSX.Element {
  const { user, isAuthenticated, supabaseProfile, oidcToken, gcpCredentials, refreshCredentials } =
    useAuth()

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Authentication Test</h1>
          <p className="text-muted-foreground">Test and verify authentication functionality</p>
        </div>
        {isAuthenticated && <UserProfile />}
      </div>

      {/* Authentication Status */}
      <AuthStatus detailed={true} />

      {/* Login Section */}
      {!isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to test the authentication system</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginButton className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* User Information */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Google OAuth User Data</CardTitle>
            <CardDescription>Information retrieved from Google OAuth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <p className="text-muted-foreground text-sm">{user.id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-muted-foreground text-sm">{user.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-muted-foreground text-sm">{user.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email Verified</label>
                <p className="text-muted-foreground text-sm">
                  {user.verified_email ? 'Yes' : 'No'}
                </p>
              </div>
              {user.picture && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Profile Picture</label>
                  <div className="mt-2">
                    <img src={user.picture} alt={user.name || 'User'} className="h-16 w-16 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supabase Profile */}
      {supabaseProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Supabase Profile Data</CardTitle>
            <CardDescription>User profile synchronized to Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Profile ID</label>
                <p className="text-muted-foreground font-mono text-sm">{supabaseProfile.id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Username</label>
                <p className="text-muted-foreground text-sm">{supabaseProfile.username || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Created At</label>
                <p className="text-muted-foreground text-sm">
                  {new Date(supabaseProfile.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Updated At</label>
                <p className="text-muted-foreground text-sm">
                  {new Date(supabaseProfile.updated_at).toLocaleString()}
                </p>
              </div>
              {supabaseProfile.preferences && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Preferences</label>
                  <pre className="text-muted-foreground bg-muted mt-1 rounded p-2 text-sm">
                    {JSON.stringify(supabaseProfile.preferences, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* OIDC Token */}
      {oidcToken && (
        <Card>
          <CardHeader>
            <CardTitle>Vercel OIDC Token</CardTitle>
            <CardDescription>Token for secure backend service access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Issuer</label>
                <p className="text-muted-foreground text-sm">{oidcToken.issuer || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Expires At</label>
                <p className="text-muted-foreground text-sm">
                  {new Date(oidcToken.expiresAt).toLocaleString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Token (First 50 chars)</label>
                <p className="text-muted-foreground bg-muted rounded p-2 font-mono text-sm">
                  {oidcToken.token?.substring(0, 50) || 'N/A'}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GCP Credentials */}
      {gcpCredentials && (
        <Card>
          <CardHeader>
            <CardTitle>GCP Access Credentials</CardTitle>
            <CardDescription>Credentials for Google Cloud Platform access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Token Type</label>
                <p className="text-muted-foreground text-sm">{gcpCredentials.tokenType || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Expires At</label>
                <p className="text-muted-foreground text-sm">
                  {gcpCredentials.expiresAt.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Expires In</label>
                <p className="text-muted-foreground text-sm">{gcpCredentials.expiresIn || 0} seconds</p>
              </div>
              <div>
                <label className="text-sm font-medium">Access Token (First 50 chars)</label>
                <p className="text-muted-foreground bg-muted rounded p-2 font-mono text-sm">
                  {gcpCredentials.accessToken?.substring(0, 50) || 'N/A'}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Test authentication-related actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={refreshCredentials} variant="outline">
              Refresh Credentials
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>Current environment configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <label className="font-medium">Environment</label>
              <p className="text-muted-foreground">
                {import.meta.env.DEV ? 'Development' : 'Production'}
              </p>
            </div>
            <div>
              <label className="font-medium">Auth Enabled</label>
              <p className="text-muted-foreground">
                {import.meta.env.VITE_AUTH_ENABLED || 'false'}
              </p>
            </div>
            <div>
              <label className="font-medium">Public URL</label>
              <p className="text-muted-foreground">
                {import.meta.env.VITE_PUBLIC_URL || 'Not set'}
              </p>
            </div>
            <div>
              <label className="font-medium">Google Client ID</label>
              <p className="text-muted-foreground">
                {import.meta.env.VITE_GOOGLE_CLIENT_ID
                  ? `${import.meta.env.VITE_GOOGLE_CLIENT_ID.substring(0, 20)}...`
                  : 'Not configured'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
