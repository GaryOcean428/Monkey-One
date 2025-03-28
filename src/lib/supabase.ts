import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SB_SQL_DB_NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.SB_SQL_DB_NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey ? '[Key exists]' : '[Key missing]')

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
})
