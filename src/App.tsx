import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'
import { AuthProvider } from './components/auth/AuthProvider'
import { VectorStoreProvider } from './contexts/VectorStoreContext'
import { ThemeProvider } from './components/ui/theme-provider'
import { ModalProvider } from './contexts/ModalContext'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/toaster'

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

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client for AuthProvider
createClient(supabaseUrl, supabaseAnonKey)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <VectorStoreProvider>
              <ModalProvider>
                <div className="min-h-screen">
                  <Toaster />
                </div>
              </ModalProvider>
            </VectorStoreProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
