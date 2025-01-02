import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
}

interface AuthError extends Error {
  code?: string
}

interface AuthResponse {
  user: User | null
  error: AuthError | null
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<AuthError | null>(null)

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      const user = data?.user ? { id: data.user.id, email: data.user.email || '' } : null
      setUser(user)
      return { user, error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { user: null, error: authError }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        throw signUpError
      }

      const user = data?.user ? { id: data.user.id, email: data.user.email || '' } : null
      setUser(user)
      return { user, error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { user: null, error: authError }
    }
  }, [])

  const signOut = useCallback(async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        throw signOutError
      }

      setUser(null)
      return { error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { error: authError }
    }
  }, [])

  const resetPassword = useCallback(async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
      
      if (resetError) {
        throw resetError
      }

      return { error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { error: authError }
    }
  }, [])

  const handleAuthCallback = useCallback(async (): Promise<AuthResponse> => {
    try {
      const { data, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      const user = data?.session?.user ? { 
        id: data.session.user.id, 
        email: data.session.user.email || '' 
      } : null
      
      setUser(user)
      return { user, error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { user: null, error: authError }
    }
  }, [])

  return {
    user,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    handleAuthCallback
  }
}
