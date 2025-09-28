import * as React from 'react'
import { useLocation } from 'react-router-dom'

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
  /** Custom metrics */
  routeLoadTime?: number
  componentRenderTime?: number
  bundleLoadTime?: number
  interactionLatency: number[]
  scrollPerformance: number[]
  resourceCounts: {
    scripts: number
    stylesheets: number
    images: number
    total: number
  }
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number }
  fid: { good: number; needsImprovement: number }
  cls: { good: number; needsImprovement: number }
  fcp: { good: number; needsImprovement: number }
  ttfb: { good: number; needsImprovement: number }
}

export interface PerformanceAnalysis {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  recommendations: string[]
  criticalIssues: string[]
  optimizationOpportunities: string[]
  resourceAnalysis: {
    largeResources: Array<{ name: string; size: number; type: string }>
    slowResources: Array<{ name: string; duration: number; type: string }>
    blockingResources: Array<{ name: string; reason: string }>
  }
}

// Enhanced Core Web Vitals thresholds
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 },
}

function getPerformanceRating(
  value: number,
  threshold: { good: number; needsImprovement: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function usePerformanceMonitoring(thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS) {
  const location = useLocation()
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    interactionLatency: [],
    scrollPerformance: [],
    resourceCounts: { scripts: 0, stylesheets: 0, images: 0, total: 0 },
  })
  const [analysis, setAnalysis] = React.useState<PerformanceAnalysis>({
    score: 0,
    grade: 'F',
    recommendations: [],
    criticalIssues: [],
    optimizationOpportunities: [],
    resourceAnalysis: {
      largeResources: [],
      slowResources: [],
      blockingResources: [],
    },
  })
  const [isSupported, setIsSupported] = React.useState(false)

  const routeStartTime = React.useRef<number>(0)
  const componentStartTime = React.useRef<number>(0)

  // Enhanced resource analysis
  const analyzeResources = React.useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return

    const resources = globalThis.performance?.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[]

    // Analyze resource types and sizes
    const resourceCounts = { scripts: 0, stylesheets: 0, images: 0, total: resources.length }
    const largeResources: Array<{ name: string; size: number; type: string }> = []
    const slowResources: Array<{ name: string; duration: number; type: string }> = []
    const blockingResources: Array<{ name: string; reason: string }> = []

    resources.forEach(resource => {
      const size = resource.transferSize || 0
      const duration = resource.responseEnd - resource.requestStart
      const url = new URL(resource.name)
      const extension = url.pathname.split('.').pop()?.toLowerCase()

      // Categorize by type
      if (extension === 'js' || resource.initiatorType === 'script') {
        resourceCounts.scripts++
      } else if (extension === 'css' || resource.initiatorType === 'css') {
        resourceCounts.stylesheets++
      } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
        resourceCounts.images++
      }

      // Identify large resources (>100KB)
      if (size > 100000) {
        largeResources.push({
          name: url.pathname.split('/').pop() || resource.name,
          size: Math.round(size / 1024), // KB
          type: extension || 'unknown',
        })
      }

      // Identify slow resources (>1s)
      if (duration > 1000) {
        slowResources.push({
          name: url.pathname.split('/').pop() || resource.name,
          duration: Math.round(duration),
          type: extension || 'unknown',
        })
      }

      // Identify render-blocking resources
      if (
        'renderBlockingStatus' in resource &&
        (resource as { renderBlockingStatus?: string }).renderBlockingStatus === 'blocking'
      ) {
        blockingResources.push({
          name: url.pathname.split('/').pop() || resource.name,
          reason: 'Render blocking',
        })
      }
    })

    setMetrics(prev => ({ ...prev, resourceCounts }))
    setAnalysis(prev => ({
      ...prev,
      resourceAnalysis: {
        largeResources: largeResources.sort((a, b) => b.size - a.size).slice(0, 10),
        slowResources: slowResources.sort((a, b) => b.duration - a.duration).slice(0, 10),
        blockingResources,
      },
    }))
  }, [])

  // Enhanced performance analysis
  const analyzePerformance = React.useCallback(() => {
    const {
      lcp,
      fid,
      cls,
      memory,
      routeLoadTime,
      bundleLoadTime,
      interactionLatency,
      scrollPerformance,
    } = metrics

    let score = 100
    const recommendations: string[] = []
    const criticalIssues: string[] = []
    const optimizationOpportunities: string[] = []

    // Core Web Vitals analysis
    if (lcp !== undefined) {
      const lcpRating = getPerformanceRating(lcp, thresholds.lcp)
      if (lcpRating === 'poor') {
        score -= 25
        criticalIssues.push(`LCP is critically slow (${Math.round(lcp)}ms > 4s)`)
        recommendations.push('Optimize images, remove unused CSS, improve server response times')
      } else if (lcpRating === 'needs-improvement') {
        score -= 15
        recommendations.push('LCP could be improved - optimize critical rendering path')
      }
    }

    if (fid !== undefined) {
      const fidRating = getPerformanceRating(fid, thresholds.fid)
      if (fidRating === 'poor') {
        score -= 20
        criticalIssues.push(`FID indicates unresponsive UI (${Math.round(fid)}ms > 300ms)`)
        recommendations.push('Reduce main thread work, split large JavaScript tasks')
      } else if (fidRating === 'needs-improvement') {
        score -= 10
        recommendations.push('FID could be improved - optimize JavaScript execution')
      }
    }

    if (cls !== undefined) {
      const clsRating = getPerformanceRating(cls, thresholds.cls)
      if (clsRating === 'poor') {
        score -= 20
        criticalIssues.push(`CLS causes layout instability (${cls.toFixed(3)} > 0.25)`)
        recommendations.push(
          'Set dimensions for images/videos, avoid inserting content above existing content'
        )
      } else if (clsRating === 'needs-improvement') {
        score -= 10
        optimizationOpportunities.push('CLS could be improved - ensure stable layouts')
      }
    }

    // Custom metrics analysis
    if (routeLoadTime !== undefined && routeLoadTime > 300) {
      score -= 10
      optimizationOpportunities.push(`Route transitions are slow (${Math.round(routeLoadTime)}ms)`)
    }

    if (memory && memory.usedJSHeapSize > 50 * 1024 * 1024) {
      // 50MB
      const memoryMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      if (memoryMB > 100) {
        score -= 15
        criticalIssues.push(`High memory usage (${memoryMB}MB)`)
        recommendations.push('Check for memory leaks, optimize data structures')
      } else {
        score -= 5
        optimizationOpportunities.push(`Memory usage is elevated (${memoryMB}MB)`)
      }
    }

    if (bundleLoadTime !== undefined && bundleLoadTime > 2000) {
      score -= 15
      recommendations.push('Bundle loading is slow - implement better code splitting')
    }

    // Interaction and scroll performance
    const avgInteractionLatency =
      interactionLatency.length > 0
        ? interactionLatency.reduce((a, b) => a + b, 0) / interactionLatency.length
        : 0

    if (avgInteractionLatency > 100) {
      score -= 10
      optimizationOpportunities.push(
        `Interaction latency is high (${Math.round(avgInteractionLatency)}ms)`
      )
    }

    const avgScrollFPS =
      scrollPerformance.length > 0
        ? scrollPerformance.reduce((a, b) => a + b, 0) / scrollPerformance.length
        : 60

    if (avgScrollFPS < 45) {
      score -= 10
      recommendations.push(`Scroll performance is choppy (${Math.round(avgScrollFPS)} FPS)`)
    }

    // Resource analysis recommendations
    const { largeResources, slowResources, blockingResources } = analysis.resourceAnalysis

    if (largeResources.length > 3) {
      score -= 10
      recommendations.push(
        `${largeResources.length} large resources detected - optimize or lazy load`
      )
    }

    if (slowResources.length > 2) {
      score -= 5
      optimizationOpportunities.push(`${slowResources.length} slow-loading resources detected`)
    }

    if (blockingResources.length > 0) {
      score -= 15
      recommendations.push(
        `${blockingResources.length} render-blocking resources - defer or async load`
      )
    }

    score = Math.max(0, score)
    const grade = calculateGrade(score)

    setAnalysis(prev => ({
      ...prev,
      score,
      grade,
      recommendations: [...new Set(recommendations)],
      criticalIssues: [...new Set(criticalIssues)],
      optimizationOpportunities: [...new Set(optimizationOpportunities)],
    }))
  }, [metrics, thresholds, analysis.resourceAnalysis])

  // Route performance tracking
  const trackRoutePerformance = React.useCallback(() => {
    routeStartTime.current = globalThis.performance?.now() || 0
    const raf =
      typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame
        : (((cb: FrameRequestCallback) =>
            setTimeout(() => cb((globalThis.performance?.now() || 0) as any), 0)) as any)
    raf(() => {
      const loadTime = (globalThis.performance?.now() || 0) - routeStartTime.current
      setMetrics(prev => ({ ...prev, routeLoadTime: loadTime }))
    })
  }, [])

  React.useEffect(() => {
    // Check for Performance Observer support
    const supported =
      typeof window !== 'undefined' && 'PerformanceObserver' in window && 'performance' in window

    setIsSupported(supported)

    if (!supported) return

    let lcpObserver: PerformanceObserver | null = null
    let fidObserver: PerformanceObserver | null = null
    let clsObserver: PerformanceObserver | null = null

    try {
      // Enhanced LCP observation
      lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }

        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Enhanced FID observation
      fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const delay = entry.processingStart - entry.startTime
          setMetrics(prev => ({
            ...prev,
            fid: delay,
            interactionLatency: [...prev.interactionLatency.slice(-9), delay],
          }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Enhanced CLS observation with session tracking
      let clsValue = 0
      let sessionValue = 0
      let sessionEntries: any[] = []

      clsObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any
          if (!layoutShift.hadRecentInput) {
            if (
              sessionEntries.length === 0 ||
              entry.startTime - sessionEntries[sessionEntries.length - 1].startTime < 1000
            ) {
              sessionValue += layoutShift.value
              sessionEntries.push(layoutShift)
            } else {
              clsValue = Math.max(clsValue, sessionValue)
              sessionValue = layoutShift.value
              sessionEntries = [layoutShift]
            }
            clsValue = Math.max(clsValue, sessionValue)
          }
        }

        setMetrics(prev => ({ ...prev, cls: clsValue }))
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Enhanced navigation and paint metrics
      const navTiming = globalThis.performance?.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      const paintEntries = globalThis.performance?.getEntriesByType('paint') || []
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')

      // Calculate bundle load time from JavaScript resources
      const jsResources = (globalThis.performance?.getEntriesByType('resource') || []).filter(
        (resource: any) => resource.name.includes('.js') && !resource.name.includes('node_modules')
      )

      const bundleLoadTime =
        jsResources.length > 0
          ? jsResources.reduce(
              (total: number, resource: any) =>
                total + (resource.responseEnd - resource.requestStart),
              0
            )
          : undefined

      setMetrics(prev => ({
        ...prev,
        fcp: fcpEntry?.startTime,
        ttfb: navTiming.responseStart - navTiming.requestStart,
        navigationTiming: navTiming,
        bundleLoadTime,
      }))

      // Enhanced memory monitoring
      if (globalThis.performance && 'memory' in (globalThis.performance as any)) {
        const updateMemory = () => {
          const memory = (globalThis.performance as any).memory
          setMetrics(prev => ({
            ...prev,
            memory: {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit,
            },
          }))
        }

        updateMemory()
        const memoryInterval = setInterval(updateMemory, 5000)

        return () => {
          clearInterval(memoryInterval)
          lcpObserver?.disconnect()
          fidObserver?.disconnect()
          clsObserver?.disconnect()
        }
      }

      // Analyze resources
      analyzeResources()
    } catch (error) {
      console.warn('Performance monitoring setup failed:', error)
    }

    return () => {
      lcpObserver?.disconnect()
      fidObserver?.disconnect()
      clsObserver?.disconnect()
    }
  }, [analyzeResources])

  // Track route changes
  React.useEffect(() => {
    trackRoutePerformance()
  }, [location.pathname, trackRoutePerformance])

  // Analyze performance when metrics change
  React.useEffect(() => {
    analyzePerformance()
  }, [analyzePerformance])

  const getMetricRating = React.useCallback(
    (metric: keyof PerformanceMetrics) => {
      const value = metrics[metric] as number
      if (value === undefined) return null

      const threshold = thresholds[metric as keyof PerformanceThresholds]
      if (!threshold) return null

      return getPerformanceRating(value, threshold)
    },
    [metrics, thresholds]
  )

  const getCoreWebVitals = React.useCallback(() => {
    return {
      lcp: {
        value: metrics.lcp,
        rating: getMetricRating('lcp'),
        threshold: thresholds.lcp,
      },
      fid: {
        value: metrics.fid,
        rating: getMetricRating('fid'),
        threshold: thresholds.fid,
      },
      cls: {
        value: metrics.cls,
        rating: getMetricRating('cls'),
        threshold: thresholds.cls,
      },
    }
  }, [metrics, getMetricRating, thresholds])

  const getPerformanceScore = React.useCallback(() => analysis.score, [analysis.score])

  // Component performance tracking utilities
  const startComponentTimer = React.useCallback(() => {
    componentStartTime.current = globalThis.performance?.now() || 0
  }, [])

  const endComponentTimer = React.useCallback(() => {
    if (componentStartTime.current > 0) {
      const renderTime = (globalThis.performance?.now() || 0) - componentStartTime.current
      setMetrics(prev => ({ ...prev, componentRenderTime: renderTime }))
      componentStartTime.current = 0
    }
  }, [])

  return {
    metrics,
    analysis,
    isSupported,
    getMetricRating,
    getCoreWebVitals,
    getPerformanceScore,
    startComponentTimer,
    endComponentTimer,
    refreshMetrics: React.useCallback(() => {
      analyzeResources()
      analyzePerformance()
    }, [analyzeResources, analyzePerformance]),
  }
}

// Hook for measuring custom performance marks
export function usePerformanceMark(name: string) {
  const mark = React.useCallback(
    (label?: string) => {
      if (typeof globalThis === 'undefined' || !globalThis.performance) return
      const markName = label ? `${name}-${label}` : name
      globalThis.performance.mark(markName)
    },
    [name]
  )

  const measure = React.useCallback(
    (startMark?: string, endMark?: string) => {
      if (typeof globalThis === 'undefined' || !globalThis.performance) return null
      try {
        const measureName = `${name}-measure`
        globalThis.performance.measure(measureName, startMark, endMark)
        const measures = globalThis.performance.getEntriesByName(measureName, 'measure')
        return measures[measures.length - 1]?.duration || null
      } catch (error) {
        console.warn('Performance measure failed:', error)
        return null
      }
    },
    [name]
  )

  const clear = React.useCallback(() => {
    if (typeof globalThis === 'undefined' || !globalThis.performance) return
    globalThis.performance.clearMarks(name)
    globalThis.performance.clearMeasures(`${name}-measure`)
  }, [name])

  return { mark, measure, clear }
}
