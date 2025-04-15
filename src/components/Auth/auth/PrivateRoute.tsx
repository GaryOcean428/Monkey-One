import React from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from './hooks/useAuth'
import { Button } from '../ui/button'

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">You must be logged in to view this page.</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => <Navigate to="/login" state={{ from: location }} replace />}>
              Go Back to Login
            </Button>
            <Button onClick={() => <Navigate to="/support" />}>Contact Support</Button>
            <Button onClick={() => <Navigate to="/auth/callback" />}>Retry Authentication</Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
