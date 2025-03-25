import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { ProviderRegistry } from './providers/provider-registry'
import { Sidebar } from './components/sidebar'
import { LoadingOverlay } from './components/ui/loading-overlay'
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <ProviderRegistry>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
      <LoadingOverlay />
    </ProviderRegistry>
  )
}
