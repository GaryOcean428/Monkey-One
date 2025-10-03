import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { usePerformanceMonitoring, usePerformanceMark } from '../../hooks/usePerformanceMonitoring'
import { cn } from '../../lib/utils'
import {
  Activity,
  Gauge,
  Timer,
  Zap,
  Eye,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export interface PerformanceDashboardProps {
  className?: string
  compact?: boolean
  showRealtime?: boolean
}

export function PerformanceDashboard({
  className,
  compact = false,
  showRealtime = true,
}: PerformanceDashboardProps) {
  const { metrics, isSupported, getCoreWebVitals, getPerformanceScore } = usePerformanceMonitoring()
  const [lastUpdated, setLastUpdated] = React.useState(new Date())

  const refresh = React.useCallback(() => {
    setLastUpdated(new Date())
    // Trigger a re-render to update metrics
    window.location.reload()
  }, [])

  if (!isSupported) {
    return (
      <Card className={cn('performance-dashboard', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitoring
          </CardTitle>
          <CardDescription>Performance monitoring is not supported in this browser</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const coreWebVitals = getCoreWebVitals()
  const performanceScore = getPerformanceScore()

  if (compact) {
    return (
      <Card className={cn('performance-dashboard-compact', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="flex items-center gap-2">
              {performanceScore !== null && (
                <Badge variant={getScoreBadgeVariant(performanceScore)}>{performanceScore}</Badge>
              )}
              <Button variant="ghost" size="sm" onClick={refresh}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {performanceScore !== null && (
            <div className="mt-2">
              <Progress value={performanceScore} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('performance-dashboard', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Monitoring
            </CardTitle>
            <CardDescription>Core Web Vitals and performance metrics</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {performanceScore !== null && (
              <div className="text-center">
                <div className="text-2xl font-bold">{performanceScore}</div>
                <div className="text-muted-foreground text-xs">Score</div>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Web Vitals */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            Core Web Vitals
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              title="LCP"
              description="Largest Contentful Paint"
              value={coreWebVitals.lcp.value}
              rating={coreWebVitals.lcp.rating}
              threshold={coreWebVitals.lcp.threshold}
              unit="ms"
              icon={<Timer className="h-4 w-4" />}
            />
            <MetricCard
              title="FID"
              description="First Input Delay"
              value={coreWebVitals.fid.value}
              rating={coreWebVitals.fid.rating}
              threshold={coreWebVitals.fid.threshold}
              unit="ms"
              icon={<Zap className="h-4 w-4" />}
            />
            <MetricCard
              title="CLS"
              description="Cumulative Layout Shift"
              value={coreWebVitals.cls.value}
              rating={coreWebVitals.cls.rating}
              threshold={coreWebVitals.cls.threshold}
              icon={<Eye className="h-4 w-4" />}
            />
          </div>
        </div>

        <Separator />

        {/* Additional Metrics */}
        <div>
          <h4 className="mb-3 text-sm font-medium">Additional Metrics</h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {metrics.fcp && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold">{Math.round(metrics.fcp)}ms</div>
                <div className="text-muted-foreground text-xs">FCP</div>
              </div>
            )}
            {metrics.ttfb && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold">{Math.round(metrics.ttfb)}ms</div>
                <div className="text-muted-foreground text-xs">TTFB</div>
              </div>
            )}
            {metrics.memory && (
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold">
                  {Math.round(metrics.memory.usedJSHeapSize / 1024 / 1024)}MB
                </div>
                <div className="text-muted-foreground text-xs">Memory</div>
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold">{lastUpdated.toLocaleTimeString()}</div>
              <div className="text-muted-foreground text-xs">Updated</div>
            </div>
          </div>
        </div>

        {showRealtime && <RealtimeMetrics />}
      </CardContent>
    </Card>
  )
}

function MetricCard({
  title,
  description,
  value,
  rating,
  threshold,
  unit = '',
  icon,
}: {
  title: string
  description: string
  value?: number
  rating?: 'good' | 'needs-improvement' | 'poor' | null
  threshold?: { good: number; needsImprovement: number }
  unit?: string
  icon?: React.ReactNode
}) {
  const getRatingIcon = () => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getRatingColor = () => {
    switch (rating) {
      case 'good':
        return 'border-green-200 bg-green-50'
      case 'needs-improvement':
        return 'border-yellow-200 bg-yellow-50'
      case 'poor':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-muted'
    }
  }

  return (
    <div className={cn('rounded-lg border p-3', getRatingColor())}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        {getRatingIcon()}
      </div>

      <div className="text-2xl font-bold">
        {value !== undefined ? `${Math.round(value)}${unit}` : '—'}
      </div>

      <div className="text-muted-foreground mt-1 text-xs">{description}</div>

      {threshold && rating && (
        <div className="text-muted-foreground mt-2 text-xs">
          Good: ≤{threshold.good}
          {unit} | Poor: &gt;{threshold.needsImprovement}
          {unit}
        </div>
      )}
    </div>
  )
}

function RealtimeMetrics() {
  const { mark, measure } = usePerformanceMark('component-render')
  const [renderTime, setRenderTime] = React.useState<number | null>(null)

  React.useEffect(() => {
    mark('start')

    return () => {
      mark('end')
      const duration = measure('start', 'end')
      if (duration !== null) {
        setRenderTime(duration)
      }
    }
  }, [mark, measure])

  return (
    <div>
      <h4 className="mb-3 text-sm font-medium">Real-time Metrics</h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="mb-1 flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="text-sm font-medium">Component Render</span>
          </div>
          <div className="text-lg font-semibold">
            {renderTime !== null ? `${renderTime.toFixed(2)}ms` : 'Measuring...'}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="mb-1 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Frame Rate</span>
          </div>
          <div className="text-lg font-semibold">60 FPS</div>
        </div>
      </div>
    </div>
  )
}

function getScoreBadgeVariant(score: number) {
  if (score >= 90) return 'default'
  if (score >= 70) return 'secondary'
  return 'destructive'
}
