import * as React from 'react'
import { useTheme } from '../../hooks/useTheme'

export interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isLoaded } = useTheme()

  // Don't render children until theme is loaded to prevent flash
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}

// Context for theme awareness (optional, for components that need theme state)
export const ThemeContext = React.createContext<{
  isDark: boolean
  isHighContrast: boolean
  accentColor: string
}>({
  isDark: false,
  isHighContrast: false,
  accentColor: 'blue'
})

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = React.useState(false)
  const [isHighContrast, setIsHighContrast] = React.useState(false)
  const [accentColor, setAccentColor] = React.useState('blue')

  React.useEffect(() => {
    const checkTheme = () => {
      const root = document.documentElement
      setIsDark(root.classList.contains('dark'))
      setIsHighContrast(root.classList.contains('high-contrast'))
      
      // Get current accent color from CSS variable
      const primaryColor = window.getComputedStyle(root).getPropertyValue('--primary').trim()
      // Map back to color name (simplified)
      if (primaryColor.includes('142')) setAccentColor('emerald')
      else if (primaryColor.includes('262')) setAccentColor('violet')
      else if (primaryColor.includes('330')) setAccentColor('rose')
      else if (primaryColor.includes('38')) setAccentColor('amber')
      else if (primaryColor.includes('199')) setAccentColor('cyan')
      else if (primaryColor.includes('324')) setAccentColor('pink')
      else if (primaryColor.includes('231')) setAccentColor('indigo')
      else setAccentColor('blue')
    }

    // Initial check
    checkTheme()

    // Watch for class changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, isHighContrast, accentColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  return React.useContext(ThemeContext)
}