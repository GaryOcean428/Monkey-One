/**
 * Agent Integration System
 *
 * Integrates the memory graph system with existing Monkey-One agents
 * to enable collaborative intelligence and shared knowledge.
 */

import type { MemoryGraph } from './memory-graph'
import type { IngestorAgent } from './ingestor-agent'
import type { PlannerAgent } from './planner-agent'
import type { RecommendationsEngine } from './recommendations-engine'
import type { Node, Edge, NodeType } from './types'

export interface AgentMessage {
  id: string
  from: string
  to: string
  type: AgentMessageType
  payload: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  metadata?: Record<string, any>
}

export type AgentMessageType =
  | 'knowledge_request'
  | 'knowledge_response'
  | 'entity_update'
  | 'relationship_update'
  | 'recommendation_request'
  | 'recommendation_response'
  | 'analysis_request'
  | 'analysis_response'
  | 'collaboration_invite'
  | 'status_update'
  | 'error_report'

export interface AgentCapability {
  id: string
  name: string
  description: string
  inputTypes: string[]
  outputTypes: string[]
  version: string
}

export interface RegisteredAgent {
  id: string
  name: string
  type: AgentType
  capabilities: AgentCapability[]
  status: 'active' | 'inactive' | 'busy' | 'error'
  lastSeen: Date
  messageHandler: (message: AgentMessage) => Promise<AgentMessage | null>
  metadata: {
    version: string
    description: string
    tags: string[]
  }
}

export type AgentType =
  | 'reasoning'
  | 'planning'
  | 'execution'
  | 'monitoring'
  | 'analysis'
  | 'communication'
  | 'specialized'

export interface KnowledgeQuery {
  type: 'entities' | 'relationships' | 'patterns' | 'insights'
  filters?: {
    nodeTypes?: NodeType[]
    timeRange?: { start: Date; end: Date }
    source?: string
    confidence?: number
  }
  context?: string
  maxResults?: number
}

export interface KnowledgeResponse {
  query: KnowledgeQuery
  results: {
    entities?: Node[]
    relationships?: Edge[]
    patterns?: any[]
    insights?: any[]
  }
  metadata: {
    totalResults: number
    processingTime: number
    confidence: number
  }
}

export class AgentIntegrationHub {
  private graph: MemoryGraph
  private ingestor: IngestorAgent
  private planner: PlannerAgent
  private recommendations: RecommendationsEngine
  private agents: Map<string, RegisteredAgent> = new Map()
  private messageQueue: AgentMessage[] = []
  private messageHandlers: Map<
    AgentMessageType,
    (message: AgentMessage) => Promise<AgentMessage | null>
  > = new Map()
  private isProcessing = false

  constructor(
    graph: MemoryGraph,
    ingestor: IngestorAgent,
    planner: PlannerAgent,
    recommendations: RecommendationsEngine
  ) {
    this.graph = graph
    this.ingestor = ingestor
    this.planner = planner
    this.recommendations = recommendations
    this.initializeMessageHandlers()
  }

  // Agent registration and management
  registerAgent(agent: RegisteredAgent): void {
    this.agents.set(agent.id, agent)
    console.log(`Agent registered: ${agent.name} (${agent.id})`)

    // Send welcome message with capabilities
    this.sendMessage({
      id: this.generateMessageId(),
      from: 'memory-graph-hub',
      to: agent.id,
      type: 'status_update',
      payload: {
        status: 'registered',
        availableCapabilities: this.getHubCapabilities(),
      },
      timestamp: new Date(),
      priority: 'medium',
    })
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId)
    console.log(`Agent unregistered: ${agentId}`)
  }

  getRegisteredAgents(): RegisteredAgent[] {
    return Array.from(this.agents.values())
  }

  updateAgentStatus(agentId: string, status: RegisteredAgent['status']): void {
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.status = status
      agent.lastSeen = new Date()
    }
  }

  // Message handling
  async sendMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message)
    if (!this.isProcessing) {
      this.processMessageQueue()
    }
  }

  private async processMessageQueue(): Promise<void> {
    this.isProcessing = true

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!
      await this.processMessage(message)
    }

    this.isProcessing = false
  }

  private async processMessage(message: AgentMessage): Promise<void> {
    try {
      // Handle internal messages
      if (message.to === 'memory-graph-hub') {
        const handler = this.messageHandlers.get(message.type)
        if (handler) {
          const response = await handler(message)
          if (response) {
            await this.sendMessage(response)
          }
        }
        return
      }

      // Forward to target agent
      const targetAgent = this.agents.get(message.to)
      if (targetAgent && targetAgent.messageHandler) {
        const response = await targetAgent.messageHandler(message)
        if (response) {
          await this.sendMessage(response)
        }
      }
    } catch (error) {
      console.error('Error processing message:', error)

      // Send error response
      if (message.from !== 'memory-graph-hub') {
        await this.sendMessage({
          id: this.generateMessageId(),
          from: 'memory-graph-hub',
          to: message.from,
          type: 'error_report',
          payload: {
            originalMessage: message.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          timestamp: new Date(),
          priority: 'high',
        })
      }
    }
  }

  // Knowledge sharing
  async queryKnowledge(query: KnowledgeQuery): Promise<KnowledgeResponse> {
    const startTime = Date.now()
    const results: KnowledgeResponse['results'] = {}

    try {
      if (query.type === 'entities' || query.type === 'patterns') {
        const graphQuery: any = {}

        if (query.filters?.nodeTypes) {
          // Query for specific node types
          const allEntities: Node[] = []
          for (const nodeType of query.filters.nodeTypes) {
            const typeResults = this.graph.query({ nodeType })
            allEntities.push(...typeResults.nodes)
          }
          results.entities = allEntities
        } else {
          // Query all entities
          const allResults = this.graph.query({})
          results.entities = allResults.nodes
          results.relationships = allResults.edges
        }

        // Apply filters
        if (results.entities && query.filters) {
          results.entities = this.applyEntityFilters(results.entities, query.filters)
        }
      }

      if (query.type === 'relationships' || query.type === 'patterns') {
        const allResults = this.graph.query({})
        results.relationships = allResults.edges
      }

      if (query.type === 'insights') {
        // Generate insights using planner
        const recommendations = await this.recommendations.generateRecommendations({
          maxRecommendations: query.maxResults || 10,
        })
        results.insights = recommendations
      }

      // Apply result limit
      if (query.maxResults) {
        if (results.entities) results.entities = results.entities.slice(0, query.maxResults)
        if (results.relationships)
          results.relationships = results.relationships.slice(0, query.maxResults)
        if (results.insights) results.insights = results.insights.slice(0, query.maxResults)
      }

      const processingTime = Date.now() - startTime
      const totalResults =
        (results.entities?.length || 0) +
        (results.relationships?.length || 0) +
        (results.insights?.length || 0)

      return {
        query,
        results,
        metadata: {
          totalResults,
          processingTime,
          confidence: 0.8, // Default confidence
        },
      }
    } catch (error) {
      console.error('Knowledge query failed:', error)
      throw error
    }
  }

  private applyEntityFilters(
    entities: Node[],
    filters: NonNullable<KnowledgeQuery['filters']>
  ): Node[] {
    let filtered = entities

    if (filters.timeRange) {
      filtered = filtered.filter(entity => {
        const createdAt = new Date(entity.metadata.createdAt)
        return createdAt >= filters.timeRange!.start && createdAt <= filters.timeRange!.end
      })
    }

    if (filters.source) {
      filtered = filtered.filter(entity => entity.metadata.source === filters.source)
    }

    if (filters.confidence) {
      filtered = filtered.filter(
        entity => (entity.metadata.confidence || 1.0) >= filters.confidence!
      )
    }

    return filtered
  }

  // Agent collaboration
  async requestCollaboration(
    requestingAgentId: string,
    targetAgentId: string,
    task: string,
    context?: any
  ): Promise<void> {
    await this.sendMessage({
      id: this.generateMessageId(),
      from: requestingAgentId,
      to: targetAgentId,
      type: 'collaboration_invite',
      payload: {
        task,
        context,
        requestedCapabilities: [],
      },
      timestamp: new Date(),
      priority: 'medium',
    })
  }

  // Integration with specific agent types
  async integrateWithReasoningAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent || agent.type !== 'reasoning') {
      throw new Error('Invalid reasoning agent')
    }

    // Share current knowledge state
    const knowledgeSnapshot = await this.queryKnowledge({
      type: 'patterns',
      maxResults: 100,
    })

    await this.sendMessage({
      id: this.generateMessageId(),
      from: 'memory-graph-hub',
      to: agentId,
      type: 'knowledge_response',
      payload: knowledgeSnapshot,
      timestamp: new Date(),
      priority: 'medium',
    })
  }

  async integrateWithPlanningAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent || agent.type !== 'planning') {
      throw new Error('Invalid planning agent')
    }

    // Share recommendations and analysis
    const recommendations = await this.recommendations.generateRecommendations({
      maxRecommendations: 20,
    })

    await this.sendMessage({
      id: this.generateMessageId(),
      from: 'memory-graph-hub',
      to: agentId,
      type: 'recommendation_response',
      payload: { recommendations },
      timestamp: new Date(),
      priority: 'high',
    })
  }

  async integrateWithExecutionAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent || agent.type !== 'execution') {
      throw new Error('Invalid execution agent')
    }

    // Provide actionable recommendations
    const recommendations = await this.recommendations.generateRecommendations({
      priorities: ['reliability', 'security', 'performance'],
      maxRecommendations: 10,
    })

    const actionableRecs = recommendations.filter(
      rec => rec.actions.length > 0 && rec.effort.level !== 'high'
    )

    await this.sendMessage({
      id: this.generateMessageId(),
      from: 'memory-graph-hub',
      to: agentId,
      type: 'recommendation_response',
      payload: {
        recommendations: actionableRecs,
        context: 'execution_ready',
      },
      timestamp: new Date(),
      priority: 'high',
    })
  }

  // Message handlers initialization
  private initializeMessageHandlers(): void {
    this.messageHandlers.set('knowledge_request', async message => {
      const query = message.payload as KnowledgeQuery
      const response = await this.queryKnowledge(query)

      return {
        id: this.generateMessageId(),
        from: 'memory-graph-hub',
        to: message.from,
        type: 'knowledge_response',
        payload: response,
        timestamp: new Date(),
        priority: message.priority,
      }
    })

    this.messageHandlers.set('entity_update', async message => {
      const { entity, operation } = message.payload

      try {
        switch (operation) {
          case 'create':
            this.graph.addNode(entity)
            break
          case 'update':
            this.graph.updateNode(entity.id, entity)
            break
          case 'delete':
            this.graph.deleteNode(entity.id)
            break
        }

        return {
          id: this.generateMessageId(),
          from: 'memory-graph-hub',
          to: message.from,
          type: 'status_update',
          payload: { status: 'success', operation },
          timestamp: new Date(),
          priority: 'low',
        }
      } catch (error) {
        return {
          id: this.generateMessageId(),
          from: 'memory-graph-hub',
          to: message.from,
          type: 'error_report',
          payload: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date(),
          priority: 'high',
        }
      }
    })

    this.messageHandlers.set('recommendation_request', async message => {
      const context = message.payload
      const recommendations = await this.recommendations.generateRecommendations(context)

      return {
        id: this.generateMessageId(),
        from: 'memory-graph-hub',
        to: message.from,
        type: 'recommendation_response',
        payload: { recommendations },
        timestamp: new Date(),
        priority: message.priority,
      }
    })

    this.messageHandlers.set('analysis_request', async message => {
      const { type, entityId } = message.payload
      let analysis

      try {
        switch (type) {
          case 'risk':
            analysis = await this.planner.analyzeRisks(entityId)
            break
          case 'dependencies':
            analysis = this.planner.analyzeDependencies(entityId)
            break
          case 'impact':
            analysis = this.planner.analyzeImpact(entityId)
            break
          default:
            throw new Error(`Unknown analysis type: ${type}`)
        }

        return {
          id: this.generateMessageId(),
          from: 'memory-graph-hub',
          to: message.from,
          type: 'analysis_response',
          payload: { type, analysis },
          timestamp: new Date(),
          priority: message.priority,
        }
      } catch (error) {
        return {
          id: this.generateMessageId(),
          from: 'memory-graph-hub',
          to: message.from,
          type: 'error_report',
          payload: { error: error instanceof Error ? error.message : 'Analysis failed' },
          timestamp: new Date(),
          priority: 'high',
        }
      }
    })
  }

  // Utility methods
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getHubCapabilities(): AgentCapability[] {
    return [
      {
        id: 'knowledge_query',
        name: 'Knowledge Query',
        description: 'Query the memory graph for entities, relationships, and patterns',
        inputTypes: ['KnowledgeQuery'],
        outputTypes: ['KnowledgeResponse'],
        version: '1.0',
      },
      {
        id: 'entity_management',
        name: 'Entity Management',
        description: 'Create, update, and delete entities in the memory graph',
        inputTypes: ['Node', 'Edge'],
        outputTypes: ['StatusUpdate'],
        version: '1.0',
      },
      {
        id: 'analysis',
        name: 'Graph Analysis',
        description: 'Perform risk, dependency, and impact analysis',
        inputTypes: ['AnalysisRequest'],
        outputTypes: ['AnalysisResponse'],
        version: '1.0',
      },
      {
        id: 'recommendations',
        name: 'AI Recommendations',
        description: 'Generate intelligent recommendations based on graph analysis',
        inputTypes: ['RecommendationContext'],
        outputTypes: ['Recommendation[]'],
        version: '1.0',
      },
    ]
  }

  // Statistics and monitoring
  getIntegrationStats(): {
    registeredAgents: number
    activeAgents: number
    messagesSent: number
    messagesProcessed: number
    averageResponseTime: number
  } {
    const agents = Array.from(this.agents.values())
    return {
      registeredAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      messagesSent: 0, // Would track in real implementation
      messagesProcessed: 0, // Would track in real implementation
      averageResponseTime: 0, // Would calculate in real implementation
    }
  }

  // Cleanup
  shutdown(): void {
    this.messageQueue = []
    this.agents.clear()
    this.messageHandlers.clear()
    console.log('Agent integration hub shutdown')
  }
}

// Helper functions for agent integration
export function createAgentIntegrationHub(
  graph: MemoryGraph,
  ingestor: IngestorAgent,
  planner: PlannerAgent,
  recommendations: RecommendationsEngine
): AgentIntegrationHub {
  return new AgentIntegrationHub(graph, ingestor, planner, recommendations)
}

// Example agent implementations
export class ExampleReasoningAgent implements RegisteredAgent {
  id = 'reasoning-agent-1'
  name = 'Example Reasoning Agent'
  type: AgentType = 'reasoning'
  status: RegisteredAgent['status'] = 'active'
  lastSeen = new Date()
  capabilities: AgentCapability[] = [
    {
      id: 'logical_inference',
      name: 'Logical Inference',
      description: 'Perform logical reasoning on graph data',
      inputTypes: ['KnowledgeQuery'],
      outputTypes: ['InferenceResult'],
      version: '1.0',
    },
  ]
  metadata = {
    version: '1.0.0',
    description: 'Example reasoning agent for demonstration',
    tags: ['reasoning', 'inference', 'logic'],
  }

  async messageHandler(message: AgentMessage): Promise<AgentMessage | null> {
    if (message.type === 'knowledge_request') {
      // Process knowledge request and return insights
      return {
        id: `response_${Date.now()}`,
        from: this.id,
        to: message.from,
        type: 'knowledge_response',
        payload: {
          insights: ['Example insight from reasoning agent'],
          confidence: 0.8,
        },
        timestamp: new Date(),
        priority: 'medium',
      }
    }
    return null
  }
}
