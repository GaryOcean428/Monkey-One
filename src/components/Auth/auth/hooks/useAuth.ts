import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../../../lib/supabase/client'

export interface AuthError {
  message: string
  status?: number
}

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Ensure Supabase is initialized with client-side environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: 'Supabase configuration is incomplete',
          status: 500,
        },
      }))
      return
    }

    // Safely check if supabase is initialized
    if (!supabase) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: 'Supabase client not initialized',
          status: 500,
        },
      }))
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        error: error ? { message: error.message } : null,
      }))
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      if (!supabase) throw new Error('Supabase not initialized')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error: unknown) {
      return { user: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      if (!supabase) throw new Error('Supabase not initialized')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error: unknown) {
      return { user: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  }

  const signOut = async () => {
    if (!supabase) {
      setState(prev => ({
        ...prev,
        error: { message: 'Supabase not initialized' },
      }))
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) {
      setState(prev => ({
        ...prev,
        error: { message: error.message },
      }))
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      setState(prev => ({
        ...prev,
        error: { message: 'Supabase not initialized' },
      }))
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      setState(prev => ({
        ...prev,
        error: { message: error.message },
      }))
    }
  }

  const updatePassword = async (newPassword: string) => {
    if (!supabase) {
      setState(prev => ({
        ...prev,
        error: { message: 'Supabase not initialized' },
      }))
      return
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) {
      setState(prev => ({
        ...prev,
        error: { message: error.message },
      }))
    }
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}
