import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState, useCallback } from 'react'
import { 
  AccentConfig, 
  accentPresets, 
  applyAccentToCSSVars, 
  getTimeBasedAccent 
} from './tokens'

const ACCENT_STORAGE_KEY = 'monkey-one-accent'
const TIME_BASED_THEME_KEY = 'monkey-one-time-based'

export interface UseThemeReturn {
  theme: string | undefined
  setTheme: (theme: string) => void
  resolvedTheme: string | undefined
  accent: AccentConfig
  setAccent: (accent: AccentConfig | keyof typeof accentPresets) => void
  timeBasedTheme: boolean
  setTimeBasedTheme: (enabled: boolean) => void
  isDark: boolean
  accentPresets: typeof accentPresets
}

/**
 * Enhanced theme hook with accent customization and time-based theming
 */
export function useTheme(): UseThemeReturn {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [accent, setAccentState] = useState<AccentConfig>(accentPresets.blue)
  const [timeBasedTheme, setTimeBasedThemeState] = useState(false)
  const [mounted, setMounted] = useState(false)

  const isDark = resolvedTheme === 'dark'

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY)
      if (savedAccent) {
        setAccentState(JSON.parse(savedAccent))
      }

      const savedTimeBasedTheme = localStorage.getItem(TIME_BASED_THEME_KEY)
      if (savedTimeBasedTheme) {
        setTimeBasedThemeState(JSON.parse(savedTimeBasedTheme))
      }
    } catch (error) {
      console.warn('Failed to load theme preferences from localStorage:', error)
    }

    setMounted(true)
  }, [])

  // Apply accent colors when theme or accent changes
  useEffect(() => {
    if (!mounted) return

    const currentAccent = timeBasedTheme ? getTimeBasedAccent(accent) : accent
    applyAccentToCSSVars(currentAccent, isDark)
  }, [accent, isDark, timeBasedTheme, mounted])

  // Update time-based theme every hour
  useEffect(() => {
    if (!timeBasedTheme || !mounted) return

    const updateTimeBasedAccent = () => {
      const currentAccent = getTimeBasedAccent(accent)
      applyAccentToCSSVars(currentAccent, isDark)
    }

    // Update immediately
    updateTimeBasedAccent()

    // Set up interval to update every hour
    const interval = setInterval(updateTimeBasedAccent, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [accent, isDark, timeBasedTheme, mounted])

  const setAccent = useCallback((newAccent: AccentConfig | keyof typeof accentPresets) => {
    const accentConfig = typeof newAccent === 'string' 
      ? accentPresets[newAccent] 
      : newAccent

    setAccentState(accentConfig)
    
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, JSON.stringify(accentConfig))
    } catch (error) {
      console.warn('Failed to save accent to localStorage:', error)
    }
  }, [])

  const setTimeBasedTheme = useCallback((enabled: boolean) => {
    setTimeBasedThemeState(enabled)
    
    try {
      localStorage.setItem(TIME_BASED_THEME_KEY, JSON.stringify(enabled))
    } catch (error) {
      console.warn('Failed to save time-based theme preference to localStorage:', error)
    }
  }, [])

  return {
    theme,
    setTheme,
    resolvedTheme,
    accent,
    setAccent,
    timeBasedTheme,
    setTimeBasedTheme,
    isDark,
    accentPresets
  }
}