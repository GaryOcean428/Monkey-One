import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SB_SQL_DB_SUPABASE_URL
const supabaseAnonKey = import.meta.env.SB_SQL_DB_NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})
