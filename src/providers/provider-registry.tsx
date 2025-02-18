import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './theme-provider'
import { ModalProvider } from '@/contexts/ModalContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '@/components/error-boundary'

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ModalProvider>
            <TooltipProvider>
              <Toaster position="top-right" />
              {children}
            </TooltipProvider>
          </ModalProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
