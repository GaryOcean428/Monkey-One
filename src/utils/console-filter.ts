/**
 * Console Filter Utility
 * 
 * Filters out known deprecation warnings from third-party libraries
 * that don't affect functionality in production
 */

const FILTERED_WARNINGS = [
  // Zustand deprecation warning - we're already using named imports
  'Default export is deprecated',
  'Instead use `import { create } from \'zustand\'`',
]

/**
 * Check if a message should be filtered
 */
function shouldFilterMessage(args: any[]): boolean {
  const message = args.join(' ')
  return FILTERED_WARNINGS.some(warning => message.includes(warning))
}

/**
 * Initialize console filtering for production
 * Only filters known benign warnings that don't affect functionality
 */
export function initConsoleFilter(): void {
  // Only filter in production to avoid hiding actual issues in development
  if (import.meta.env.PROD) {
    const originalWarn = console.warn

    console.warn = (...args: any[]) => {
      if (shouldFilterMessage(args)) {
        return // Suppress this warning
      }
      originalWarn.apply(console, args)
    }
  }
}
