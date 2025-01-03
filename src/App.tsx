import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './components/ThemeProvider'
import { ModalProvider } from './contexts/ModalContext'
import { TooltipProvider } from './components/ui/tooltip'
import { Sidebar } from './components/Sidebar'

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ModalProvider>
          <TooltipProvider>
            <div className="flex h-screen overflow-hidden bg-background">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                <div className="min-h-full p-4">
                  <Toaster position="top-right" />
                  <Outlet />
                </div>
              </main>
            </div>
          </TooltipProvider>
        </ModalProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
