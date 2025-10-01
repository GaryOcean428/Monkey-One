import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { AuthModal } from './components/auth/auth-modal'
import { useAuthContext } from './components/Auth/auth/AuthContext'
import { Sidebar } from './components/Sidebar'
import { ErrorBoundaryWrapper } from './components/error-boundary-wrapper'

// Lazy load non-critical components to reduce the initial bundle size
const LoadingOverlay = React.lazy(() =>
  import('./components/ui/loading-overlay').then(module => ({
    default: module.LoadingOverlay,
  }))
)

export function App() {
  const { user } = useAuthContext()
  const [isAuthModalOpen, setAuthModalOpen] = React.useState(!user)

  React.useEffect(() => {
    if (!user) {
      setAuthModalOpen(true)
    }
  }, [user])

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <ErrorBoundaryWrapper context="sidebar">
        <Sidebar />
      </ErrorBoundaryWrapper>
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-4 md:p-6 lg:p-8">
          <ErrorBoundaryWrapper context="main content">
            <Outlet />
          </ErrorBoundaryWrapper>
        </div>
      </main>
      <React.Suspense fallback={null}>
        <ErrorBoundaryWrapper context="loading overlay">
          <LoadingOverlay />
        </ErrorBoundaryWrapper>
      </React.Suspense>
      <ErrorBoundaryWrapper context="auth modal">
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </ErrorBoundaryWrapper>
    </div>
  )
}
