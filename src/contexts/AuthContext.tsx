/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  GoogleUser,
  AuthState,
  signInWithGoogle,
  signOut as googleSignOut,
  getAuthStatus,
  createGoogleAuthConfig,
  storeGoogleUser,
} from '../lib/auth/google-auth'
import { getValidOIDCToken, OIDCToken } from '../lib/auth/oidc'
import { getGCPCredentials, GCPCredentials } from '../lib/auth/oidc-gcp'
import { syncGoogleUserToSupabase, getSupabaseProfile, SupabaseProfile } from '../lib/auth/user-sync'

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

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })
  
  const [oidcToken, setOidcToken] = useState<OIDCToken | null>(null)
  const [gcpCredentials, setGcpCredentials] = useState<GCPCredentials | null>(null)
  const [supabaseProfile, setSupabaseProfile] = useState<SupabaseProfile | null>(null)

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
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
    const refreshInterval = setInterval(async () => {
      if (authState.isAuthenticated) {
        await refreshCredentials()
      }
    }, 5 * 60 * 1000) // Refresh every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [authState.isAuthenticated])

  const signIn = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const config = createGoogleAuthConfig()
      if (!config) {
        throw new Error('Google authentication not configured')
      }

      const user = await signInWithGoogle(config)
      if (!user) {
        throw new Error('Google sign-in failed')
      }

      // Store user
      storeGoogleUser(user)

      // Sync user to Supabase
      const profile = await syncGoogleUserToSupabase(user)
      
      // Get OIDC token (should be available in Vercel environment)
      const oidc = getValidOIDCToken()
      
      // Get GCP credentials
      let gcp: GCPCredentials | null = null
      if (oidc) {
        gcp = await getGCPCredentials()
      }

      setAuthState({
        user,
        isAuthenticated: !!(user && profile), // Require both Google user and Supabase profile
        isLoading: false,
        error: null,
      })
      setOidcToken(oidc)
      setGcpCredentials(gcp)
      setSupabaseProfile(profile)

      if (!oidc) {
        console.warn('OIDC token not available - some features may be limited')
      }
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

  const contextValue: AuthContextType = {
    ...authState,
    oidcToken,
    gcpCredentials,
    supabaseProfile,
    signIn,
    signOut,
    refreshCredentials,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}