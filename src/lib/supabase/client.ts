import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'
import { ErrorHandler } from '../../utils/errorHandler'

// Safely extract environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Access the public URL - prioritize environment variable
function getPublicUrl() {
  return import.meta.env.VITE_PUBLIC_URL || 'https://monkey-one.dev'
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
if (!supabaseUrl || !supabaseAnonKey || !publicUrl) {
  ErrorHandler.log('Missing environment variables', {
    level: 'warn', // Change to warning instead of error
    context: {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
      publicUrl: !!publicUrl,
    },
  })
}

// Global variable to store the single instance
declare global {
  interface Window {
    __MONKEY_ONE_SUPABASE_CLIENT__?: SupabaseClient<Database>
  }
}

// Create a singleton instance with proper error handling
function createSupabaseClient(): SupabaseClient<Database> {
  // Check if we already have a client in the global scope
  if (typeof window !== 'undefined' && window.__MONKEY_ONE_SUPABASE_CLIENT__) {
    return window.__MONKEY_ONE_SUPABASE_CLIENT__
  }

  try {
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'monkey-one-auth-token', // Use a unique storage key
        detectSessionInUrl: false, // Disable URL detection since we use custom Google OAuth
        flowType: 'pkce', // Use PKCE flow for better security when using Supabase auth
      },
      global: {
        headers: {
          'x-client-info': 'Monkey-One/1.0.0',
        },
      },
    })

    // Store the client globally to ensure singleton behavior
    if (typeof window !== 'undefined') {
      window.__MONKEY_ONE_SUPABASE_CLIENT__ = client
    }

    console.info('Supabase client initialized successfully')
    return client
  } catch (error) {
    ErrorHandler.log('Failed to initialize Supabase client', {
      level: 'error',
      context: { error },
    })

    // Create a more complete no-op client to prevent app crashes
    // Helper to create chainable query builder
    const createQueryBuilder = (): Record<string, unknown> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const builder: any = {
        select: () => builder,
        insert: () => builder,
        update: () => builder,
        delete: () => builder,
        eq: () => builder,
        neq: () => builder,
        gt: () => builder,
        gte: () => builder,
        lt: () => builder,
        lte: () => builder,
        like: () => builder,
        ilike: () => builder,
        is: () => builder,
        in: () => builder,
        contains: () => builder,
        containedBy: () => builder,
        rangeGt: () => builder,
        rangeGte: () => builder,
        rangeLt: () => builder,
        rangeLte: () => builder,
        rangeAdjacent: () => builder,
        overlaps: () => builder,
        textSearch: () => builder,
        match: () => builder,
        not: () => builder,
        or: () => builder,
        filter: () => builder,
        order: () => builder,
        limit: () => builder,
        range: () => builder,
        single: async () => ({ data: null, error: new Error('Supabase not initialized') }),
        maybeSingle: async () => ({ data: null, error: new Error('Supabase not initialized') }),
        then: async () => ({ data: null, error: new Error('Supabase not initialized') }),
      }
      return builder
    }

    const noOpClient = {
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
      from: (_table: string) => createQueryBuilder(),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error('Supabase not initialized') }),
          download: async () => ({ data: null, error: new Error('Supabase not initialized') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
      realtime: {
        channel: () => ({
          on: () => ({ subscribe: () => {} }),
          off: () => {},
        }),
      },
    } as unknown as SupabaseClient<Database>

    if (typeof window !== 'undefined') {
      window.__MONKEY_ONE_SUPABASE_CLIENT__ = noOpClient
    }

    return noOpClient
  }
}

// Export the singleton instance
export const supabase = createSupabaseClient()
