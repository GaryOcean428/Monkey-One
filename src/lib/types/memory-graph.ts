/**
 * Memory Graph System Types for Monkey-One
 * Adapted for AI agent coordination and chat context management
 */

import { MessageType } from './core'

// ============================================
// CORE GRAPH TYPES
// ============================================

export interface GraphNode {
  id: string
  type: NodeType
  properties: Record<string, any>
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
    source?: string
    confidence?: number
    accessCount?: number
    lastAccessed?: Date
    embedding?: number[]
  }
}

export interface GraphEdge {
  id: string
  type: EdgeType
  from: string
  to: string
  properties?: Record<string, any>
  metadata: {
    createdAt: Date
    strength?: number
    bidirectional?: boolean
    confidence?: number
    weight?: number
  }
}

export interface GraphQuery {
  nodeType?: NodeType
  edgeType?: EdgeType
  properties?: Record<string, any>
  depth?: number
  limit?: number
  minConfidence?: number
  timeRange?: {
    start: Date
    end: Date
  }
  embedding?: number[]
  similarityThreshold?: number
}

export interface GraphQueryResult {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: {
    totalNodes: number
    totalEdges: number
    queryTime: number
    confidence: number
  }
}

// ============================================
// NODE TYPES - AI/CHAT FOCUSED
// ============================================

export type NodeType =
  // AI & Chat Context
  | 'Message'
  | 'Conversation'
  | 'Context'
  | 'Intent'
  | 'Entity'
  | 'Agent'
  | 'Model'
  | 'Prompt'
  | 'Response'
  | 'Tool'

  // Knowledge & Memory
  | 'Concept'
  | 'Fact'
  | 'Rule'
  | 'Pattern'
  | 'Memory'
  | 'Document'
  | 'Code'
  | 'Function'
  | 'Variable'

  // User & Session
  | 'User'
  | 'Session'
  | 'Preference'
  | 'Goal'
  | 'Task'
  | 'Workflow'
  | 'Step'
  | 'Decision'
  | 'Outcome'

  // System & Infrastructure
  | 'Service'
  | 'API'
  | 'Database'
  | 'Configuration'
  | 'Error'
  | 'Event'
  | 'Metric'
  | 'Log'

// ============================================
// EDGE TYPES - RELATIONSHIP FOCUSED
// ============================================

export type EdgeType =
  // Conversational Relationships
  | 'RESPONDS_TO'
  | 'FOLLOWS'
  | 'REFERENCES'
  | 'MENTIONS'
  | 'CLARIFIES'
  | 'CONTRADICTS'
  | 'SUPPORTS'
  | 'EXTENDS'

  // Semantic Relationships
  | 'IS_A'
  | 'HAS_A'
  | 'PART_OF'
  | 'SIMILAR_TO'
  | 'CAUSES'
  | 'ENABLES'
  | 'PREVENTS'
  | 'REQUIRES'

  // Temporal Relationships
  | 'BEFORE'
  | 'AFTER'
  | 'DURING'
  | 'TRIGGERS'
  | 'LEADS_TO'
  | 'RESULTS_IN'
  | 'DEPENDS_ON'

  // Agent Relationships
  | 'CREATED_BY'
  | 'USED_BY'
  | 'PROCESSED_BY'
  | 'HANDLED_BY'
  | 'ASSIGNED_TO'
  | 'DELEGATED_TO'
  | 'COLLABORATED_ON'

  // System Relationships
  | 'CONNECTS_TO'
  | 'CALLS'
  | 'RETURNS'
  | 'STORES'
  | 'LOGS'
  | 'MONITORS'
  | 'CONFIGURES'
  | 'DEPLOYS'

// ============================================
// SPECIALIZED NODE INTERFACES
// ============================================

export interface MessageNode extends GraphNode {
  type: 'Message'
  properties: {
    content: string
    messageType: MessageType
    role: 'user' | 'assistant' | 'system'
    tokens?: number
    model?: string
    conversationId: string
    parentMessageId?: string
  }
}

export interface ConversationNode extends GraphNode {
  type: 'Conversation'
  properties: {
    title?: string
    userId: string
    messageCount: number
    startTime: Date
    endTime?: Date
    status: 'active' | 'completed' | 'archived'
    tags: string[]
  }
}

export interface AgentNode extends GraphNode {
  type: 'Agent'
  properties: {
    name: string
    agentType: string
    capabilities: string[]
    status: 'active' | 'idle' | 'busy' | 'error'
    version: string
    config: Record<string, any>
  }
}

export interface ConceptNode extends GraphNode {
  type: 'Concept'
  properties: {
    name: string
    definition: string
    category: string
    importance: number
    examples: string[]
    relatedTerms: string[]
  }
}

export interface ContextNode extends GraphNode {
  type: 'Context'
  properties: {
    scope: 'conversation' | 'session' | 'user' | 'global'
    variables: Record<string, any>
    activeGoals: string[]
    currentFocus: string
    priority: number
  }
}

// ============================================
// MEMORY INTEGRATION TYPES
// ============================================

export interface MemoryGraphItem {
  id: string
  nodeId: string
  memoryType: 'shortTerm' | 'workingMemory' | 'longTerm'
  content: string
  embedding?: number[]
  relevanceScore: number
  lastAccessed: Date
  accessCount: number
}

export interface GraphMemoryQuery {
  query: string
  context?: string[]
  memoryTypes?: ('shortTerm' | 'workingMemory' | 'longTerm')[]
  minRelevance?: number
  maxResults?: number
  includeEmbeddings?: boolean
}

// ============================================
// ANALYSIS & METRICS TYPES
// ============================================

export interface NodeMetrics {
  centrality: number
  clustering: number
  importance: number
  connectivity: number
  influence: number
}

export interface GraphMetrics {
  totalNodes: number
  totalEdges: number
  density: number
  averageClustering: number
  diameter: number
  components: number
  mostCentral: string[]
  mostInfluential: string[]
}

export interface ConversationMetrics {
  messageCount: number
  participantCount: number
  averageResponseTime: number
  topicDrift: number
  sentimentTrend: number[]
  keyEntities: string[]
  mainTopics: string[]
}

// ============================================
// AGENT COORDINATION TYPES
// ============================================

export interface AgentCoordinationContext {
  activeAgents: string[]
  sharedMemory: Map<string, any>
  communicationGraph: GraphEdge[]
  taskDependencies: Map<string, string[]>
  resourceAllocation: Map<string, number>
}

export interface CoordinationEvent {
  id: string
  type: 'handoff' | 'collaboration' | 'conflict' | 'completion'
  fromAgent: string
  toAgent?: string
  context: Record<string, any>
  timestamp: Date
  resolved: boolean
}

// ============================================
// SEARCH & RETRIEVAL TYPES
// ============================================

export interface SemanticSearchQuery {
  query: string
  embedding?: number[]
  filters?: {
    nodeTypes?: NodeType[]
    timeRange?: { start: Date; end: Date }
    confidence?: { min: number; max: number }
    properties?: Record<string, any>
  }
  options?: {
    limit?: number
    threshold?: number
    includeEdges?: boolean
    expandDepth?: number
  }
}

export interface SearchResult {
  node: GraphNode
  score: number
  explanation: string
  relatedNodes: GraphNode[]
  path?: string[]
}

// ============================================
// PERSISTENCE & SERIALIZATION TYPES
// ============================================

export interface GraphSnapshot {
  id: string
  timestamp: Date
  version: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: {
    nodeCount: number
    edgeCount: number
    memoryUsage: number
    compressionRatio: number
  }
}

export interface GraphDelta {
  id: string
  timestamp: Date
  operations: Array<{
    type: 'add' | 'update' | 'delete'
    target: 'node' | 'edge'
    id: string
    data?: GraphNode | GraphEdge
    changes?: Record<string, any>
  }>
}

// ============================================
// CONFIGURATION TYPES
// ============================================

export interface MemoryGraphConfig {
  maxNodes: number
  maxEdges: number
  pruningThreshold: number
  embeddingDimensions: number
  similarityThreshold: number
  memoryLevels: {
    shortTerm: { capacity: number; ttl: number }
    workingMemory: { capacity: number; ttl: number }
    longTerm: { capacity: number; compressionRatio: number }
  }
  indexing: {
    enableTypeIndex: boolean
    enableTimeIndex: boolean
    enableEmbeddingIndex: boolean
    enablePropertyIndex: string[]
  }
}

// ============================================
// EVENT TYPES
// ============================================

export interface GraphEvent {
  id: string
  type:
    | 'nodeAdded'
    | 'nodeUpdated'
    | 'nodeDeleted'
    | 'edgeAdded'
    | 'edgeUpdated'
    | 'edgeDeleted'
    | 'queryExecuted'
    | 'memoryPruned'
    | 'snapshotCreated'
  timestamp: Date
  data: any
  source: string
}

export type GraphEventHandler = (event: GraphEvent) => void | Promise<void>

// ============================================
// UTILITY TYPES
// ============================================

export type NodeFilter = (node: GraphNode) => boolean
export type EdgeFilter = (edge: GraphEdge) => boolean
export type SimilarityFunction = (a: number[], b: number[]) => number
export type EmbeddingFunction = (text: string) => Promise<number[]>
export type ConceptExtractor = (text: string) => Promise<ConceptNode[]>
export type RelationshipExtractor = (text: string, entities: GraphNode[]) => Promise<GraphEdge[]>
