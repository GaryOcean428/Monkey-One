/**
 * Enhanced Design Token System
 * Provides dynamic theming, gradient generation, and accent customization
 */

export interface ThemeTokens {
  colors: {
    primary: string
    secondary: string
    accent: string
    muted: string
    background: string
    foreground: string
    destructive: string
    success: string
    warning: string
    info: string
  }
  gradients: {
    primary: string
    secondary: string
    accent: string
    subtle: string
    glass: string
  }
  shadows: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    glass: string
  }
  motion: {
    easeGentle: string
    easeSnappy: string
    easeSpring: string
    durationFast: string
    duration: string
    durationSlow: string
  }
}

export interface AccentConfig {
  hue: number
  saturation: number
  lightness: number
}

/**
 * Generate harmonious color variants from a base accent
 */
export function generateAccentVariants(accent: AccentConfig) {
  const { hue, saturation, lightness } = accent

  return {
    50: `hsl(${hue}, ${Math.max(saturation - 40, 10)}%, ${Math.min(lightness + 45, 95)}%)`,
    100: `hsl(${hue}, ${Math.max(saturation - 30, 15)}%, ${Math.min(lightness + 40, 90)}%)`,
    200: `hsl(${hue}, ${Math.max(saturation - 20, 20)}%, ${Math.min(lightness + 30, 85)}%)`,
    300: `hsl(${hue}, ${Math.max(saturation - 10, 25)}%, ${Math.min(lightness + 20, 80)}%)`,
    400: `hsl(${hue}, ${saturation}%, ${Math.min(lightness + 10, 75)}%)`,
    500: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    600: `hsl(${hue}, ${saturation}%, ${Math.max(lightness - 10, 25)}%)`,
    700: `hsl(${hue}, ${saturation}%, ${Math.max(lightness - 20, 20)}%)`,
    800: `hsl(${hue}, ${saturation}%, ${Math.max(lightness - 30, 15)}%)`,
    900: `hsl(${hue}, ${saturation}%, ${Math.max(lightness - 40, 10)}%)`,
    950: `hsl(${hue}, ${saturation}%, ${Math.max(lightness - 50, 5)}%)`,
  }
}

/**
 * Generate modern gradient combinations
 */
export function generateGradients(accent: AccentConfig, isDark = false) {
  const variants = generateAccentVariants(accent)
  const opacity = isDark ? '0.15' : '0.08'
  const heavyOpacity = isDark ? '0.25' : '0.12'

  return {
    primary: `linear-gradient(135deg, ${variants[500]}${opacity} 0%, ${variants[600]}${opacity} 100%)`,
    secondary: `linear-gradient(135deg, ${variants[400]}${opacity} 0%, ${variants[700]}${opacity} 100%)`,
    accent: `linear-gradient(135deg, ${variants[500]} 0%, ${variants[600]} 100%)`,
    subtle: `linear-gradient(135deg, ${variants[100]}${opacity} 0%, ${variants[300]}${opacity} 100%)`,
    glass: `linear-gradient(135deg, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,${heavyOpacity}) 100%)`,
    mesh: `
      radial-gradient(at 40% 20%, ${variants[500]}${opacity} 0px, transparent 50%),
      radial-gradient(at 80% 0%, ${variants[600]}${opacity} 0px, transparent 50%),
      radial-gradient(at 0% 50%, ${variants[400]}${opacity} 0px, transparent 50%),
      radial-gradient(at 80% 50%, ${variants[700]}${opacity} 0px, transparent 50%),
      radial-gradient(at 0% 100%, ${variants[300]}${opacity} 0px, transparent 50%),
      radial-gradient(at 80% 100%, ${variants[800]}${opacity} 0px, transparent 50%)
    `,
  }
}

/**
 * Predefined accent color presets
 */
export const accentPresets = {
  blue: { hue: 220, saturation: 70, lightness: 50 },
  purple: { hue: 260, saturation: 70, lightness: 50 },
  emerald: { hue: 150, saturation: 65, lightness: 45 },
  orange: { hue: 25, saturation: 80, lightness: 55 },
  pink: { hue: 320, saturation: 70, lightness: 60 },
  teal: { hue: 180, saturation: 70, lightness: 45 },
  indigo: { hue: 240, saturation: 75, lightness: 55 },
  rose: { hue: 350, saturation: 75, lightness: 60 },
  amber: { hue: 45, saturation: 85, lightness: 55 },
  cyan: { hue: 190, saturation: 75, lightness: 50 },
} as const

/**
 * Time-based accent adjustments
 */
export function getTimeBasedAccent(baseAccent: AccentConfig): AccentConfig {
  const hour = new Date().getHours()

  // Morning (6-11): Warmer, lighter
  if (hour >= 6 && hour < 12) {
    return {
      ...baseAccent,
      hue: Math.max(baseAccent.hue - 15, 0),
      lightness: Math.min(baseAccent.lightness + 10, 70),
    }
  }

  // Evening (18-23): Cooler, slightly darker
  if (hour >= 18 && hour < 24) {
    return {
      ...baseAccent,
      hue: Math.min(baseAccent.hue + 15, 360),
      lightness: Math.max(baseAccent.lightness - 5, 40),
    }
  }

  // Night (0-5): Much cooler, darker
  if (hour >= 0 && hour < 6) {
    return {
      ...baseAccent,
      hue: Math.min(baseAccent.hue + 30, 360),
      lightness: Math.max(baseAccent.lightness - 15, 35),
      saturation: Math.max(baseAccent.saturation - 10, 50),
    }
  }

  // Default for midday
  return baseAccent
}

/**
 * Apply dynamic accent to CSS custom properties
 */
export function applyAccentToCSSVars(accent: AccentConfig, isDark = false) {
  const variants = generateAccentVariants(accent)
  const gradients = generateGradients(accent, isDark)

  const root = document.documentElement

  // Apply color variants
  Object.entries(variants).forEach(([key, value]) => {
    root.style.setProperty(`--accent-${key}`, value)
  })

  // Apply gradients
  Object.entries(gradients).forEach(([key, value]) => {
    root.style.setProperty(`--gradient-${key}`, value)
  })

  // Update primary accent
  root.style.setProperty('--accent', variants[500])
  root.style.setProperty('--accent-foreground', isDark ? variants[100] : variants[900])
}

/**
 * Get contrast-safe text color for a given background
 */
export function getContrastColor(
  backgroundColor: string,
  lightColor = '#ffffff',
  darkColor = '#000000'
): string {
  // Simple contrast calculation - could be enhanced with WCAG AA compliance
  const color = backgroundColor.replace('#', '')
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? darkColor : lightColor
}
