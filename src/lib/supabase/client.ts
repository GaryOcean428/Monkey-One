import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.SB_SQL_DB_NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.SB_SQL_DB_NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a singleton instance
let instance: ReturnType<typeof createClient<Database>> | null = null

export const supabase = (() => {
  if (instance) return instance

  instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'monkey-one-auth-token', // Add a unique storage key
    },
  })

  return instance
})()
