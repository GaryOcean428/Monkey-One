import { SimpleErrorBoundary } from '@/components/simple-error-boundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { createContext, useContext, useRef } from 'react'

interface ToolhouseContextValue {
  queryClient: QueryClient
}

const ToolhouseContext = createContext<ToolhouseContextValue | null>(null)

export const useToolhouseContext = () => {
  const context = useContext(ToolhouseContext)
  if (!context) {
    throw new Error('useToolhouseContext must be used within a ToolhouseProvider')
  }
  return context
}

interface ToolhouseProviderProps {
  children: React.ReactNode
}

export const ToolhouseProvider: React.FC<ToolhouseProviderProps> = ({ children }) => {
  const queryClientRef = useRef<QueryClient | null>(null)

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: Number.parseInt(import.meta.env.VITE_AI_RETRY_ATTEMPTS || '3', 10),
          staleTime: 60_000,
          gcTime: 5 * 60_000,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: Number.parseInt(import.meta.env.VITE_AI_RETRY_ATTEMPTS || '3', 10),
        },
      },
    })
  }

  const queryClient = queryClientRef.current

  return (
    <QueryClientProvider client={queryClient}>
      <ToolhouseContext.Provider value={{ queryClient }}>
        <SimpleErrorBoundary>{children}</SimpleErrorBoundary>
      </ToolhouseContext.Provider>
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
