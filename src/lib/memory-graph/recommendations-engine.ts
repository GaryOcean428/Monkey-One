/**
 * Graph-Based Recommendations Engine
 *
 * Advanced recommendation system that uses graph structure, patterns,
 * and machine learning to provide intelligent suggestions for
 * infrastructure management, optimization, and problem resolution.
 */

import type { Node, Edge, NodeType, EdgeType } from './types'
import type { MemoryGraph } from './memory-graph'
import type { GraphAnalyticsEngine } from './analytics'

export interface Recommendation {
  id: string
  type: RecommendationType
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: RecommendationCategory
  title: string
  description: string
  reasoning: string
  confidence: number
  impact: {
    score: number
    description: string
    affectedEntities: string[]
  }
  effort: {
    level: 'low' | 'medium' | 'high'
    estimatedTime: string
    complexity: string
  }
  actions: RecommendationAction[]
  prerequisites?: string[]
  risks?: string[]
  benefits: string[]
  relatedRecommendations?: string[]
  metadata: {
    createdAt: Date
    source: string
    algorithm: string
    version: string
  }
}

export type RecommendationType =
  | 'optimization'
  | 'security'
  | 'reliability'
  | 'performance'
  | 'maintenance'
  | 'architecture'
  | 'monitoring'
  | 'compliance'

export type RecommendationCategory =
  | 'infrastructure'
  | 'configuration'
  | 'connections'
  | 'security'
  | 'monitoring'
  | 'documentation'
  | 'automation'
  | 'best_practices'

export interface RecommendationAction {
  type: 'create' | 'update' | 'delete' | 'configure' | 'monitor' | 'document'
  target: string
  description: string
  parameters?: Record<string, any>
  validation?: string
}

export interface RecommendationContext {
  domain?: string
  environment?: 'development' | 'staging' | 'production'
  constraints?: string[]
  priorities?: RecommendationType[]
  excludeTypes?: RecommendationType[]
  maxRecommendations?: number
}

export interface RecommendationFeedback {
  recommendationId: string
  userId: string
  rating: 1 | 2 | 3 | 4 | 5
  implemented: boolean
  helpful: boolean
  comments?: string
  timestamp: Date
}

export class RecommendationsEngine {
  private graph: MemoryGraph
  private analytics?: GraphAnalyticsEngine
  private feedback: RecommendationFeedback[] = []
  private rules: RecommendationRule[] = []
  private patterns: RecommendationPattern[] = []

  constructor(graph: MemoryGraph, analytics?: GraphAnalyticsEngine) {
    this.graph = graph
    this.analytics = analytics
    this.initializeRules()
    this.initializePatterns()
  }

  // Generate comprehensive recommendations
  async generateRecommendations(context: RecommendationContext = {}): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Get graph data
    const nodes = this.graph.query({}).nodes
    const edges = this.graph.query({}).edges

    if (nodes.length === 0) {
      return recommendations
    }

    // Apply different recommendation strategies
    const strategies = [
      () => this.generateStructuralRecommendations(nodes, edges, context),
      () => this.generateSecurityRecommendations(nodes, edges, context),
      () => this.generatePerformanceRecommendations(nodes, edges, context),
      () => this.generateReliabilityRecommendations(nodes, edges, context),
      () => this.generateMaintenanceRecommendations(nodes, edges, context),
      () => this.generateArchitectureRecommendations(nodes, edges, context),
      () => this.generateMonitoringRecommendations(nodes, edges, context),
      () => this.generateComplianceRecommendations(nodes, edges, context),
    ]

    // Execute strategies
    for (const strategy of strategies) {
      try {
        const strategyRecs = await strategy()
        recommendations.push(...strategyRecs)
      } catch (error) {
        console.warn('Recommendation strategy failed:', error)
      }
    }

    // Apply filters and ranking
    let filteredRecs = this.filterRecommendations(recommendations, context)
    filteredRecs = this.rankRecommendations(filteredRecs, context)
    filteredRecs = this.deduplicateRecommendations(filteredRecs)

    // Apply limit
    if (context.maxRecommendations) {
      filteredRecs = filteredRecs.slice(0, context.maxRecommendations)
    }

    return filteredRecs
  }

  // Structural recommendations (missing connections, isolated nodes, etc.)
  private async generateStructuralRecommendations(
    nodes: Node[],
    edges: Edge[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Find isolated nodes
    const connectedNodes = new Set<string>()
    edges.forEach(edge => {
      connectedNodes.add(edge.from)
      connectedNodes.add(edge.to)
    })

    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id))

    for (const node of isolatedNodes) {
      if (node.type === 'Service' || node.type === 'Database' || node.type === 'API') {
        recommendations.push({
          id: `isolated_${node.id}`,
          type: 'architecture',
          priority: 'medium',
          category: 'connections',
          title: `Connect isolated ${node.type.toLowerCase()}`,
          description: `${node.type} "${node.properties.name || node.id}" has no connections`,
          reasoning: 'Isolated components may indicate missing dependencies or unused resources',
          confidence: 0.8,
          impact: {
            score: 60,
            description: 'Improves system visibility and dependency tracking',
            affectedEntities: [node.id],
          },
          effort: {
            level: 'low',
            estimatedTime: '15-30 minutes',
            complexity: 'Simple connection establishment',
          },
          actions: [
            {
              type: 'create',
              target: 'connection',
              description: `Establish appropriate connections for ${node.type}`,
              parameters: { nodeId: node.id, nodeType: node.type },
            },
          ],
          benefits: [
            'Better system understanding',
            'Improved dependency tracking',
            'Enhanced monitoring capabilities',
          ],
          metadata: {
            createdAt: new Date(),
            source: 'structural_analysis',
            algorithm: 'isolated_node_detection',
            version: '1.0',
          },
        })
      }
    }

    // Find services without database connections
    const services = nodes.filter(n => n.type === 'Service')
    const databases = nodes.filter(n => n.type === 'Database')

    if (services.length > 0 && databases.length > 0) {
      const servicesWithDbConnections = new Set<string>()

      edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from)
        const toNode = nodes.find(n => n.id === edge.to)

        if (
          fromNode?.type === 'Service' &&
          (toNode?.type === 'Database' || edge.type === 'DEPENDS_ON' || edge.type === 'CONNECTS_TO')
        ) {
          servicesWithDbConnections.add(fromNode.id)
        }
      })

      const servicesWithoutDb = services.filter(s => !servicesWithDbConnections.has(s.id))

      for (const service of servicesWithoutDb) {
        recommendations.push({
          id: `service_db_${service.id}`,
          type: 'architecture',
          priority: 'high',
          category: 'connections',
          title: 'Add database connection',
          description: `Service "${service.properties.name || service.id}" may need database connectivity`,
          reasoning: 'Most services require data persistence or caching capabilities',
          confidence: 0.7,
          impact: {
            score: 75,
            description: 'Ensures proper data management and persistence',
            affectedEntities: [service.id],
          },
          effort: {
            level: 'medium',
            estimatedTime: '1-2 hours',
            complexity: 'Database integration and configuration',
          },
          actions: [
            {
              type: 'create',
              target: 'database_connection',
              description: 'Establish database connection for service',
              parameters: { serviceId: service.id, suggestedDatabases: databases.map(d => d.id) },
            },
          ],
          benefits: [
            'Proper data persistence',
            'Improved service reliability',
            'Better data consistency',
          ],
          metadata: {
            createdAt: new Date(),
            source: 'structural_analysis',
            algorithm: 'service_database_analysis',
            version: '1.0',
          },
        })
      }
    }

    return recommendations
  }

  // Security recommendations
  private async generateSecurityRecommendations(
    nodes: Node[],
    edges: Edge[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Find services without proper configuration
    const services = nodes.filter(n => n.type === 'Service')
    const secrets = nodes.filter(n => n.type === 'Secret')
    const configs = nodes.filter(n => n.type === 'Configuration')

    // Check for hardcoded secrets
    const servicesWithSecrets = new Set<string>()
    edges.forEach(edge => {
      if (edge.type === 'REQUIRES' || edge.type === 'DEPENDS_ON') {
        const toNode = nodes.find(n => n.id === edge.to)
        if (
          toNode?.type === 'Secret' ||
          (toNode?.type === 'Configuration' &&
            (toNode.properties.key?.includes('PASSWORD') ||
              toNode.properties.key?.includes('SECRET') ||
              toNode.properties.key?.includes('KEY')))
        ) {
          servicesWithSecrets.add(edge.from)
        }
      }
    })

    const servicesWithoutSecrets = services.filter(s => !servicesWithSecrets.has(s.id))

    for (const service of servicesWithoutSecrets) {
      recommendations.push({
        id: `security_config_${service.id}`,
        type: 'security',
        priority: 'high',
        category: 'security',
        title: 'Add security configuration',
        description: `Service "${service.properties.name || service.id}" may need security credentials`,
        reasoning: 'Services typically require API keys, passwords, or other security credentials',
        confidence: 0.6,
        impact: {
          score: 85,
          description: 'Improves security posture and prevents credential exposure',
          affectedEntities: [service.id],
        },
        effort: {
          level: 'medium',
          estimatedTime: '30-60 minutes',
          complexity: 'Security configuration and credential management',
        },
        actions: [
          {
            type: 'create',
            target: 'security_config',
            description: 'Add appropriate security configurations',
            parameters: { serviceId: service.id },
          },
        ],
        benefits: [
          'Enhanced security posture',
          'Proper credential management',
          'Reduced security risks',
        ],
        risks: [
          'Potential service disruption during configuration',
          'Need for proper secret management',
        ],
        metadata: {
          createdAt: new Date(),
          source: 'security_analysis',
          algorithm: 'security_config_detection',
          version: '1.0',
        },
      })
    }

    return recommendations
  }

  // Performance recommendations
  private async generatePerformanceRecommendations(
    nodes: Node[],
    edges: Edge[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Find over-connected nodes that might be bottlenecks
    const nodeConnections = new Map<string, number>()
    edges.forEach(edge => {
      nodeConnections.set(edge.from, (nodeConnections.get(edge.from) || 0) + 1)
      nodeConnections.set(edge.to, (nodeConnections.get(edge.to) || 0) + 1)
    })

    const avgConnections =
      Array.from(nodeConnections.values()).reduce((a, b) => a + b, 0) / nodeConnections.size
    const threshold = avgConnections * 2.5

    for (const [nodeId, connections] of nodeConnections) {
      if (connections > threshold) {
        const node = nodes.find(n => n.id === nodeId)
        if (node && (node.type === 'Service' || node.type === 'Database')) {
          recommendations.push({
            id: `performance_bottleneck_${nodeId}`,
            type: 'performance',
            priority: 'medium',
            category: 'infrastructure',
            title: 'Potential performance bottleneck',
            description: `${node.type} "${node.properties.name || nodeId}" has many connections (${connections})`,
            reasoning:
              'High connectivity may indicate performance bottlenecks or single points of failure',
            confidence: 0.7,
            impact: {
              score: 70,
              description: 'Reduces bottlenecks and improves system performance',
              affectedEntities: [nodeId],
            },
            effort: {
              level: 'high',
              estimatedTime: '4-8 hours',
              complexity: 'Architecture redesign and load distribution',
            },
            actions: [
              {
                type: 'configure',
                target: 'load_balancing',
                description: 'Consider load balancing or connection pooling',
                parameters: { nodeId, connectionCount: connections },
              },
            ],
            benefits: [
              'Improved performance',
              'Better scalability',
              'Reduced single points of failure',
            ],
            metadata: {
              createdAt: new Date(),
              source: 'performance_analysis',
              algorithm: 'bottleneck_detection',
              version: '1.0',
            },
          })
        }
      }
    }

    return recommendations
  }

  // Reliability recommendations
  private async generateReliabilityRecommendations(
    nodes: Node[],
    edges: Edge[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Find single points of failure
    const criticalNodes = this.findCriticalNodes(nodes, edges)

    for (const nodeId of criticalNodes) {
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        recommendations.push({
          id: `reliability_spof_${nodeId}`,
          type: 'reliability',
          priority: 'high',
          category: 'infrastructure',
          title: 'Single point of failure detected',
          description: `${node.type} "${node.properties.name || nodeId}" is a critical dependency`,
          reasoning: 'Failure of this component would affect multiple other components',
          confidence: 0.8,
          impact: {
            score: 90,
            description: 'Prevents system-wide failures and improves resilience',
            affectedEntities: [nodeId],
          },
          effort: {
            level: 'high',
            estimatedTime: '1-2 days',
            complexity: 'Redundancy implementation and failover configuration',
          },
          actions: [
            {
              type: 'create',
              target: 'redundancy',
              description: 'Implement redundancy and failover mechanisms',
              parameters: { nodeId, nodeType: node.type },
            },
          ],
          benefits: [
            'Improved system reliability',
            'Reduced downtime risk',
            'Better disaster recovery',
          ],
          metadata: {
            createdAt: new Date(),
            source: 'reliability_analysis',
            algorithm: 'spof_detection',
            version: '1.0',
          },
        })
      }
    }

    return recommendations
  }

  // Maintenance recommendations
  private async generateMaintenanceRecommendations(
    nodes: Node[],
    edges: Edge[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Find old or outdated components
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)

    const oldNodes = nodes.filter(
      node =>
        new Date(node.metadata.createdAt) < sixMonthsAgo &&
        !new Date(node.metadata.updatedAt || node.metadata.createdAt).getTime()
    )

    for (const node of oldNodes) {
      if (node.type === 'Service' || node.type === 'Configuration') {
        recommendations.push({
          id: `maintenance_update_${node.id}`,
          type: 'maintenance',
          priority: 'low',
          category: 'maintenance',
          title: 'Component needs review',
          description: `${node.type} "${node.properties.name || node.id}" hasn't been updated recently`,
          reasoning: 'Regular maintenance and updates are important for security and performance',
          confidence: 0.5,
          impact: {
            score: 40,
            description: 'Ensures components are up-to-date and secure',
            affectedEntities: [node.id],
          },
          effort: {
            level: 'low',
            estimatedTime: '30 minutes',
            complexity: 'Review and update component configuration',
          },
          actions: [
            {
              type: 'update',
              target: 'component',
              description: 'Review and update component configuration',
              parameters: { nodeId: node.id },
            },
          ],
          benefits: ['Improved security', 'Better performance', 'Up-to-date documentation'],
          metadata: {
            createdAt: new Date(),
            source: 'maintenance_analysis',
            algorithm: 'staleness_detection',
            version: '1.0',
          },
        })
      }
    }

    return recommendations
  }

  // Architecture recommendations
  private async generateArchitectureRecommendations(
    nodes: Node[],
    edges: Edge[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Analyze service patterns
    const services = nodes.filter(n => n.type === 'Service')
    const apis = nodes.filter(n => n.type === 'API')

    // Suggest API Gateway if many services exist without one
    if (services.length > 3 && apis.length === 0) {
      recommendations.push({
        id: 'architecture_api_gateway',
        type: 'architecture',
        priority: 'medium',
        category: 'architecture',
        title: 'Consider API Gateway',
        description: `With ${services.length} services, an API Gateway could improve architecture`,
        reasoning: 'API Gateway provides centralized routing, authentication, and monitoring',
        confidence: 0.6,
        impact: {
          score: 75,
          description: 'Improves API management and system architecture',
          affectedEntities: services.map(s => s.id),
        },
        effort: {
          level: 'high',
          estimatedTime: '1-2 weeks',
          complexity: 'API Gateway implementation and service integration',
        },
        actions: [
          {
            type: 'create',
            target: 'api_gateway',
            description: 'Implement API Gateway for service management',
            parameters: { services: services.map(s => s.id) },
          },
        ],
        benefits: [
          'Centralized API management',
          'Better security and monitoring',
          'Improved scalability',
        ],
        metadata: {
          createdAt: new Date(),
          source: 'architecture_analysis',
          algorithm: 'api_gateway_suggestion',
          version: '1.0',
        },
      })
    }

    return recommendations
  }

  // Monitoring recommendations
  private async generateMonitoringRecommendations(
    nodes: Node[],
    edges: Edge[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Find services without monitoring
    const services = nodes.filter(n => n.type === 'Service')
    const monitoringConnections = new Set<string>()

    edges.forEach(edge => {
      if (edge.type === 'MONITORS' || edge.type === 'OBSERVES') {
        monitoringConnections.add(edge.to)
      }
    })

    const unmonitoredServices = services.filter(s => !monitoringConnections.has(s.id))

    for (const service of unmonitoredServices) {
      recommendations.push({
        id: `monitoring_${service.id}`,
        type: 'monitoring',
        priority: 'medium',
        category: 'monitoring',
        title: 'Add monitoring',
        description: `Service "${service.properties.name || service.id}" lacks monitoring`,
        reasoning: 'Monitoring is essential for observability and incident response',
        confidence: 0.8,
        impact: {
          score: 70,
          description: 'Improves observability and incident detection',
          affectedEntities: [service.id],
        },
        effort: {
          level: 'medium',
          estimatedTime: '2-4 hours',
          complexity: 'Monitoring setup and configuration',
        },
        actions: [
          {
            type: 'create',
            target: 'monitoring',
            description: 'Set up monitoring for service',
            parameters: { serviceId: service.id },
          },
        ],
        benefits: ['Better observability', 'Faster incident detection', 'Performance insights'],
        metadata: {
          createdAt: new Date(),
          source: 'monitoring_analysis',
          algorithm: 'monitoring_gap_detection',
          version: '1.0',
        },
      })
    }

    return recommendations
  }

  // Compliance recommendations
  private async generateComplianceRecommendations(
    nodes: Node[],
    edges: Edge[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // Check for documentation gaps
    const documents = nodes.filter(n => n.type === 'Document')
    const services = nodes.filter(n => n.type === 'Service')

    if (services.length > documents.length * 2) {
      recommendations.push({
        id: 'compliance_documentation',
        type: 'compliance',
        priority: 'low',
        category: 'documentation',
        title: 'Improve documentation coverage',
        description: `${services.length} services but only ${documents.length} documents`,
        reasoning: 'Proper documentation is important for compliance and maintainability',
        confidence: 0.6,
        impact: {
          score: 50,
          description: 'Improves compliance and knowledge sharing',
          affectedEntities: services.map(s => s.id),
        },
        effort: {
          level: 'medium',
          estimatedTime: '4-8 hours',
          complexity: 'Documentation creation and maintenance',
        },
        actions: [
          {
            type: 'create',
            target: 'documentation',
            description: 'Create comprehensive service documentation',
            parameters: { services: services.map(s => s.id) },
          },
        ],
        benefits: ['Better compliance', 'Improved knowledge sharing', 'Easier onboarding'],
        metadata: {
          createdAt: new Date(),
          source: 'compliance_analysis',
          algorithm: 'documentation_gap_detection',
          version: '1.0',
        },
      })
    }

    return recommendations
  }

  // Helper methods
  private findCriticalNodes(nodes: Node[], edges: Edge[]): string[] {
    const criticalNodes: string[] = []

    // Simple approach: nodes with high centrality that are bridges
    for (const node of nodes) {
      const centrality = this.graph.getCentralityScore(node.id)
      if (centrality > 5) {
        // Arbitrary threshold
        // Check if removing this node would disconnect the graph
        const neighbors = this.graph.getNeighbors(node.id)
        if (neighbors.length > 2) {
          criticalNodes.push(node.id)
        }
      }
    }

    return criticalNodes
  }

  private filterRecommendations(
    recommendations: Recommendation[],
    context: RecommendationContext
  ): Recommendation[] {
    let filtered = recommendations

    // Filter by type exclusions
    if (context.excludeTypes?.length) {
      filtered = filtered.filter(rec => !context.excludeTypes!.includes(rec.type))
    }

    // Filter by priorities
    if (context.priorities?.length) {
      filtered = filtered.filter(rec => context.priorities!.includes(rec.type))
    }

    // Filter by environment
    if (context.environment) {
      // Could filter based on environment-specific rules
    }

    return filtered
  }

  private rankRecommendations(
    recommendations: Recommendation[],
    context: RecommendationContext
  ): Recommendation[] {
    return recommendations.sort((a, b) => {
      // Priority ranking
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Impact score
      const impactDiff = b.impact.score - a.impact.score
      if (impactDiff !== 0) return impactDiff

      // Confidence
      const confidenceDiff = b.confidence - a.confidence
      if (confidenceDiff !== 0) return confidenceDiff

      // Effort (prefer lower effort)
      const effortOrder = { low: 3, medium: 2, high: 1 }
      return effortOrder[b.effort.level] - effortOrder[a.effort.level]
    })
  }

  private deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>()
    return recommendations.filter(rec => {
      const key = `${rec.type}-${rec.category}-${rec.title}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Feedback and learning
  addFeedback(feedback: RecommendationFeedback): void {
    this.feedback.push(feedback)
    this.updateRecommendationWeights(feedback)
  }

  private updateRecommendationWeights(feedback: RecommendationFeedback): void {
    // Simple learning: adjust confidence based on feedback
    // In a real implementation, this would use more sophisticated ML
    const recommendation = this.feedback.find(f => f.recommendationId === feedback.recommendationId)
    if (recommendation && feedback.rating < 3) {
      // Lower confidence for poorly rated recommendations
      // This would be persisted and used in future recommendations
    }
  }

  // Rule and pattern management
  private initializeRules(): void {
    // Initialize built-in recommendation rules
    this.rules = [
      {
        id: 'service_database_rule',
        condition: (nodes, edges) => {
          const services = nodes.filter(n => n.type === 'Service')
          const hasDbConnections = services.some(s =>
            edges.some(e => e.from === s.id && nodes.find(n => n.id === e.to)?.type === 'Database')
          )
          return services.length > 0 && !hasDbConnections
        },
        recommendation: {
          type: 'architecture',
          priority: 'high',
          category: 'connections',
        },
      },
    ]
  }

  private initializePatterns(): void {
    // Initialize common architectural patterns
    this.patterns = [
      {
        id: 'microservices_pattern',
        description: 'Multiple services with API Gateway',
        detect: (nodes, edges) => {
          const services = nodes.filter(n => n.type === 'Service')
          const apis = nodes.filter(n => n.type === 'API')
          return services.length > 3 && apis.length === 0
        },
        recommend: 'api_gateway',
      },
    ]
  }
}

// Supporting interfaces
interface RecommendationRule {
  id: string
  condition: (nodes: Node[], edges: Edge[]) => boolean
  recommendation: Partial<Recommendation>
}

interface RecommendationPattern {
  id: string
  description: string
  detect: (nodes: Node[], edges: Edge[]) => boolean
  recommend: string
}
