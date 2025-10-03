/**
 * Graph Metrics and Analytics Component
 *
 * Displays key metrics and insights about the memory graph
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  Network,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Server,
  Database,
} from 'lucide-react'
import type { Node, Edge, NodeType } from '../../lib/memory-graph/types'

interface GraphMetricsProps {
  nodes: Node[]
  edges: Edge[]
  className?: string
}

const NODE_COLORS: Record<NodeType, string> = {
  Service: '#3b82f6',
  Environment: '#10b981',
  Deployment: '#f59e0b',
  Configuration: '#8b5cf6',
  User: '#ef4444',
  Team: '#f97316',
  Project: '#06b6d4',
  Repository: '#84cc16',
  Task: '#6366f1',
  Issue: '#ec4899',
  Incident: '#dc2626',
  Error: '#991b1b',
  Customer: '#14b8a6',
  Feature: '#8b5cf6',
  Permission: '#64748b',
  Document: '#0ea5e9',
  API: '#059669',
  Database: '#7c3aed',
  Secret: '#be123c',
}

export function GraphMetrics({ nodes, edges, className = '' }: GraphMetricsProps) {
  // Calculate basic metrics
  const totalNodes = nodes.length
  const totalEdges = edges.length
  const avgDegree = totalNodes > 0 ? (totalEdges * 2) / totalNodes : 0

  // Node type distribution
  const nodeTypeDistribution = nodes.reduce(
    (acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1
      return acc
    },
    {} as Record<NodeType, number>
  )

  const nodeTypeData = Object.entries(nodeTypeDistribution).map(([type, count]) => ({
    type,
    count,
    color: NODE_COLORS[type as NodeType],
  }))

  // Edge type distribution
  const edgeTypeDistribution = edges.reduce(
    (acc, edge) => {
      acc[edge.type] = (acc[edge.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const edgeTypeData = Object.entries(edgeTypeDistribution).map(([type, count]) => ({
    type,
    count,
  }))

  // Calculate centrality scores
  const centralityScores = nodes
    .map(node => {
      const incomingEdges = edges.filter(edge => edge.to === node.id).length
      const outgoingEdges = edges.filter(edge => edge.from === node.id).length
      return {
        id: node.id,
        name: node.properties.name || node.id.split(':')[1] || node.id,
        type: node.type,
        centrality: incomingEdges + outgoingEdges,
        incoming: incomingEdges,
        outgoing: outgoingEdges,
      }
    })
    .sort((a, b) => b.centrality - a.centrality)

  const topCentralNodes = centralityScores.slice(0, 5)

  // Calculate health metrics
  const incidents = nodes.filter(n => n.type === 'Incident' || n.type === 'Error').length
  const services = nodes.filter(n => n.type === 'Service').length
  const configurations = nodes.filter(n => n.type === 'Configuration').length
  const pendingTasks = nodes.filter(
    n => n.type === 'Task' && n.properties.status === 'pending'
  ).length

  const healthScore = Math.max(0, 100 - incidents * 10 - pendingTasks * 5)

  // Time-based analysis
  const nodesByMonth = nodes.reduce(
    (acc, node) => {
      const month = new Date(node.metadata.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      })
      acc[month] = (acc[month] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const timelineData = Object.entries(nodesByMonth)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([month, count]) => ({ month, count }))

  // Risk assessment
  const riskFactors = {
    highCentrality: centralityScores.filter(n => n.centrality > 5).length,
    incidents: incidents,
    missingConfigs: services - configurations,
    pendingTasks: pendingTasks,
  }

  const totalRiskFactors = Object.values(riskFactors).reduce((sum, count) => sum + count, 0)
  const riskLevel = totalRiskFactors > 10 ? 'High' : totalRiskFactors > 5 ? 'Medium' : 'Low'

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Entities</p>
                <p className="text-2xl font-bold">{totalNodes}</p>
              </div>
              <Network className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Relationships</p>
                <p className="text-2xl font-bold">{totalEdges}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Health Score</p>
                <p className="text-2xl font-bold">{healthScore}%</p>
              </div>
              {healthScore > 80 ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              )}
            </div>
            <Progress value={healthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Risk Level</p>
                <p className="text-2xl font-bold">{riskLevel}</p>
              </div>
              <AlertTriangle
                className={`h-8 w-8 ${
                  riskLevel === 'High'
                    ? 'text-red-500'
                    : riskLevel === 'Medium'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                }`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Node Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Entity Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={nodeTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count, percent }) =>
                    `${type}: ${count} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {nodeTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Relationship Types */}
        <Card>
          <CardHeader>
            <CardTitle>Relationship Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={edgeTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Centrality and Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Central Nodes */}
        <Card>
          <CardHeader>
            <CardTitle>Most Connected Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCentralNodes.map((node, index) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{node.name}</p>
                      <p className="text-muted-foreground text-sm">{node.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{node.centrality}</p>
                    <p className="text-muted-foreground text-xs">
                      {node.incoming}↓ {node.outgoing}↑
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Entity Creation Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-semibold">High Centrality</p>
                <p className="text-2xl font-bold">{riskFactors.highCentrality}</p>
                <p className="text-muted-foreground text-sm">Critical nodes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-4">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="font-semibold">Active Incidents</p>
                <p className="text-2xl font-bold">{riskFactors.incidents}</p>
                <p className="text-muted-foreground text-sm">Need attention</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4">
              <Server className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-semibold">Config Gaps</p>
                <p className="text-2xl font-bold">{Math.max(0, riskFactors.missingConfigs)}</p>
                <p className="text-muted-foreground text-sm">Missing configs</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold">Pending Tasks</p>
                <p className="text-2xl font-bold">{riskFactors.pendingTasks}</p>
                <p className="text-muted-foreground text-sm">To complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Server className="mx-auto mb-2 h-8 w-8 text-blue-500" />
            <p className="text-2xl font-bold">{services}</p>
            <p className="text-muted-foreground text-sm">Services</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Database className="mx-auto mb-2 h-8 w-8 text-purple-500" />
            <p className="text-2xl font-bold">{nodes.filter(n => n.type === 'Database').length}</p>
            <p className="text-muted-foreground text-sm">Databases</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-green-500" />
            <p className="text-2xl font-bold">
              {nodes.filter(n => n.type === 'User' || n.type === 'Team').length}
            </p>
            <p className="text-muted-foreground text-sm">Users & Teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 text-orange-500" />
            <p className="text-2xl font-bold">{avgDegree.toFixed(1)}</p>
            <p className="text-muted-foreground text-sm">Avg Connections</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
