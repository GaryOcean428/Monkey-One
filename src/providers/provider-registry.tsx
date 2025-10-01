import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme-provider'
import { ModalProvider } from '@/contexts/ModalContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'react-hot-toast'
import { SimpleErrorBoundary } from '@/components/simple-error-boundary'

// Import AuthProvider to provide authentication context
const AuthProvider = React.lazy(() =>
  import('@/components/Auth/auth/AuthProvider').then(module => ({
    default: module.AuthProvider,
  }))
)

interface ProviderRegistryProps {
  children: React.ReactNode
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function ProviderRegistry({ children }: ProviderRegistryProps) {
  return (
    <SimpleErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <React.Suspense
            fallback={
              <div className="flex h-screen items-center justify-center">
                Loading authentication...
              </div>
            }
          >
            <AuthProvider>
              <ModalProvider>
                <TooltipProvider>
                  <Toaster position="top-right" />
                  {children}
                </TooltipProvider>
              </ModalProvider>
            </AuthProvider>
          </React.Suspense>
        </ThemeProvider>
      </QueryClientProvider>
    </SimpleErrorBoundary>
  )
}
