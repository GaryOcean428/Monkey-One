import * as React from 'react'

export interface FocusManagementOptions {
  /** Whether to trap focus within the element */
  trapFocus?: boolean
  /** Whether to restore focus to the previously focused element when unmounting */
  restoreFocus?: boolean
  /** Initial focus target selector */
  initialFocus?: string
  /** Elements to exclude from focus trap */
  excludeSelectors?: string[]
}

// Get all focusable elements within a container
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter((element) => {
      const htmlElement = element as HTMLElement
      return htmlElement.offsetParent !== null && // Not hidden
             !htmlElement.hasAttribute('aria-hidden') &&
             htmlElement.tabIndex !== -1
    }) as HTMLElement[]
}

export function useFocusManagement(options: FocusManagementOptions = {}) {
  const {
    trapFocus = false,
    restoreFocus = true,
    initialFocus,
    excludeSelectors = []
  } = options

  const containerRef = React.useRef<HTMLElement>(null)
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null)

  // Store the previously focused element
  React.useEffect(() => {
    if (restoreFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement
    }

    return () => {
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [restoreFocus])

  // Handle initial focus
  React.useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    let elementToFocus: HTMLElement | null = null

    if (initialFocus) {
      elementToFocus = container.querySelector(initialFocus) as HTMLElement
    }

    if (!elementToFocus) {
      const focusableElements = getFocusableElements(container)
      elementToFocus = focusableElements[0] || null
    }

    if (elementToFocus) {
      // Use requestAnimationFrame to ensure the element is rendered
      requestAnimationFrame(() => {
        elementToFocus.focus()
      })
    }
  }, [initialFocus])

  // Handle focus trap
  React.useEffect(() => {
    if (!trapFocus || !containerRef.current) return

    const container = containerRef.current

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements(container)
        .filter(element => {
          return !excludeSelectors.some(selector => 
            element.matches(selector)
          )
        })

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [trapFocus, excludeSelectors])

  return {
    ref: containerRef,
    moveFocus: (direction: 'next' | 'previous' | 'first' | 'last') => {
      if (!containerRef.current) return

      const focusableElements = getFocusableElements(containerRef.current)
      const currentIndex = focusableElements.findIndex(el => el === document.activeElement)

      let targetIndex: number
      switch (direction) {
        case 'next':
          targetIndex = (currentIndex + 1) % focusableElements.length
          break
        case 'previous':
          targetIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
          break
        case 'first':
          targetIndex = 0
          break
        case 'last':
          targetIndex = focusableElements.length - 1
          break
      }

      focusableElements[targetIndex]?.focus()
    }
  }
}

// Hook for managing keyboard navigation
export function useKeyboardNavigation(options: {
  onEscape?: () => void
  onEnter?: () => void
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
  enabled?: boolean
} = {}) {
  const { onEscape, onEnter, onArrowKeys, enabled = true } = options

  React.useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onEscape?.()
          break
        case 'Enter':
          onEnter?.()
          break
        case 'ArrowUp':
          event.preventDefault()
          onArrowKeys?.('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          onArrowKeys?.('down')
          break
        case 'ArrowLeft':
          onArrowKeys?.('left')
          break
        case 'ArrowRight':
          onArrowKeys?.('right')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onEscape, onEnter, onArrowKeys, enabled])
}

// Hook for screen reader announcements
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = React.useState('')
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set the announcement
    setAnnouncement('')
    
    // Use a short delay to ensure screen readers pick up the change
    timeoutRef.current = setTimeout(() => {
      setAnnouncement(message)
      
      // Clear the announcement after a delay to allow for re-announcements
      timeoutRef.current = setTimeout(() => {
        setAnnouncement('')
      }, 1000)
    }, 100)
  }, [])

  // Live region component
  const LiveRegion = React.useCallback(({ ariaLive = 'polite' }: { ariaLive?: 'polite' | 'assertive' }) => 
    React.createElement('div', {
      'aria-live': ariaLive,
      'aria-atomic': 'true',
      className: 'sr-only',
      role: 'status'
    }, announcement)
  , [announcement])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    announce,
    LiveRegion
  }
}

// Hook for accessible form validation
export function useAccessibleValidation() {
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const errorIds = React.useRef<Record<string, string>>({})

  const setFieldError = React.useCallback((fieldName: string, error: string) => {
    // Generate unique error ID
    if (!errorIds.current[fieldName]) {
      errorIds.current[fieldName] = `${fieldName}-error-${Math.random().toString(36).slice(2)}`
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))
  }, [])

  const clearFieldError = React.useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  const getFieldProps = React.useCallback((fieldName: string) => {
    const hasError = !!errors[fieldName]
    const errorId = errorIds.current[fieldName]

    return {
      'aria-invalid': hasError,
      'aria-describedby': hasError ? errorId : undefined
    }
  }, [errors])

  const getErrorProps = React.useCallback((fieldName: string) => {
    const errorId = errorIds.current[fieldName]
    
    return {
      id: errorId,
      role: 'alert',
      'aria-live': 'polite' as const
    }
  }, [])

  return {
    errors,
    setFieldError,
    clearFieldError,
    getFieldProps,
    getErrorProps
  }
}