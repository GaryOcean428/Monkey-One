import * as React from 'react'
import { Outlet } from 'react-router'
import { AuthModal } from './components/auth/auth-modal'
import { useAuthContext } from './components/Auth/auth/AuthContext'

// Lazy load components to reduce the initial bundle size
const Sidebar = React.lazy(() =>
  import('./components/Sidebar').then(module => ({
    default: module.Sidebar,
  }))
)
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
      <React.Suspense fallback={<div className="bg-muted h-screen w-64"></div>}>
        <Sidebar />
      </React.Suspense>
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <React.Suspense fallback={null}>
        <LoadingOverlay />
      </React.Suspense>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}
