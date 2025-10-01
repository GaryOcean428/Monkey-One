// Forward declarations to avoid circular dependency
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

export interface ThemeAnalytics {
  themeSwitches: number
  accentColorChanges: number
  contrastModeChanges: number
  timeBasedThemeToggled: number
  lastUsed: string
  favoriteAccentColor: AccentColor
  preferredThemeMode: ThemeMode
  averageSessionDuration: number
}

const ANALYTICS_KEY = 'monkey-one-theme-analytics'

function getDefaultAnalytics(): ThemeAnalytics {
  return {
    themeSwitches: 0,
    accentColorChanges: 0,
    contrastModeChanges: 0,
    timeBasedThemeToggled: 0,
    lastUsed: new Date().toISOString(),
    favoriteAccentColor: 'blue',
    preferredThemeMode: 'system',
    averageSessionDuration: 0,
  }
}

function loadAnalytics(): ThemeAnalytics {
  if (typeof window === 'undefined') return getDefaultAnalytics()

  try {
    const stored = window.localStorage.getItem(ANALYTICS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...getDefaultAnalytics(), ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load theme analytics:', error)
  }
  return getDefaultAnalytics()
}

function saveAnalytics(analytics: ThemeAnalytics) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics))
  } catch (error) {
    console.warn('Failed to save theme analytics:', error)
  }
}

export class ThemeAnalyticsTracker {
  private analytics: ThemeAnalytics
  private sessionStart: number
  private accentColorHistory: Record<AccentColor, number> = {
    blue: 0,
    emerald: 0,
    violet: 0,
    rose: 0,
    amber: 0,
    cyan: 0,
    pink: 0,
    indigo: 0,
  }
  private themeModeHistory: Record<ThemeMode, number> = {
    light: 0,
    dark: 0,
    system: 0,
  }

  constructor() {
    this.analytics = loadAnalytics()
    this.sessionStart = Date.now()
    this.loadUsageHistory()
  }

  private loadUsageHistory() {
    if (typeof window === 'undefined') return

    try {
      const colorHistory = window.localStorage.getItem('monkey-one-accent-color-history')
      if (colorHistory) {
        this.accentColorHistory = { ...this.accentColorHistory, ...JSON.parse(colorHistory) }
      }

      const themeHistory = window.localStorage.getItem('monkey-one-theme-mode-history')
      if (themeHistory) {
        this.themeModeHistory = { ...this.themeModeHistory, ...JSON.parse(themeHistory) }
      }
    } catch (error) {
      console.warn('Failed to load usage history:', error)
    }
  }

  private saveUsageHistory() {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(
        'monkey-one-accent-color-history',
        JSON.stringify(this.accentColorHistory)
      )
      window.localStorage.setItem(
        'monkey-one-theme-mode-history',
        JSON.stringify(this.themeModeHistory)
      )
    } catch (error) {
      console.warn('Failed to save usage history:', error)
    }
  }

  trackThemeSwitch(from: ThemeMode, to: ThemeMode) {
    if (from !== to) {
      this.analytics.themeSwitches++
      this.themeModeHistory[to]++
      this.updatePreferredThemeMode()
      this.save()
    }
  }

  trackAccentColorChange(from: AccentColor, to: AccentColor) {
    if (from !== to) {
      this.analytics.accentColorChanges++
      this.accentColorHistory[to]++
      this.updateFavoriteAccentColor()
      this.save()
    }
  }

  trackContrastModeChange(from: ContrastMode, to: ContrastMode) {
    if (from !== to) {
      this.analytics.contrastModeChanges++
      this.save()
    }
  }

  trackTimeBasedThemeToggle() {
    this.analytics.timeBasedThemeToggled++
    this.save()
  }

  private updateFavoriteAccentColor() {
    const maxColor = Object.entries(this.accentColorHistory).reduce((a, b) =>
      this.accentColorHistory[a[0] as AccentColor] > this.accentColorHistory[b[0] as AccentColor]
        ? a
        : b
    )
    this.analytics.favoriteAccentColor = maxColor[0] as AccentColor
  }

  private updatePreferredThemeMode() {
    const maxTheme = Object.entries(this.themeModeHistory).reduce((a, b) =>
      this.themeModeHistory[a[0] as ThemeMode] > this.themeModeHistory[b[0] as ThemeMode] ? a : b
    )
    this.analytics.preferredThemeMode = maxTheme[0] as ThemeMode
  }

  private calculateSessionDuration() {
    const duration = Date.now() - this.sessionStart
    const currentAvg = this.analytics.averageSessionDuration
    const sessions = this.analytics.themeSwitches + 1 // +1 for current session
    this.analytics.averageSessionDuration = (currentAvg * (sessions - 1) + duration) / sessions
  }

  endSession() {
    this.calculateSessionDuration()
    this.analytics.lastUsed = new Date().toISOString()
    this.save()
  }

  private save() {
    saveAnalytics(this.analytics)
    this.saveUsageHistory()
  }

  getAnalytics(): ThemeAnalytics {
    return { ...this.analytics }
  }

  getUsageInsights() {
    // We track total interactions for analytics but don't need to use these specific totals
    const totalInteractions =
      this.analytics.themeSwitches +
      this.analytics.accentColorChanges +
      this.analytics.contrastModeChanges

    return {
      totalInteractions,
      colorUsageDistribution: this.accentColorHistory,
      themeUsageDistribution: this.themeModeHistory,
      mostUsedColor: this.analytics.favoriteAccentColor,
      mostUsedTheme: this.analytics.preferredThemeMode,
      engagementLevel: this.calculateEngagementLevel(),
      recommendations: this.generateRecommendations(),
    }
  }

  private calculateEngagementLevel(): 'low' | 'medium' | 'high' {
    const total = this.analytics.themeSwitches + this.analytics.accentColorChanges
    if (total < 5) return 'low'
    if (total < 15) return 'medium'
    return 'high'
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const insights = this.getUsageInsights()

    if (insights.engagementLevel === 'high') {
      recommendations.push('You love customizing! Consider exploring time-based themes.')
    }

    if (this.analytics.contrastModeChanges === 0) {
      recommendations.push('Try high-contrast mode for better accessibility.')
    }

    if (this.analytics.timeBasedThemeToggled === 0) {
      recommendations.push('Enable time-based themes for automatic dark mode at night.')
    }

    const colorVariety = Object.values(this.accentColorHistory).filter(count => count > 0).length
    if (colorVariety <= 2) {
      recommendations.push('Experiment with different accent colors to find your perfect match!')
    }

    return recommendations
  }

  reset() {
    this.analytics = getDefaultAnalytics()
    this.accentColorHistory = {
      blue: 0,
      emerald: 0,
      violet: 0,
      rose: 0,
      amber: 0,
      cyan: 0,
      pink: 0,
      indigo: 0,
    }
    this.themeModeHistory = { light: 0, dark: 0, system: 0 }
    this.save()
  }
}

// Singleton instance
export const themeAnalytics = new ThemeAnalyticsTracker()

// Hook for React components
export function useThemeAnalytics() {
  return {
    analytics: themeAnalytics.getAnalytics(),
    insights: themeAnalytics.getUsageInsights(),
    reset: () => themeAnalytics.reset(),
  }
}
