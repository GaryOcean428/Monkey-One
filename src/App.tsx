import React, { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './components/auth/AuthProvider'
import { VectorStoreProvider } from './contexts/VectorStoreContext'
import { ThemeProvider } from './components/ThemeProvider'
import { ModalProvider } from './contexts/ModalContext'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/toaster'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { LoadingFallback } from './components/LoadingFallback'

// Lazy-loaded components
const DashboardHome = lazy(() =>
  import('./pages/Dashboard/DashboardHome').then(module => ({ default: module.DashboardHome }))
)
const AuthCallback = lazy(() =>
  import('./routes/auth').then(module => ({ default: module.AuthCallback }))
)
const PasswordReset = lazy(() =>
  import('./routes/auth').then(module => ({ default: module.PasswordReset }))
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

// Wrap component with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
)

// Configure router with routes and future flags
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: '/dashboard',
      element: withSuspense(DashboardHome),
    },
    {
      path: '/auth/callback',
      element: withSuspense(AuthCallback),
    },
    {
      path: '/auth/reset-password',
      element: withSuspense(PasswordReset),
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <VectorStoreProvider>
            <ModalProvider>
              <TooltipProvider>
                <RouterProvider router={router} />
                <Toaster />
              </TooltipProvider>
            </ModalProvider>
          </VectorStoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
