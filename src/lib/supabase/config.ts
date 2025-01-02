import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SB_SQL_DB_NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.SB_SQL_DB_NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
})

// Service role client for admin operations
const serviceRoleKey = import.meta.env.SB_SQL_DB_SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      db: {
        schema: 'public',
      },
    })
  : null
