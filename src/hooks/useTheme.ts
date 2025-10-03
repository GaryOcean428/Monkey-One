import * as React from 'react'
import { themeAnalytics } from '../lib/theme-analytics'

export type AccentColor =
  | 'blue'
  | 'emerald'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'cyan'
  | 'pink'
  | 'indigo'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ContrastMode = 'normal' | 'high'

export interface ThemePreferences {
  mode: ThemeMode
  accentColor: AccentColor
  contrast: ContrastMode
  timeBasedTheme: boolean
  reducedMotion: boolean
}

const defaultPreferences: ThemePreferences = {
  mode: 'system',
  accentColor: 'blue',
  contrast: 'normal',
  timeBasedTheme: false,
  reducedMotion: false,
}

const STORAGE_KEY = 'monkey-one-theme-preferences'

const accentColorMap: Record<AccentColor, { primary: string; primaryForeground: string }> = {
  blue: {
    primary: '214 95% 53%',
    primaryForeground: '210 20% 98%',
  },
  emerald: {
    primary: '142 76% 36%',
    primaryForeground: '210 20% 98%',
  },
  violet: {
    primary: '262 83% 58%',
    primaryForeground: '210 20% 98%',
  },
  rose: {
    primary: '330 81% 60%',
    primaryForeground: '210 20% 98%',
  },
  amber: {
    primary: '38 92% 50%',
    primaryForeground: '224 71.4% 4.1%',
  },
  cyan: {
    primary: '199 89% 48%',
    primaryForeground: '210 20% 98%',
  },
  pink: {
    primary: '324 71% 54%',
    primaryForeground: '210 20% 98%',
  },
  indigo: {
    primary: '231 48% 48%',
    primaryForeground: '210 20% 98%',
  },
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getTimeBasedTheme(): 'light' | 'dark' {
  const hour = new Date().getHours()
  // Dark theme from 6 PM to 6 AM
  return hour >= 18 || hour < 6 ? 'dark' : 'light'
}

function getReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function applyTheme(preferences: ThemePreferences) {
  const root = document.documentElement

  // Determine effective theme mode
  let effectiveMode: 'light' | 'dark'
  if (preferences.mode === 'system') {
    effectiveMode = getSystemTheme()
  } else if (preferences.timeBasedTheme) {
    effectiveMode = getTimeBasedTheme()
  } else {
    effectiveMode = preferences.mode as 'light' | 'dark'
  }

  // Apply theme mode
  root.classList.remove('light', 'dark')
  root.classList.add(effectiveMode)

  // Apply accent color
  const accentColors = accentColorMap[preferences.accentColor]
  root.style.setProperty('--primary', accentColors.primary)
  root.style.setProperty('--primary-foreground', accentColors.primaryForeground)

  // Apply contrast mode
  root.classList.remove('high-contrast')
  if (preferences.contrast === 'high') {
    root.classList.add('high-contrast')
  }

  // Apply reduced motion
  const reducedMotion = preferences.reducedMotion || getReducedMotionPreference()
  root.style.setProperty(
    '--animation-duration',
    reducedMotion ? '0ms' : 'var(--transition-duration)'
  )
  root.style.setProperty(
    '--animation-duration-fast',
    reducedMotion ? '0ms' : 'var(--transition-duration-fast)'
  )
  root.style.setProperty(
    '--animation-duration-slow',
    reducedMotion ? '0ms' : 'var(--transition-duration-slow)'
  )
}

function loadPreferences(): ThemePreferences {
  if (typeof window === 'undefined') return defaultPreferences

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultPreferences, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load theme preferences:', error)
  }
  return defaultPreferences
}

function savePreferences(preferences: ThemePreferences) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.warn('Failed to save theme preferences:', error)
  }
}

export function useTheme() {
  const [preferences, setPreferences] = React.useState<ThemePreferences>(defaultPreferences)
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load preferences on mount
  React.useEffect(() => {
    const loadedPreferences = loadPreferences()
    setPreferences(loadedPreferences)
    setIsLoaded(true)
    applyTheme(loadedPreferences)
  }, [])

  // Update theme when preferences change
  React.useEffect(() => {
    if (isLoaded) {
      applyTheme(preferences)
      savePreferences(preferences)
    }
  }, [preferences, isLoaded])

  // Listen for system theme changes
  React.useEffect(() => {
    if (!isLoaded) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (preferences.mode === 'system' || preferences.timeBasedTheme) {
        applyTheme(preferences)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [preferences.mode, preferences.timeBasedTheme, isLoaded])

  // Listen for reduced motion changes
  React.useEffect(() => {
    if (!isLoaded) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => applyTheme(preferences)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [preferences, isLoaded])

  // Time-based theme updates
  React.useEffect(() => {
    if (!isLoaded || !preferences.timeBasedTheme) return

    const checkTime = () => {
      applyTheme(preferences)
    }

    // Check every minute for time-based theme changes
    const interval = setInterval(checkTime, 60000)
    return () => clearInterval(interval)
  }, [preferences.timeBasedTheme, isLoaded])

  const updatePreferences = React.useCallback((updates: Partial<ThemePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }, [])

  const setAccentColor = React.useCallback(
    (accentColor: AccentColor) => {
      const oldColor = preferences.accentColor
      updatePreferences({ accentColor })
      themeAnalytics.trackAccentColorChange(oldColor, accentColor)
    },
    [preferences.accentColor, updatePreferences]
  )

  const setThemeMode = React.useCallback(
    (mode: ThemeMode) => {
      const oldMode = preferences.mode
      updatePreferences({ mode })
      themeAnalytics.trackThemeSwitch(oldMode, mode)
    },
    [preferences.mode, updatePreferences]
  )

  const setContrastMode = React.useCallback(
    (contrast: ContrastMode) => {
      const oldContrast = preferences.contrast
      updatePreferences({ contrast })
      themeAnalytics.trackContrastModeChange(oldContrast, contrast)
    },
    [preferences.contrast, updatePreferences]
  )

  const toggleTimeBasedTheme = React.useCallback(() => {
    updatePreferences({ timeBasedTheme: !preferences.timeBasedTheme })
    themeAnalytics.trackTimeBasedThemeToggle()
  }, [preferences.timeBasedTheme, updatePreferences])

  const toggleReducedMotion = React.useCallback(() => {
    updatePreferences({ reducedMotion: !preferences.reducedMotion })
  }, [preferences.reducedMotion, updatePreferences])

  const resetToDefaults = React.useCallback(() => {
    setPreferences(defaultPreferences)
  }, [])

  return {
    preferences,
    isLoaded,
    updatePreferences,
    setAccentColor,
    setThemeMode,
    setContrastMode,
    toggleTimeBasedTheme,
    toggleReducedMotion,
    resetToDefaults,
  }
}
