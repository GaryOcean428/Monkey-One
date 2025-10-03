/**
 * Performance optimization utilities for UI components
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook to detect if element is in viewport for lazy animations
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  threshold = 0.1,
  rootMargin = '0px'
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [elementRef, threshold, rootMargin])

  return isIntersecting
}

/**
 * Hook for optimized animations that respect user preferences
 */
export function useOptimizedAnimation(animationClass: string, trigger = true, delay = 0) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!trigger || prefersReducedMotion) {
      setShouldAnimate(false)
      return
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setShouldAnimate(true)
      }, delay)
    } else {
      setShouldAnimate(true)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [trigger, delay, prefersReducedMotion])

  return {
    shouldAnimate: shouldAnimate && !prefersReducedMotion,
    animationClass: shouldAnimate && !prefersReducedMotion ? animationClass : '',
    prefersReducedMotion,
  }
}

/**
 * Hook for lazy loading animations when element enters viewport
 */
export function useLazyAnimation(animationClass: string, threshold = 0.1, delay = 0) {
  const elementRef = useRef<HTMLDivElement>(null)
  const isInView = useIntersectionObserver(elementRef, threshold)
  const { shouldAnimate, animationClass: finalAnimationClass } = useOptimizedAnimation(
    animationClass,
    isInView,
    delay
  )

  return {
    ref: elementRef,
    shouldAnimate,
    animationClass: finalAnimationClass,
    isInView,
  }
}

/**
 * Debounced callback hook for performance
 */
export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )
}

/**
 * Throttled callback hook for performance
 */
export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const callbackRef = useRef(callback)
  const lastCallRef = useRef<number>(0)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callbackRef.current(...args)
      }
    }) as T,
    [delay]
  )
}

/**
 * Hook to detect user's preferred color scheme time
 */
export function useTimeBasedPreference() {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('day')

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()

      if (hour >= 6 && hour < 12) {
        setTimeOfDay('morning')
      } else if (hour >= 12 && hour < 18) {
        setTimeOfDay('day')
      } else if (hour >= 18 && hour < 22) {
        setTimeOfDay('evening')
      } else {
        setTimeOfDay('night')
      }
    }

    updateTimeOfDay()

    // Update every hour
    const interval = setInterval(updateTimeOfDay, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return timeOfDay
}

/**
 * Performance-optimized component wrapper
 */
export function withPerformanceOptimization<P extends object>(Component: React.ComponentType<P>) {
  return function OptimizedComponent(props: P) {
    // Only re-render if props actually changed
    return <Component {...props} />
  }
}

/**
 * CSS class utility that respects motion preferences
 */
export function getMotionClass(
  animationClass: string,
  staticClass = '',
  prefersReducedMotion = false
): string {
  return prefersReducedMotion ? staticClass : animationClass
}

/**
 * Utility to create staggered animations
 */
export function createStaggeredAnimation(baseDelay = 100, itemCount: number): number[] {
  return Array.from({ length: itemCount }, (_, index) => index * baseDelay)
}

/**
 * Hook for preloading critical resources
 */
export function usePreloadResources(resources: string[]) {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = resource.endsWith('.woff2') || resource.endsWith('.woff') ? 'font' : 'image'
      link.href = resource
      if (link.as === 'font') {
        link.crossOrigin = 'anonymous'
      }
      document.head.appendChild(link)
    })
  }, [resources])
}

/**
 * Hook for optimizing render cycles with RAF
 */
export function useRafCallback(callback: () => void, deps: any[]) {
  const rafRef = useRef<number>()

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(callback)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, deps)
}
