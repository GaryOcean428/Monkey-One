import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Progress } from './progress'
import { Badge } from './badge'
import { Separator } from './separator'
import { useThemeAnalytics } from '../../lib/theme-analytics'
import { cn } from '../../lib/utils'
import { 
  BarChart3, 
  Palette, 
  Eye, 
  Lightbulb, 
  RotateCcw,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'

const accentColorLabels: Record<string, { label: string; color: string }> = {
  blue: { label: 'Blue', color: 'hsl(214, 95%, 53%)' },
  emerald: { label: 'Emerald', color: 'hsl(142, 76%, 36%)' },
  violet: { label: 'Violet', color: 'hsl(262, 83%, 58%)' },
  rose: { label: 'Rose', color: 'hsl(330, 81%, 60%)' },
  amber: { label: 'Amber', color: 'hsl(38, 92%, 50%)' },
  cyan: { label: 'Cyan', color: 'hsl(199, 89%, 48%)' },
  pink: { label: 'Pink', color: 'hsl(324, 71%, 54%)' },
  indigo: { label: 'Indigo', color: 'hsl(231, 48%, 48%)' }
}

export interface ThemeInsightsProps {
  className?: string
  compact?: boolean
}

export function ThemeInsights({ className, compact = false }: ThemeInsightsProps) {
  const { analytics, insights, reset } = useThemeAnalytics()

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const getEngagementBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  if (compact) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Theme Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Interactions</span>
            <Badge variant="outline">{insights.totalInteractions}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Engagement</span>
            <Badge variant={getEngagementBadgeVariant(insights.engagementLevel)}>
              {insights.engagementLevel}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: accentColorLabels[insights.mostUsedColor].color }}
            />
            <span className="text-sm">
              Favorite: {accentColorLabels[insights.mostUsedColor].label}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Theme Usage Insights
        </CardTitle>
        <CardDescription>
          Your personalization patterns and usage statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Color Changes</span>
            </div>
            <div className="text-2xl font-bold">{analytics.accentColorChanges}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Theme Switches</span>
            </div>
            <div className="text-2xl font-bold">{analytics.themeSwitches}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Avg Session</span>
            </div>
            <div className="text-2xl font-bold">
              {formatDuration(analytics.averageSessionDuration)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <Badge variant={getEngagementBadgeVariant(insights.engagementLevel)} className="text-sm">
              {insights.engagementLevel}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Color Usage Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Accent Color Preferences
          </h4>
          <div className="space-y-2">
            {Object.entries(insights.colorUsageDistribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([color, count]) => {
                const maxCount = Math.max(...Object.values(insights.colorUsageDistribution))
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                const colorInfo = accentColorLabels[color]
                
                return (
                  <div key={color} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: colorInfo.color }}
                        />
                        <span>{colorInfo.label}</span>
                        {color === insights.mostUsedColor && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <span className="text-muted-foreground">{count}x</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
          </div>
        </div>

        <Separator />

        {/* Theme Mode Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium">Theme Mode Usage</h4>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(insights.themeUsageDistribution).map(([mode, count]) => (
              <div key={mode} className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-semibold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{mode}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {insights.recommendations.map((recommendation, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                  >
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Reset Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}