/**
 * Recommendations Panel Component
 *
 * Displays AI-powered recommendations with detailed insights,
 * actions, and feedback mechanisms.
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import {
  Lightbulb,
  Star,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Filter,
  RefreshCw,
  ChevronRight,
  Info,
  Zap,
  Shield,
  TrendingUp,
  Settings,
  FileText,
  Eye,
  Play,
  X,
} from 'lucide-react'

import { RecommendationsEngine } from '../../lib/memory-graph/recommendations-engine'
import type {
  Recommendation,
  RecommendationType,
  RecommendationCategory,
  RecommendationContext,
  RecommendationFeedback,
} from '../../lib/memory-graph/recommendations-engine'
import type { MemoryGraph } from '../../lib/memory-graph/memory-graph'

interface RecommendationsPanelProps {
  graph: MemoryGraph
  onRecommendationAction?: (recommendation: Recommendation, actionIndex: number) => void
  className?: string
}

const TYPE_ICONS: Record<RecommendationType, React.ReactNode> = {
  optimization: <TrendingUp className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  reliability: <CheckCircle className="h-4 w-4" />,
  performance: <Zap className="h-4 w-4" />,
  maintenance: <Settings className="h-4 w-4" />,
  architecture: <Target className="h-4 w-4" />,
  monitoring: <Eye className="h-4 w-4" />,
  compliance: <FileText className="h-4 w-4" />,
}

const PRIORITY_COLORS = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200',
}

const EFFORT_COLORS = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
}

export function RecommendationsPanel({
  graph,
  onRecommendationAction,
  className = '',
}: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  const [filterType, setFilterType] = useState<RecommendationType | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<
    'all' | 'critical' | 'high' | 'medium' | 'low'
  >('all')
  const [implementedRecs, setImplementedRecs] = useState<Set<string>>(new Set())
  const [dismissedRecs, setDismissedRecs] = useState<Set<string>>(new Set())
  const [feedbackDialog, setFeedbackDialog] = useState<{
    rec: Recommendation
    isOpen: boolean
  } | null>(null)

  const engine = React.useMemo(() => new RecommendationsEngine(graph), [graph])

  const loadRecommendations = async (context: RecommendationContext = {}) => {
    setIsLoading(true)
    try {
      const recs = await engine.generateRecommendations({
        maxRecommendations: 20,
        ...context,
      })
      setRecommendations(recs)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [])

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (dismissedRecs.has(rec.id)) return false
    if (filterType !== 'all' && rec.type !== filterType) return false
    if (filterPriority !== 'all' && rec.priority !== filterPriority) return false
    return true
  })

  // Group recommendations by category
  const groupedRecommendations = filteredRecommendations.reduce(
    (groups, rec) => {
      const category = rec.category
      if (!groups[category]) groups[category] = []
      groups[category].push(rec)
      return groups
    },
    {} as Record<RecommendationCategory, Recommendation[]>
  )

  const handleImplement = (recommendation: Recommendation) => {
    setImplementedRecs(prev => new Set([...prev, recommendation.id]))
    // In a real implementation, this would trigger the actual implementation
    console.log('Implementing recommendation:', recommendation.title)
  }

  const handleDismiss = (recommendation: Recommendation) => {
    setDismissedRecs(prev => new Set([...prev, recommendation.id]))
  }

  const handleFeedback = (
    recommendation: Recommendation,
    rating: number,
    helpful: boolean,
    comments?: string
  ) => {
    const feedback: RecommendationFeedback = {
      recommendationId: recommendation.id,
      userId: 'current-user', // Would be actual user ID
      rating: rating as 1 | 2 | 3 | 4 | 5,
      implemented: implementedRecs.has(recommendation.id),
      helpful,
      comments,
      timestamp: new Date(),
    }

    engine.addFeedback(feedback)
    setFeedbackDialog(null)
  }

  const getRecommendationStats = () => {
    const total = recommendations.length
    const implemented = implementedRecs.size
    const dismissed = dismissedRecs.size
    const pending = total - implemented - dismissed

    return { total, implemented, dismissed, pending }
  }

  const stats = getRecommendationStats()

  if (recommendations.length === 0 && !isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Lightbulb className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-gray-500">No recommendations available</p>
            <p className="mb-4 text-sm text-gray-400">Add more data to get AI-powered insights</p>
            <Button onClick={() => loadRecommendations()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Lightbulb className="h-6 w-6" />
            AI Recommendations
            <Badge variant="secondary">{stats.pending}</Badge>
          </h2>
          <p className="text-sm text-gray-600">
            {stats.implemented} implemented • {stats.dismissed} dismissed • {stats.pending} pending
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as RecommendationType | 'all')}
            className="rounded border px-3 py-1 text-sm"
          >
            <option value="all">All Types</option>
            <option value="optimization">Optimization</option>
            <option value="security">Security</option>
            <option value="reliability">Reliability</option>
            <option value="performance">Performance</option>
            <option value="maintenance">Maintenance</option>
            <option value="architecture">Architecture</option>
            <option value="monitoring">Monitoring</option>
            <option value="compliance">Compliance</option>
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as any)}
            className="rounded border px-3 py-1 text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <Button
            onClick={() => loadRecommendations()}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.implemented}</p>
            <p className="text-sm text-gray-600">Implemented</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.dismissed}</p>
            <p className="text-sm text-gray-600">Dismissed</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {Object.entries(groupedRecommendations).map(([category, recs]) => (
            <div key={category}>
              <h3 className="mb-3 text-lg font-semibold capitalize">
                {category.replace('_', ' ')} ({recs.length})
              </h3>
              <div className="space-y-3">
                {recs.map(rec => (
                  <Card
                    key={rec.id}
                    className={`transition-all hover:shadow-md ${
                      implementedRecs.has(rec.id) ? 'bg-green-50 opacity-60' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex flex-1 items-start gap-3">
                          <div className="rounded-lg bg-gray-100 p-2">{TYPE_ICONS[rec.type]}</div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h4 className="font-semibold">{rec.title}</h4>
                              <Badge className={PRIORITY_COLORS[rec.priority]}>
                                {rec.priority.toUpperCase()}
                              </Badge>
                              {implementedRecs.has(rec.id) && (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  IMPLEMENTED
                                </Badge>
                              )}
                            </div>
                            <p className="mb-2 text-sm text-gray-600">{rec.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Impact: {rec.impact.score}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Confidence: {(rec.confidence * 100).toFixed(0)}%
                              </span>
                              <span
                                className={`flex items-center gap-1 ${EFFORT_COLORS[rec.effort.level]}`}
                              >
                                <Clock className="h-3 w-3" />
                                {rec.effort.level} effort
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Info className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {TYPE_ICONS[rec.type]}
                                  {rec.title}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="mb-2 font-semibold">Description</h4>
                                  <p className="text-sm">{rec.description}</p>
                                </div>

                                <div>
                                  <h4 className="mb-2 font-semibold">Reasoning</h4>
                                  <p className="text-sm">{rec.reasoning}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="mb-2 font-semibold">Impact</h4>
                                    <p className="mb-1 text-sm">{rec.impact.description}</p>
                                    <Progress value={rec.impact.score} className="h-2" />
                                    <p className="mt-1 text-xs text-gray-500">
                                      Affects {rec.impact.affectedEntities.length} entities
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="mb-2 font-semibold">Effort</h4>
                                    <p className="text-sm">Level: {rec.effort.level}</p>
                                    <p className="text-sm">Time: {rec.effort.estimatedTime}</p>
                                    <p className="text-sm">{rec.effort.complexity}</p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="mb-2 font-semibold">Actions Required</h4>
                                  <div className="space-y-2">
                                    {rec.actions.map((action, index) => (
                                      <div key={index} className="rounded bg-gray-50 p-2 text-sm">
                                        <span className="font-medium">
                                          {action.type.toUpperCase()}:
                                        </span>{' '}
                                        {action.description}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="mb-2 font-semibold">Benefits</h4>
                                  <ul className="space-y-1 text-sm">
                                    {rec.benefits.map((benefit, index) => (
                                      <li key={index} className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        {benefit}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {rec.risks && rec.risks.length > 0 && (
                                  <div>
                                    <h4 className="mb-2 font-semibold">Risks</h4>
                                    <ul className="space-y-1 text-sm">
                                      {rec.risks.map((risk, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                          <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                          {risk}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {!implementedRecs.has(rec.id) && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleImplement(rec)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="mr-1 h-4 w-4" />
                                Implement
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDismiss(rec)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFeedbackDialog({ rec, isOpen: true })}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Feedback Dialog */}
      {feedbackDialog && (
        <Dialog
          open={feedbackDialog.isOpen}
          onOpenChange={open => !open && setFeedbackDialog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">How helpful was this recommendation?</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <Button
                      key={rating}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeedback(feedbackDialog.rec, rating, rating >= 3)}
                    >
                      <Star className="h-4 w-4" />
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Additional Comments (Optional)</label>
                <Textarea
                  placeholder="Share your thoughts about this recommendation..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleFeedback(feedbackDialog.rec, 5, true)}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Helpful
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleFeedback(feedbackDialog.rec, 2, false)}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Not Helpful
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
