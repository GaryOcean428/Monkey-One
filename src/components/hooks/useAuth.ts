import { useState, useCallback } from 'react'

interface User {
  id: string
  email: string
}

interface AuthError {
  message: string
  code?: string
}

interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<AuthError | null>(null)

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // TODO: Implement actual authentication
      const mockUser = { id: '1', email }
      setUser(mockUser)
      return { user: mockUser, error: null }
    } catch (err) {
      const error = err as AuthError
      setError(error)
      return { user: null, error }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // TODO: Implement actual registration
      const mockUser = { id: '1', email }
      setUser(mockUser)
      return { user: mockUser, error: null }
    } catch (err) {
      const error = err as AuthError
      setError(error)
      return { user: null, error }
    }
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    // TODO: Implement actual sign out
    setUser(null)
  }, [])

  const resetPassword = useCallback(async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      // TODO: Implement actual password reset
      return { error: null }
    } catch (err) {
      const error = err as AuthError
      setError(error)
      return { error }
    }
  }, [])

  return {
    user,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
