import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
  forcedTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  forcedTheme,
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Prevent flash of unstyled content
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      forcedTheme={forcedTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      <div className="transition-smooth min-h-screen bg-background text-foreground">
        {children}
      </div>
    </NextThemesProvider>
  )
}

// Re-export useTheme from next-themes for convenience
export { useTheme } from 'next-themes'
