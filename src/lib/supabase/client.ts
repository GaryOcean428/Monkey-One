import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { ErrorHandler } from '../../utils/errorHandler'

// Safely extract environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Access the public URL through import.meta.env or fall back to runtime detection
function getPublicUrl() {
  return import.meta.env.VITE_PUBLIC_URL || window.location.origin || 'https://monkey-one.vercel.app'
}

const publicUrl = getPublicUrl()

// Ensure global access to publicUrl
if (typeof window !== 'undefined') {
  // Set on window.ENV object which is our safe environment variable container
  if (!window.ENV) {
    window.ENV = {}
  }
  window.ENV.VITE_PUBLIC_URL = publicUrl
  window.PUBLIC_URL = publicUrl
}

// Log warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  ErrorHandler.log('Missing Supabase environment variables', {
    level: 'warn', // Change to warning instead of error
    context: {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
    },
  })
}

// Create a singleton instance with fallback - ensure it's only created once globally
let instance: SupabaseClient<Database> | null = null

// Use a more robust singleton pattern to prevent duplicate clients
export const supabase = (() => {
  // Return existing instance if already created
  if (instance) return instance

  if (typeof window !== 'undefined') {
    // Check if we already have a client in window object
    if ((window as any).__SUPABASE_CLIENT__) {
      return (window as any).__SUPABASE_CLIENT__ as SupabaseClient<Database>
    }
  }

  try {
    instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'monkey-one-auth-token', // Use a unique storage key
      },
      global: {
        headers: {
          'x-client-info': 'Monkey-One/1.0.0',
        },
      },
    })

    // Store the client in window object to ensure it's a singleton
    if (typeof window !== 'undefined') {
      ;(window as any).__SUPABASE_CLIENT__ = instance
    }
  } catch (error) {
    ErrorHandler.log('Failed to initialize Supabase client', {
      level: 'error',
      context: { error },
    })

    // Provide a no-op client to prevent further errors
    instance = {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({
          data: { user: null, session: null },
          error: new Error('Supabase not initialized'),
        }),
        signUp: async () => ({
          data: { user: null, session: null },
          error: new Error('Supabase not initialized'),
        }),
        signOut: async () => ({ error: null }),
        updateUser: async () => ({ data: null, error: new Error('Supabase not initialized') }),
        resetPasswordForEmail: async () => ({ error: null }),
      },
    } as unknown as SupabaseClient<Database>
  }

  return instance
})()
