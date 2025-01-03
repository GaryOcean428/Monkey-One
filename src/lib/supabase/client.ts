import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { ErrorHandler } from '../../utils/errorHandler'

// Safely extract environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Log warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  ErrorHandler.log('Missing Supabase environment variables', {
    level: 'error',
    context: {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
    },
  })
}

// Create a singleton instance with fallback
let instance: SupabaseClient<Database> | null = null

export const supabase = (() => {
  if (instance) return instance

  try {
    instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'monkey-one-auth-token',
      },
      global: {
        headers: {
          'x-client-info': 'Monkey-One/1.0.0',
        },
      },
    })
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
