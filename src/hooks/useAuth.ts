import { useState, useCallback, useEffect } from 'react'
import { AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase/client' // Use the singleton client

interface User {
  id: string
  email: string
}

interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<AuthError | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (session?.user) {
          const { id, email } = session.user
          setUser({ id, email: email || '' })
        }
      } catch (err) {
        console.error('Error checking session:', err)
        setError(err as AuthError)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { id, email } = session.user
        setUser({ id, email: email || '' })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError)
        return { user: null, error: signInError }
      }

      if (data?.user) {
        const { id, email } = data.user
        const userData = { id, email: email || '' }
        setUser(userData)
        setError(null)
        return { user: userData, error: null }
      }

      return { user: null, error: new Error('No user data returned') as AuthError }
    } catch (error) {
      const authError = error as AuthError
      setError(authError)
      return { user: null, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async (): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (signInError) {
        setError(signInError)
        return { user: null, error: signInError }
      }

      // OAuth redirects, so we don't get user data immediately
      return { user: null, error: null }
    } catch (error) {
      const authError = error as AuthError
      setError(authError)
      return { user: null, error: authError }
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        throw signOutError
      }
      setUser(null)
      setError(null)
    } catch (error) {
      console.error('Error signing out:', error)
      setError(error as AuthError)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    error,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
  }
}
