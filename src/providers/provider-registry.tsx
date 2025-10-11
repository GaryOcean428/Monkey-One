import { SimpleErrorBoundary } from '@/components/simple-error-boundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ModalProvider } from '@/contexts/ModalContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './theme-provider'

// Import AuthProvider to provide authentication context
const AuthProvider = React.lazy(async () => {
  const module = await import('@/contexts/AuthContext')
  const candidate = module as {
    AuthProvider?: React.ComponentType<React.PropsWithChildren>
    default?: React.ComponentType<React.PropsWithChildren>
  }

  const resolved: React.ComponentType<React.PropsWithChildren> =
    candidate.AuthProvider ?? candidate.default ?? (({ children }) => <>{children}</>)

  return { default: resolved }
})

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
