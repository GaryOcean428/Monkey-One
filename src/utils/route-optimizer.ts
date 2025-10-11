/**
 * Advanced route optimization utilities
 * Implements intelligent preloading, caching, and performance monitoring for routes
 */


interface RouteMetrics {
  loadTime: number
  renderTime: number
  bundleSize: number
  memoryUsage: number
  errorRate: number
  userEngagement: number
}

interface RouteCache {
  component: Promise<any>
  timestamp: number
  hitCount: number
  lastUsed: number
}

interface PreloadStrategy {
  type: 'immediate' | 'viewport' | 'interaction' | 'idle' | 'critical'
  priority: number
  conditions?: string[]
}

class RouteOptimizer {
  private routeMetrics = new Map<string, RouteMetrics>()
  private routeCache = new Map<string, RouteCache>()
  private preloadQueue = new Set<string>()
  private loadingStates = new Map<string, Promise<any>>()
  private preloadStrategies = new Map<string, PreloadStrategy>()

  // Cache settings
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes
  private readonly MAX_CACHE_SIZE = 50
  private readonly PRELOAD_DELAY = 2000 // 2 seconds

  constructor() {
    this.initializeStrategies()
    this.startCleanupInterval()
    this.observeUserBehavior()
  }

  /**
   * Initialize intelligent preload strategies based on route importance
   */
  private initializeStrategies() {
    const strategies: Array<[string, PreloadStrategy]> = [
      // Critical routes - preload immediately
      ['/dashboard', { type: 'immediate', priority: 10 }],
      ['/chat', { type: 'immediate', priority: 9 }],

      // High-priority routes - preload on idle
      ['/agents', { type: 'idle', priority: 8 }],
      ['/workflow', { type: 'idle', priority: 7 }],

      // Medium-priority routes - preload on interaction
      ['/memory-manager', { type: 'interaction', priority: 6 }],
      ['/documents', { type: 'interaction', priority: 5 }],
      ['/tools', { type: 'interaction', priority: 5 }],
      ['/github', { type: 'interaction', priority: 4 }],
      ['/analytics', { type: 'interaction', priority: 4 }],

      // Low-priority routes - preload when in viewport
      ['/profile-manager', { type: 'viewport', priority: 3 }],
      ['/settings', { type: 'viewport', priority: 2 }],

      // Utility routes - conditional preloading
      ['/ui-showcase', {
        type: 'interaction',
        priority: 1,
        conditions: ['development']
      }],
    ]

    strategies.forEach(([path, strategy]) => {
      this.preloadStrategies.set(path, strategy)
    })
  }

  /**
   * Intelligent component preloading based on user behavior and route priority
   */
  async preloadRoute(routePath: string, force = false): Promise<void> {
    if (this.preloadQueue.has(routePath) && !force) return

    const strategy = this.preloadStrategies.get(routePath)
    if (!strategy && !force) return

    // Check conditions
    if (strategy?.conditions && !this.checkConditions(strategy.conditions)) {
      return
    }

    this.preloadQueue.add(routePath)

    try {
      // Implement different preload strategies
      switch (strategy?.type) {
        case 'immediate':
          await this.loadRouteComponent(routePath)
          break

        case 'idle':
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => this.loadRouteComponent(routePath))
          } else {
            setTimeout(() => this.loadRouteComponent(routePath), this.PRELOAD_DELAY)
          }
          break

        case 'interaction':
          // Preload after user shows intent (hover, focus on navigation)
          this.addInteractionListeners(routePath)
          break

        case 'viewport':
          // Preload when navigation element is in viewport
          this.addViewportObserver(routePath)
          break

        case 'critical':
          // High priority preload
          await this.loadRouteComponent(routePath, true)
          break

        default:
          if (force) {
            await this.loadRouteComponent(routePath)
          }
      }
    } catch (error) {
      console.warn(`Failed to preload route ${routePath}:`, error)
      this.preloadQueue.delete(routePath)
    }
  }

  /**
   * Load and cache route component
   */
  private async loadRouteComponent(routePath: string, highPriority = false): Promise<any> {
    // Check if already loading
    if (this.loadingStates.has(routePath)) {
      return this.loadingStates.get(routePath)
    }

    // Check cache first
    const cached = this.routeCache.get(routePath)
    if (cached && this.isCacheValid(cached)) {
      cached.hitCount++
      cached.lastUsed = Date.now()
      return cached.component
    }

    // Start loading
    const startTime = performance.now()
    const loadPromise = this.importRouteComponent(routePath)

    this.loadingStates.set(routePath, loadPromise)

    try {
      const component = await loadPromise
      const loadTime = performance.now() - startTime

      // Cache the component
      this.cacheComponent(routePath, loadPromise, loadTime)

      // Update metrics
      this.updateRouteMetrics(routePath, { loadTime })

      this.loadingStates.delete(routePath)
      this.preloadQueue.delete(routePath)

      return component
    } catch (error) {
      this.loadingStates.delete(routePath)
      this.preloadQueue.delete(routePath)

      // Update error metrics
      this.updateRouteMetrics(routePath, { errorRate: 1 })

      throw error
    }
  }

  /**
   * Import route component dynamically
   */
  private async importRouteComponent(routePath: string): Promise<any> {
    // Map route paths to dynamic imports
    const routeImports: Record<string, () => Promise<any>> = {
      '/dashboard': () => import('../pages/Dashboard'),
      '/chat': () => import('../pages/Chat'),
      '/agents': () => import('../pages/Agents'),
      '/workflow': () => import('../pages/Workflow'),
      '/memory-manager': () => import('../components/memory/MemoryManager'),
      '/documents': () => import('../pages/Documents'),
      '/tools': () => import('../pages/Tools'),
      '/github': () => import('../pages/Github'),
      '/analytics': () => import('../pages/Performance'),
      '/profile-manager': () => import('../pages/ProfileManager'),
      '/settings': () => import('../pages/Settings'),
      '/ui-showcase': () => import('../pages/UIShowcase'),
      '/performance-accessibility': () => import('../pages/PerformanceAccessibilityShowcase'),
      '/auth/callback': () => import('../pages/AuthCallback'),
      '/reset-password': () => import('../pages/Auth/PasswordReset'),
      '/ai': () => import('../pages/AI'),
      '/notes': () => import('../pages/Notes'),
    }

    const importFn = routeImports[routePath]
    if (!importFn) {
      throw new Error(`No import function found for route: ${routePath}`)
    }

    return importFn()
  }

  /**
   * Cache component with metadata
   */
  private cacheComponent(routePath: string, componentPromise: Promise<any>, loadTime: number) {
    // Ensure cache doesn't exceed max size
    if (this.routeCache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsed()
    }

    this.routeCache.set(routePath, {
      component: componentPromise,
      timestamp: Date.now(),
      hitCount: 1,
      lastUsed: Date.now()
    })
  }

  /**
   * Check if cached component is still valid
   */
  private isCacheValid(cached: RouteCache): boolean {
    return Date.now() - cached.timestamp < this.CACHE_TTL
  }

  /**
   * Evict least recently used cached components
   */
  private evictLeastUsed() {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, cache] of this.routeCache.entries()) {
      if (cache.lastUsed < oldestTime) {
        oldestTime = cache.lastUsed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.routeCache.delete(oldestKey)
    }
  }

  /**
   * Add interaction listeners for intent-based preloading
   */
  private addInteractionListeners(routePath: string) {
    const links = document.querySelectorAll(`[href="${routePath}"]`)

    links.forEach(link => {
      const preloadHandler = () => {
        this.loadRouteComponent(routePath)
        link.removeEventListener('mouseenter', preloadHandler)
        link.removeEventListener('focusin', preloadHandler)
      }

      link.addEventListener('mouseenter', preloadHandler, { once: true })
      link.addEventListener('focusin', preloadHandler, { once: true })
    })
  }

  /**
   * Add viewport observer for visibility-based preloading
   */
  private addViewportObserver(routePath: string) {
    if (!('IntersectionObserver' in window)) return

    const links = document.querySelectorAll(`[href="${routePath}"]`)

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadRouteComponent(routePath)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    links.forEach(link => observer.observe(link))
  }

  /**
   * Check strategy conditions
   */
  private checkConditions(conditions: string[]): boolean {
    return conditions.every(condition => {
      switch (condition) {
        case 'development':
          return process.env.NODE_ENV === 'development'
        case 'production':
          return process.env.NODE_ENV === 'production'
        default:
          return true
      }
    })
  }

  /**
   * Update route performance metrics
   */
  private updateRouteMetrics(routePath: string, updates: Partial<RouteMetrics>) {
    const current = this.routeMetrics.get(routePath) || {
      loadTime: 0,
      renderTime: 0,
      bundleSize: 0,
      memoryUsage: 0,
      errorRate: 0,
      userEngagement: 0
    }

    this.routeMetrics.set(routePath, { ...current, ...updates })
  }

  /**
   * Get route performance metrics
   */
  getRouteMetrics(routePath: string): RouteMetrics | null {
    return this.routeMetrics.get(routePath) || null
  }

  /**
   * Get all route metrics for analysis
   */
  getAllMetrics(): Map<string, RouteMetrics> {
    return new Map(this.routeMetrics)
  }

  /**
   * Start periodic cache cleanup
   */
  private startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredCache()
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache() {
    for (const [key, cache] of this.routeCache.entries()) {
      if (!this.isCacheValid(cache)) {
        this.routeCache.delete(key)
      }
    }
  }

  /**
   * Observe user behavior for intelligent preloading
   */
  private observeUserBehavior() {
    // Track navigation patterns
    let navigationHistory: string[] = []

    const trackNavigation = (path: string) => {
      navigationHistory.push(path)
      if (navigationHistory.length > 10) {
        navigationHistory = navigationHistory.slice(-10)
      }

      // Predict next likely routes and preload them
      this.predictAndPreload(navigationHistory)
    }

    // Listen for route changes
    window.addEventListener('popstate', () => {
      trackNavigation(window.location.pathname)
    })

    // Track engagement metrics
    this.trackUserEngagement()
  }

  /**
   * Predict and preload likely next routes
   */
  private predictAndPreload(history: string[]) {
    // Simple prediction based on common patterns
    const lastRoute = history[history.length - 1]
    const predictions: Record<string, string[]> = {
      '/dashboard': ['/chat', '/agents'],
      '/chat': ['/agents', '/tools'],
      '/agents': ['/workflow', '/memory-manager'],
      '/workflow': ['/tools', '/documents'],
    }

    const nextRoutes = predictions[lastRoute]
    if (nextRoutes) {
      nextRoutes.forEach(route => {
        this.preloadRoute(route)
      })
    }
  }

  /**
   * Track user engagement metrics
   */
  private trackUserEngagement() {
    const startTimes = new Map<string, number>()

    const trackPageStart = (path: string) => {
      startTimes.set(path, Date.now())
    }

    const trackPageEnd = (path: string) => {
      const startTime = startTimes.get(path)
      if (startTime) {
        const engagement = Date.now() - startTime
        this.updateRouteMetrics(path, { userEngagement: engagement })
        startTimes.delete(path)
      }
    }

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      const currentPath = window.location.pathname
      if (document.hidden) {
        trackPageEnd(currentPath)
      } else {
        trackPageStart(currentPath)
      }
    })

    // Track page load
    trackPageStart(window.location.pathname)
  }

  /**
   * Generate performance insights and recommendations
   */
  generateInsights(): {
    slowRoutes: Array<{ path: string; metrics: RouteMetrics }>
    recommendations: string[]
    cacheEfficiency: number
  } {
    const slowRoutes: Array<{ path: string; metrics: RouteMetrics }> = []
    const recommendations: string[] = []

    // Analyze route performance
    for (const [path, metrics] of this.routeMetrics.entries()) {
      if (metrics.loadTime > 1000) { // 1 second
        slowRoutes.push({ path, metrics })
      }

      if (metrics.errorRate > 0.05) { // 5% error rate
        recommendations.push(`Route ${path} has high error rate: ${(metrics.errorRate * 100).toFixed(1)}%`)
      }

      if (metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
        recommendations.push(`Route ${path} uses excessive memory: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`)
      }
    }

    // Calculate cache efficiency
    let totalHits = 0
    let totalRequests = 0

    for (const cache of this.routeCache.values()) {
      totalHits += cache.hitCount
      totalRequests += cache.hitCount
    }

    const cacheEfficiency = totalRequests > 0 ? totalHits / totalRequests : 0

    // Generate cache recommendations
    if (cacheEfficiency < 0.7) {
      recommendations.push('Consider implementing more aggressive preloading for better cache efficiency')
    }

    return {
      slowRoutes: slowRoutes.sort((a, b) => b.metrics.loadTime - a.metrics.loadTime),
      recommendations,
      cacheEfficiency
    }
  }

  /**
   * Warm up critical routes
   */
  async warmupCriticalRoutes(): Promise<void> {
    const criticalRoutes = ['/dashboard', '/chat', '/agents']

    await Promise.all(
      criticalRoutes.map(route => this.preloadRoute(route, true))
    )
  }

  /**
   * Clear all caches and reset state
   */
  reset(): void {
    this.routeCache.clear()
    this.preloadQueue.clear()
    this.loadingStates.clear()
    this.routeMetrics.clear()
  }
}

// Create global instance
export const routeOptimizer = new RouteOptimizer()

// React hook for using route optimization
export function useRouteOptimization() {
  return {
    preloadRoute: (path: string) => routeOptimizer.preloadRoute(path),
    getMetrics: (path: string) => routeOptimizer.getRouteMetrics(path),
    getInsights: () => routeOptimizer.generateInsights(),
    warmupCritical: () => routeOptimizer.warmupCriticalRoutes(),
    reset: () => routeOptimizer.reset()
  }
}

export default routeOptimizer
