import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './components/ThemeProvider'
import { ModalProvider } from './contexts/ModalContext'
import { TooltipProvider } from './components/ui/tooltip'
import { Login } from './components/Auth/Login'
import { Dashboard } from './components/Dashboard'
import { PrivateRoute } from './components/Auth/PrivateRoute'
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
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <Toaster position="top-right" />
                <Routes>
                  <Route path="/auth/login" element={<Login />} />
                  <Route
                    path="/*"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          </TooltipProvider>
        </ModalProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
