import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface PrivateRouteProps {
  children: React.ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth()

  // Show nothing while checking authentication status
  if (loading) {
    return null // Or return a loading spinner component if you have one
  }

  if (!user) {
    // Only redirect to login if we're sure there's no user
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
