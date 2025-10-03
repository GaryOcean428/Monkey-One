import * as React from 'react'

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Whether to trigger only once and then disconnect */
  triggerOnce?: boolean
  /** Whether to start observing immediately */
  enabled?: boolean
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}) {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
    triggerOnce = false,
    enabled = true,
  } = options

  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)
  const targetRef = React.useRef<HTMLElement>(null)
  const observerRef = React.useRef<IntersectionObserver | null>(null)

  React.useEffect(() => {
    if (!enabled || !targetRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries
        const isVisible = entry.isIntersecting

        setIsIntersecting(isVisible)

        if (isVisible && !hasIntersected) {
          setHasIntersected(true)

          if (triggerOnce) {
            observer.disconnect()
          }
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    )

    observer.observe(targetRef.current)
    observerRef.current = observer

    return () => {
      observer.disconnect()
    }
  }, [root, rootMargin, threshold, triggerOnce, enabled, hasIntersected])

  const disconnect = React.useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
  }, [])

  return {
    ref: targetRef,
    isIntersecting,
    hasIntersected,
    disconnect,
  }
}

// Hook for animating elements when they come into view
export function useAnimateOnIntersect(options: UseIntersectionObserverOptions = {}) {
  const { isIntersecting, hasIntersected, ref } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    ...options,
  })

  const shouldAnimate = hasIntersected || isIntersecting

  return {
    ref,
    shouldAnimate,
    isVisible: isIntersecting,
    className: shouldAnimate
      ? 'animate-fade-in-up opacity-100 translate-y-0'
      : 'opacity-0 translate-y-4',
  }
}

// Hook for lazy loading content
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  options: UseIntersectionObserverOptions = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    ...options,
  })

  React.useEffect(() => {
    if (isIntersecting && !data && !loading) {
      setLoading(true)
      setError(null)

      loadFn()
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false))
    }
  }, [isIntersecting, data, loading, loadFn])

  return {
    ref,
    data,
    loading,
    error,
    isIntersecting,
  }
}
