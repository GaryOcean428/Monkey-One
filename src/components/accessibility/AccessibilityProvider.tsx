import * as React from 'react'
import { cn } from '../../lib/utils'
import { usePrefersReducedMotion } from '../../lib/performance'

export interface AccessibilityContextValue {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void
  focusManagement: {
    trapFocus: (element: HTMLElement) => () => void
    restoreFocus: (element: HTMLElement | null) => void
    manageFocusReturn: () => void
  }
  reducedMotion: boolean
  announcements: string[]
}

const AccessibilityContext = React.createContext<AccessibilityContextValue | null>(null)

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [announcements, setAnnouncements] = React.useState<string[]>([])
  const reducedMotion = usePrefersReducedMotion()
  const previousActiveElement = React.useRef<HTMLElement | null>(null)

  const announceMessage = React.useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      setAnnouncements(prev => [...prev, message])

      // Clean up old announcements
      setTimeout(() => {
        setAnnouncements(prev => prev.filter(announcement => announcement !== message))
      }, 1000)
    },
    []
  )

  const focusManagement = React.useMemo(
    () => ({
      trapFocus: (element: HTMLElement) => {
        const focusableElements = element.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstFocusable = focusableElements[0] as HTMLElement
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key !== 'Tab') return

          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              lastFocusable?.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastFocusable) {
              firstFocusable?.focus()
              e.preventDefault()
            }
          }
        }

        element.addEventListener('keydown', handleTabKey)
        firstFocusable?.focus()

        return () => {
          element.removeEventListener('keydown', handleTabKey)
        }
      },

      restoreFocus: (element: HTMLElement | null) => {
        if (element) {
          element.focus()
        }
      },

      manageFocusReturn: () => {
        previousActiveElement.current = document.activeElement as HTMLElement
        return () => {
          if (previousActiveElement.current) {
            previousActiveElement.current.focus()
          }
        }
      },
    }),
    []
  )

  const value: AccessibilityContextValue = {
    announceMessage,
    focusManagement,
    reducedMotion,
    announcements,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
    </AccessibilityContext.Provider>
  )
}

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'skip-link sr-only focus:not-sr-only',
        'bg-primary text-primary-foreground fixed top-4 left-4 z-[9999]',
        'rounded-md px-4 py-2 font-medium transition-all',
        'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
        className
      )}
    >
      {children}
    </a>
  )
}

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export function VisuallyHidden({ children, className, ...props }: VisuallyHiddenProps) {
  return (
    <span className={cn('sr-only', className)} {...props}>
      {children}
    </span>
  )
}

interface FocusTrapProps {
  children: React.ReactNode
  active?: boolean
  restoreFocus?: boolean
}

export function FocusTrap({ children, active = true, restoreFocus = true }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { focusManagement } = useAccessibility()

  React.useEffect(() => {
    if (!active || !containerRef.current) return

    const restoreFocusRef = restoreFocus ? focusManagement.manageFocusReturn() : null
    const releaseTrap = focusManagement.trapFocus(containerRef.current)

    return () => {
      releaseTrap()
      restoreFocusRef?.()
    }
  }, [active, focusManagement, restoreFocus])

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  )
}

interface AnnouncementProps {
  children: React.ReactNode
  priority?: 'polite' | 'assertive'
  condition?: boolean
}

export function Announcement({
  children,
  priority = 'polite',
  condition = true,
}: AnnouncementProps) {
  const { announceMessage } = useAccessibility()

  React.useEffect(() => {
    if (condition && typeof children === 'string') {
      announceMessage(children, priority)
    }
  }, [children, priority, condition, announceMessage])

  return null
}

interface ReducedMotionProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ReducedMotionProvider({ children, fallback }: ReducedMotionProps) {
  const { reducedMotion } = useAccessibility()

  return reducedMotion && fallback ? <>{fallback}</> : <>{children}</>
}

interface LandmarkProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: 'main' | 'nav' | 'section' | 'article' | 'aside' | 'header' | 'footer'
  label?: string
}

export function Landmark({
  children,
  as: Component = 'section',
  label,
  className,
  ...props
}: LandmarkProps) {
  return (
    <Component className={className} aria-label={label} {...props}>
      {children}
    </Component>
  )
}

interface KeyboardNavigationProps {
  children: React.ReactNode
  onEscape?: () => void
  onEnter?: () => void
  onSpace?: () => void
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
}

export function KeyboardNavigation({
  children,
  onEscape,
  onEnter,
  onSpace,
  onArrowKeys,
}: KeyboardNavigationProps) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onEscape?.()
          break
        case 'Enter':
          onEnter?.()
          break
        case ' ':
          e.preventDefault()
          onSpace?.()
          break
        case 'ArrowUp':
          e.preventDefault()
          onArrowKeys?.('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          onArrowKeys?.('down')
          break
        case 'ArrowLeft':
          e.preventDefault()
          onArrowKeys?.('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          onArrowKeys?.('right')
          break
      }
    },
    [onEscape, onEnter, onSpace, onArrowKeys]
  )

  return <div onKeyDown={handleKeyDown}>{children}</div>
}

interface AccessibleIconProps {
  children: React.ReactNode
  label: string
  decorative?: boolean
}

export function AccessibleIcon({ children, label, decorative = false }: AccessibleIconProps) {
  if (decorative) {
    return <span aria-hidden="true">{children}</span>
  }

  return (
    <span role="img" aria-label={label}>
      {children}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  )
}

/**
 * Hook for managing accessible form validation
 */
export function useAccessibleForm() {
  const { announceMessage } = useAccessibility()
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validateField = React.useCallback(
    (fieldName: string, value: string, validator: (value: string) => string | null) => {
      const error = validator(value)

      setErrors(prev => {
        const newErrors = { ...prev }
        if (error) {
          newErrors[fieldName] = error
        } else {
          delete newErrors[fieldName]
        }
        return newErrors
      })

      if (error) {
        announceMessage(`${fieldName}: ${error}`, 'assertive')
      }

      return !error
    },
    [announceMessage]
  )

  const getFieldProps = React.useCallback(
    (fieldName: string) => ({
      'aria-invalid': !!errors[fieldName],
      'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined,
    }),
    [errors]
  )

  const getErrorProps = React.useCallback(
    (fieldName: string) => ({
      id: `${fieldName}-error`,
      role: 'alert',
      'aria-live': 'polite' as const,
    }),
    []
  )

  return {
    errors,
    validateField,
    getFieldProps,
    getErrorProps,
    hasErrors: Object.keys(errors).length > 0,
  }
}
