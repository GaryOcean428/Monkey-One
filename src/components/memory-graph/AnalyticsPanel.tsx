/**
 * Analytics Panel Component
 *
 * Displays advanced graph analytics, insights, and predictions
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts'
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  Network,
  Users,
  Activity,
  Brain,
  Eye,
  GitBranch,
  Clock,
  Shield,
  RefreshCw,
} from 'lucide-react'

import { GraphAnalyticsEngine } from '../../lib/memory-graph/analytics'
import type {
  GraphAnalytics,
  Community,
  Anomaly,
  Prediction,
  ActivityPattern,
} from '../../lib/memory-graph/analytics'
import type { MemoryGraph } from '../../lib/memory-graph/memory-graph'

interface AnalyticsPanelProps {
  graph: MemoryGraph
  className?: string
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16']

export function AnalyticsPanel({ graph, className = '' }: AnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<GraphAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)

  const analyticsEngine = React.useMemo(() => new GraphAnalyticsEngine(graph), [graph])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const result = await analyticsEngine.computeAnalytics()
      setAnalytics(result)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="flex h-64 items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin" />
              <p>Computing analytics...</p>
            </div>
          ) : (
            <div className="text-center">
              <Brain className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-gray-500">No analytics available</p>
              <Button onClick={loadAnalytics} className="mt-2">
                Load Analytics
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  // Prepare chart data
  const degreeDistributionData = Object.entries(analytics.degreeDistribution)
    .map(([degree, count]) => ({
      degree: parseInt(degree),
      count,
    }))
    .sort((a, b) => a.degree - b.degree)

  const centralityDistributionData = Object.entries(analytics.centralityDistribution).map(
    ([range, count]) => ({
      range,
      count,
    })
  )

  const communityData = analytics.communities.map((community, index) => ({
    name: community.id,
    size: community.size,
    density: community.density,
    color: COLORS[index % COLORS.length],
  }))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Brain className="h-6 w-6" />
            Graph Analytics
          </h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button onClick={loadAnalytics} disabled={isLoading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Network Density</p>
                <p className="text-2xl font-bold">{(analytics.density * 100).toFixed(1)}%</p>
              </div>
              <Network className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={analytics.density * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Clustering</p>
                <p className="text-2xl font-bold">{(analytics.clustering * 100).toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={analytics.clustering * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Path Length</p>
                <p className="text-2xl font-bold">{analytics.averagePathLength.toFixed(1)}</p>
              </div>
              <GitBranch className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Growth Rate</p>
                <p className="text-2xl font-bold">{analytics.growthRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Distribution Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Degree Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={degreeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="degree" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Centrality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={centralityDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Network Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Network Topology Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{analytics.diameter}</p>
                  <p className="text-sm text-gray-600">Network Diameter</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.communities.length}
                  </p>
                  <p className="text-sm text-gray-600">Communities</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.modularity.toFixed(3)}
                  </p>
                  <p className="text-sm text-gray-600">Modularity</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{analytics.anomalies.length}</p>
                  <p className="text-sm text-gray-600">Anomalies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communities" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Community Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Community Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={communityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, size }) => `${name}: ${size}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="size"
                    >
                      {communityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Community Details */}
            <Card>
              <CardHeader>
                <CardTitle>Community Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {analytics.communities.map((community, index) => (
                      <div
                        key={community.id}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                          selectedCommunity?.id === community.id
                            ? 'border-blue-200 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCommunity(community)}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{community.id}</span>
                          </div>
                          <Badge variant="outline">{community.size} nodes</Badge>
                        </div>
                        <p className="mb-1 text-sm text-gray-600">{community.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Density: {(community.density * 100).toFixed(1)}%</span>
                          <span>Cohesion: {(community.cohesion * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Detected Anomalies
                <Badge variant="secondary">{analytics.anomalies.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.anomalies.length > 0 ? (
                <div className="space-y-3">
                  {analytics.anomalies.map((anomaly, index) => (
                    <Alert key={index} className={getSeverityColor(anomaly.severity)}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {anomaly.severity.toUpperCase()}
                              </Badge>
                              <span className="text-xs">
                                Confidence: {(anomaly.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="mb-1 font-medium">{anomaly.description}</p>
                            <p className="text-sm">Entity: {anomaly.entityId}</p>
                            {anomaly.suggestedAction && (
                              <p className="mt-2 text-sm font-medium">
                                💡 {anomaly.suggestedAction}
                              </p>
                            )}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Shield className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No anomalies detected</p>
                  <p className="text-sm">Your graph structure looks healthy!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Predictions
                <Badge variant="secondary">{analytics.predictions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.predictions.length > 0 ? (
                <div className="space-y-4">
                  {analytics.predictions.map((prediction, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {prediction.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span
                            className={`text-sm font-medium ${getImpactColor(prediction.impact)}`}
                          >
                            {prediction.impact.toUpperCase()} IMPACT
                          </span>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
                          <p>Timeframe: {prediction.timeframe}</p>
                        </div>
                      </div>
                      <p className="mb-2 font-medium">{prediction.description}</p>
                      <p className="mb-2 text-sm text-gray-600">
                        💡 <strong>Recommendation:</strong> {prediction.recommendation}
                      </p>
                      {prediction.entities.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Affected entities: {prediction.entities.length}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Eye className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No predictions available</p>
                  <p className="text-sm">Add more data to enable predictive insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Patterns
                <Badge variant="secondary">{analytics.activityPatterns.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.activityPatterns.length > 0 ? (
                <div className="space-y-3">
                  {analytics.activityPatterns.map((pattern, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {pattern.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Intensity: {pattern.intensity.toFixed(1)}x
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {pattern.timeframe.start.toLocaleDateString()} -{' '}
                          {pattern.timeframe.end.toLocaleDateString()}
                        </div>
                      </div>
                      <p className="mb-2 text-sm">{pattern.description}</p>
                      <p className="text-xs text-gray-500">
                        Entities involved: {pattern.entities.length}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Activity className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No activity patterns detected</p>
                  <p className="text-sm">Patterns will appear as your graph evolves</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
