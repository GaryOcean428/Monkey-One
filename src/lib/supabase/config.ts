// This file is now deprecated - use the singleton client from ./client.ts
// Importing from client.ts ensures we maintain a single instance
import { supabase } from './client'

// Re-export the singleton client to maintain backward compatibility
export { supabase }

// For admin operations, you should use the client.ts singleton
// and handle admin operations through proper authentication flows
export const supabaseAdmin = null
