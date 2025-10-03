/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  AuthState,
  createGoogleAuthConfig,
  getAuthStatus,
  signOut as googleSignOut,
  handleOAuthCallback,
  signInWithGoogle,
} from '../lib/auth/google-auth'
import { OIDCToken, getValidOIDCToken } from '../lib/auth/oidc'
import { GCPCredentials, getGCPCredentials } from '../lib/auth/oidc-gcp'
import {
  SupabaseProfile,
  getSupabaseProfile,
  syncGoogleUserToSupabase,
} from '../lib/auth/user-sync'

interface AuthContextType extends AuthState {
  oidcToken: OIDCToken | null
  gcpCredentials: GCPCredentials | null
  supabaseProfile: SupabaseProfile | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshCredentials: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  const [oidcToken, setOidcToken] = useState<OIDCToken | null>(null)
  const [gcpCredentials, setGcpCredentials] = useState<GCPCredentials | null>(null)
  const [supabaseProfile, setSupabaseProfile] = useState<SupabaseProfile | null>(null)

  const refreshCredentials = useCallback(async () => {
    try {
      // Refresh OIDC token
      const oidc = getValidOIDCToken()

      // Refresh GCP credentials
      let gcp: GCPCredentials | null = null
      if (oidc) {
        gcp = await getGCPCredentials()
      }

      setOidcToken(oidc)
      setGcpCredentials(gcp)

      // Update authentication status
      const status = getAuthStatus()
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: !!(status.user && oidc),
      }))
    } catch (error) {
      console.error('Failed to refresh credentials:', error)
    }
  }, [])

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if this is an OAuth callback
        const urlParams = new URLSearchParams(window.location.search)
        const hasCode = urlParams.has('code')

        if (hasCode) {
          console.log('OAuth callback detected, processing...')

          // Clean up URL IMMEDIATELY to prevent hydration issues
          window.history.replaceState({}, document.title, window.location.pathname)

          const config = createGoogleAuthConfig()
          if (config) {
            const user = await handleOAuthCallback(config)
            if (user) {
              console.log('OAuth callback processed successfully:', user)
              // Sync user to Supabase
              const profile = await syncGoogleUserToSupabase(user)

              // Get OIDC token
              const oidc = getValidOIDCToken()

              // Get GCP credentials
              let gcp: GCPCredentials | null = null
              if (oidc) {
                gcp = await getGCPCredentials()
              }

              setAuthState({
                user,
                isAuthenticated: !!(user && profile),
                isLoading: false,
                error: null,
              })
              setOidcToken(oidc)
              setGcpCredentials(gcp)
              setSupabaseProfile(profile)
              return
            }
          }
        }

        // Normal initialization (no OAuth callback)
        // Get current auth status
        const status = getAuthStatus()

        // Get OIDC token
        const oidc = getValidOIDCToken()

        // Get GCP credentials if OIDC is available
        let gcp: GCPCredentials | null = null
        if (oidc) {
          gcp = await getGCPCredentials()
        }

        // Get Supabase profile if user exists
        let profile: SupabaseProfile | null = null
        if (status.user) {
          profile = await getSupabaseProfile(status.user)
        }

        setAuthState({
          ...status,
          isLoading: false,
        })
        setOidcToken(oidc)
        setGcpCredentials(gcp)
        setSupabaseProfile(profile)
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication initialization failed',
        })
      }
    }

    initializeAuth()
  }, [])

  // Refresh credentials periodically
  useEffect(() => {
    const refreshInterval = setInterval(
      async () => {
        if (authState.isAuthenticated) {
          await refreshCredentials()
        }
      },
      5 * 60 * 1000
    ) // Refresh every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [authState.isAuthenticated, refreshCredentials])

  const signIn = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const config = createGoogleAuthConfig()
      if (!config) {
        throw new Error('Google authentication not configured')
      }

      // signInWithGoogle now redirects to Google - no return value
      // The callback will be handled when user returns from Google
      await signInWithGoogle(config)
      // Note: Code after this line won't execute because of redirect
    } catch (error) {
      console.error('Sign-in failed:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign-in failed',
      })
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      await googleSignOut()

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      setOidcToken(null)
      setGcpCredentials(null)
      setSupabaseProfile(null)
    } catch (error) {
      console.error('Sign-out failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign-out failed',
      }))
    }
  }, [])

  const contextValue: AuthContextType = {
    ...authState,
    oidcToken,
    gcpCredentials,
    supabaseProfile,
    signIn,
    signOut,
    refreshCredentials,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
