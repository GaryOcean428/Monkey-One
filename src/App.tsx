import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { Sidebar } from './components/Sidebar'
import { ErrorBoundaryWrapper } from './components/error-boundary-wrapper'
import { UserProfile, LoginButton } from './components/auth'

// Lazy load non-critical components to reduce the initial bundle size
const LoadingOverlay = React.lazy(() =>
  import('./components/ui/loading-overlay').then(module => ({
    default: module.LoadingOverlay,
  }))
)

export function App() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="mx-4 w-full max-w-md">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome to Monkey-One</h1>
              <p className="text-muted-foreground">Sign in to access your AI agent dashboard</p>
            </div>
            <LoginButton className="w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <ErrorBoundaryWrapper context="sidebar">
        <Sidebar />
      </ErrorBoundaryWrapper>
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          {/* Header with user profile */}
          <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
            <div className="flex h-14 items-center justify-end px-4 md:px-6 lg:px-8">
              <UserProfile />
            </div>
          </header>

          {/* Main content */}
          <div className="p-4 md:p-6 lg:p-8">
            <ErrorBoundaryWrapper context="main content">
              <Outlet />
            </ErrorBoundaryWrapper>
          </div>
        </div>
      </main>
      <React.Suspense fallback={null}>
        <ErrorBoundaryWrapper context="loading overlay">
          <LoadingOverlay />
        </ErrorBoundaryWrapper>
      </React.Suspense>
    </div>
  )
}
