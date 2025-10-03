import * as React from 'react'
import { NavBar } from '@/components/navbar'
import { Sidebar } from '@/components/Sidebar'
import { ThemeProvider } from '@/theme/theme-provider'
import { useSidebarStore } from '@/components/sidebarStore'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const { isOpen } = useSidebarStore()

  React.useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="relative flex min-h-screen flex-col antialiased">
        <NavBar />
        <div className="flex flex-1">
          <Sidebar />
          <main
            className={cn(
              'flex-1 overflow-x-hidden px-4 pt-4 pb-8 transition-all duration-300 ease-in-out',
              'sm:px-6 sm:pt-6',
              'md:px-8 md:pt-8',
              isOpen
                ? 'pl-[calc(1rem+256px)] sm:pl-[calc(1.5rem+256px)] md:pl-[calc(2rem+256px)]'
                : 'pl-4 sm:pl-6 md:pl-8'
            )}
          >
            <div className="animate-fade-in mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
