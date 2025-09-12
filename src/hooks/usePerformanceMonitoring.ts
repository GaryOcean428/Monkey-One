import * as React from 'react'

export interface PerformanceMetrics {
  /** Largest Contentful Paint */
  lcp?: number
  /** First Input Delay */
  fid?: number
  /** Cumulative Layout Shift */
  cls?: number
  /** First Contentful Paint */
  fcp?: number
  /** Time to First Byte */
  ttfb?: number
  /** Navigation timing */
  navigationTiming?: PerformanceNavigationTiming
  /** Memory usage (if available) */
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number }
  fid: { good: number; needsImprovement: number }
  cls: { good: number; needsImprovement: number }
  fcp: { good: number; needsImprovement: number }
  ttfb: { good: number; needsImprovement: number }
}

// Core Web Vitals thresholds (in milliseconds, except CLS)
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 }
}

function getPerformanceRating(value: number, threshold: { good: number; needsImprovement: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

export function usePerformanceMonitoring(thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS) {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({})
  const [isSupported, setIsSupported] = React.useState(false)

  React.useEffect(() => {
    // Check for Performance Observer support
    const supported = typeof window !== 'undefined' && 
                     'PerformanceObserver' in window &&
                     'performance' in window

    setIsSupported(supported)
    
    if (!supported) return

    let lcpObserver: PerformanceObserver | null = null
    let fidObserver: PerformanceObserver | null = null
    let clsObserver: PerformanceObserver | null = null

    try {
      // Observe LCP (Largest Contentful Paint)
      lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
        
        setMetrics(prev => ({
          ...prev,
          lcp: lastEntry.startTime
        }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Observe FID (First Input Delay)
      fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          setMetrics(prev => ({
            ...prev,
            fid: entry.processingStart - entry.startTime
          }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Observe CLS (Cumulative Layout Shift)
      let clsValue = 0
      clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value
          }
        }
        
        setMetrics(prev => ({
          ...prev,
          cls: clsValue
        }))
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Get FCP (First Contentful Paint) from navigation timing
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')

      setMetrics(prev => ({
        ...prev,
        fcp: fcpEntry?.startTime,
        ttfb: navTiming.responseStart - navTiming.requestStart,
        navigationTiming: navTiming
      }))

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memory: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit
          }
        }))
      }

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error)
    }

    return () => {
      lcpObserver?.disconnect()
      fidObserver?.disconnect()
      clsObserver?.disconnect()
    }
  }, [])

  const getMetricRating = React.useCallback((metric: keyof PerformanceMetrics) => {
    const value = metrics[metric] as number
    if (value === undefined) return null
    
    const threshold = thresholds[metric as keyof PerformanceThresholds]
    if (!threshold) return null
    
    return getPerformanceRating(value, threshold)
  }, [metrics, thresholds])

  const getCoreWebVitals = React.useCallback(() => {
    return {
      lcp: {
        value: metrics.lcp,
        rating: getMetricRating('lcp'),
        threshold: thresholds.lcp
      },
      fid: {
        value: metrics.fid,
        rating: getMetricRating('fid'),
        threshold: thresholds.fid
      },
      cls: {
        value: metrics.cls,
        rating: getMetricRating('cls'),
        threshold: thresholds.cls
      }
    }
  }, [metrics, getMetricRating, thresholds])

  const getPerformanceScore = React.useCallback(() => {
    const vitals = getCoreWebVitals()
    const ratings = Object.values(vitals)
      .map(vital => vital.rating)
      .filter(rating => rating !== null)
    
    if (ratings.length === 0) return null
    
    const scores = ratings.map(rating => {
      switch (rating) {
        case 'good': return 100
        case 'needs-improvement': return 50
        case 'poor': return 0
        default: return 0
      }
    })
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }, [getCoreWebVitals])

  return {
    metrics,
    isSupported,
    getMetricRating,
    getCoreWebVitals,
    getPerformanceScore
  }
}

// Hook for measuring custom performance marks
export function usePerformanceMark(name: string) {
  const mark = React.useCallback((label?: string) => {
    if (typeof window === 'undefined' || !('performance' in window)) return
    
    const markName = label ? `${name}-${label}` : name
    performance.mark(markName)
  }, [name])

  const measure = React.useCallback((startMark?: string, endMark?: string) => {
    if (typeof window === 'undefined' || !('performance' in window)) return null
    
    try {
      const measureName = `${name}-measure`
      performance.measure(measureName, startMark, endMark)
      
      const measures = performance.getEntriesByName(measureName, 'measure')
      return measures[measures.length - 1]?.duration || null
    } catch (error) {
      console.warn('Performance measure failed:', error)
      return null
    }
  }, [name])

  const clear = React.useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return
    
    performance.clearMarks(name)
    performance.clearMeasures(`${name}-measure`)
  }, [name])

  return { mark, measure, clear }
}