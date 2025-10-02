/**
 * Google Authentication Integration
 *
 * Provides Google OAuth2 authentication for user login and OIDC for backend access
 */

// import { getGCPCredentials, createGCPConfigFromEnv } from './oidc-gcp'
import { getValidOIDCToken } from './oidc'

export interface GoogleUser {
  id: string
  email: string
  name: string
  picture?: string
  verified_email: boolean
}

export interface GoogleAuthConfig {
  clientId: string
  redirectUri: string
  scope?: string[]
}

export interface AuthState {
  user: GoogleUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Initialize Google OAuth2 authentication
 */
export function initializeGoogleAuth(_config: GoogleAuthConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    // Load Google Identity Services script
    if (typeof window === 'undefined') {
      reject(new Error('Google Auth can only be initialized in browser environment'))
      return
    }

    // Check if already loaded
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true

    script.onload = () => {
      // Google Identity Services library loaded
      // Client will be initialized in signInWithGoogle with redirect mode
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services'))
    }

    document.head.appendChild(script)
  })
}

/**
 * Sign in with Google OAuth2
 * Uses direct OAuth2 URL construction for better reliability
 */
export async function signInWithGoogle(config: GoogleAuthConfig): Promise<void> {
  try {
    // Store the redirect URI for the callback
    globalThis.localStorage.setItem('oauth_redirect_uri', config.redirectUri)

    // Construct OAuth2 authorization URL manually
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', config.clientId)
    authUrl.searchParams.set('redirect_uri', config.redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', (config.scope || ['openid', 'email', 'profile']).join(' '))
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    console.log('Redirecting to Google OAuth:', authUrl.toString())

    // Redirect to Google's OAuth authorization page
    window.location.href = authUrl.toString()
  } catch (error) {
    console.error('Google sign-in failed:', error)
    throw error
  }
}

/**
 * Handle OAuth callback after redirect from Google
 */
export async function handleOAuthCallback(config: GoogleAuthConfig): Promise<GoogleUser | null> {
  try {
    // Check if we have an authorization code in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      throw new Error(`OAuth error: ${error}`)
    }

    if (!code) {
      console.error('No authorization code found in callback')
      return null
    }

    console.log('Processing OAuth callback with code:', code.substring(0, 10) + '...')

    // Get the stored redirect URI
    const storedRedirectUri = globalThis.localStorage.getItem('oauth_redirect_uri')
    const redirectUri = storedRedirectUri || config.redirectUri

    console.log('Using redirect URI for token exchange:', redirectUri)

    // Exchange authorization code for tokens
    const tokenResponse = await exchangeCodeForTokens(code, {
      ...config,
      redirectUri,
    })

    if (!tokenResponse) {
      throw new Error('Failed to exchange code for tokens')
    }

    // Get user info
    const userInfo = await getUserInfo(tokenResponse.access_token)

    if (userInfo) {
      // Store user info
      storeGoogleUser(userInfo)
      // Clean up the stored redirect URI
      globalThis.localStorage.removeItem('oauth_redirect_uri')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    return userInfo
  } catch (error) {
    console.error('OAuth callback handling failed:', error)
    globalThis.localStorage.removeItem('oauth_redirect_uri')
    throw error
  }
}

/**
 * Exchange authorization code for access tokens
 */
async function exchangeCodeForTokens(
  code: string,
  config: GoogleAuthConfig
): Promise<{ access_token: string; id_token: string } | null> {
  try {
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || ''

    if (!clientSecret) {
      console.error('Google Client Secret is missing')
      return null
    }

    const response = await globalThis.fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token exchange failed:', errorText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to exchange code for tokens:', error)
    return null
  }
}

/**
 * Get user information from Google API
 */
async function getUserInfo(accessToken: string): Promise<GoogleUser | null> {
  try {
    const response = await globalThis.fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to get user info:', errorText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get user info:', error)
    return null
  }
}

/**
 * Create Google Auth configuration from environment variables
 */
export function createGoogleAuthConfig(): GoogleAuthConfig | null {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

  // Determine the current URL for redirect
  let currentUrl = 'http://localhost:4000'
  if (typeof window !== 'undefined') {
    currentUrl = window.location.origin
  } else {
    // Server-side: use environment variable
    currentUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:4000'
  }

  if (!clientId) {
    console.warn('Missing Google Client ID environment variable')
    return null
  }

  return {
    clientId,
    redirectUri: `${currentUrl}/auth/callback`,
    scope: ['openid', 'email', 'profile'],
  }
}

/**
 * Check if user is authenticated with both Google OAuth and Vercel OIDC
 */
export function isFullyAuthenticated(): boolean {
  const oidcToken = getValidOIDCToken()
  const googleUser = getStoredGoogleUser()

  return !!(oidcToken && googleUser)
}

/**
 * Get stored Google user from localStorage
 */
export function getStoredGoogleUser(): GoogleUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = globalThis.localStorage.getItem('monkey-one-google-user')
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Failed to get stored Google user:', error)
    return null
  }
}

/**
 * Store Google user in localStorage
 */
export function storeGoogleUser(user: GoogleUser): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    globalThis.localStorage.setItem('monkey-one-google-user', JSON.stringify(user))
  } catch (error) {
    console.error('Failed to store Google user:', error)
  }
}

/**
 * Clear stored Google user
 */
export function clearStoredGoogleUser(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    globalThis.localStorage.removeItem('monkey-one-google-user')
  } catch (error) {
    console.error('Failed to clear stored Google user:', error)
  }
}

/**
 * Sign out from Google and clear local storage
 */
export async function signOut(): Promise<void> {
  try {
    // Clear local storage
    clearStoredGoogleUser()

    // Revoke Google tokens if available
    if (window.google?.accounts?.oauth2) {
      // Note: Google Identity Services doesn't provide a direct sign-out method
      // The user would need to sign out from their Google account manually
      console.log('User signed out locally. Google session may still be active.')
    }
  } catch (error) {
    console.error('Sign out failed:', error)
  }
}

/**
 * Get authentication status and user info
 */
export function getAuthStatus(): AuthState {
  const user = getStoredGoogleUser()
  const oidcToken = getValidOIDCToken()

  return {
    user,
    isAuthenticated: !!(user && oidcToken),
    isLoading: false,
    error: null,
  }
}

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: unknown) => { requestCode: () => void }
          revoke: (accessToken: string, callback?: () => void) => void
        }
      }
    }
  }
}
