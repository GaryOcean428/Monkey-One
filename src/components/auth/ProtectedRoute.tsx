/**
 * Protected Route Component
 *
 * Ensures user is authenticated before allowing access to routes
 */

import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    // Show loading state while checking authentication
    if (isLoading)
    {
        return (
            <div className="bg-background flex h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Verifying authentication...</p>
                </div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated)
    {
        // Save the location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // User is authenticated, render children
    return <>{children}</>
}
