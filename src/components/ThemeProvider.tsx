import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Helper function to check if we're in a test environment
const isTestEnvironment = () => {
  return typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
}

// Helper function to safely check system preference
const checkSystemPreference = (): boolean => {
  try {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    )
  } catch (error) {
    return true // Default to dark theme if error
  }
}

// Helper function to safely access localStorage
const getStoredTheme = (): Theme | null => {
  try {
    return typeof localStorage !== 'undefined'
      ? (localStorage.getItem('theme') as Theme | null)
      : null
  } catch (error) {
    return null
  }
}

// Helper function to safely set localStorage
const setStoredTheme = (theme: Theme): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
  } catch (error) {
    // Silently fail in test environment
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    if (isTestEnvironment()) {
      setTheme('dark')
      return
    }

    const systemPrefersDark = checkSystemPreference()
    const savedTheme = getStoredTheme()
    setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'))
  }, [])

  useEffect(() => {
    if (isTestEnvironment()) {
      return
    }

    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme)
      }
      setStoredTheme(theme)
    } catch (error) {
      // Silently fail in test environment
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
