/**
 * Real-time Collaboration System for Memory Graph
 *
 * Enables multiple users to collaborate on the same memory graph
 * with real-time updates, conflict resolution, and change tracking.
 */

import { EventEmitter } from 'events'
import type { Node, Edge, NodeType, EdgeType } from './types'
import type { MemoryGraph } from './memory-graph'

export interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  color: string
  isOnline: boolean
  lastSeen: Date
  permissions: UserPermissions
}

export interface UserPermissions {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canManageUsers: boolean
  canExport: boolean
}

export interface GraphOperation {
  id: string
  type: 'node_add' | 'node_update' | 'node_delete' | 'edge_add' | 'edge_update' | 'edge_delete'
  userId: string
  timestamp: Date
  data: any
  metadata?: {
    reason?: string
    batch?: string
    source?: string
  }
}

export interface CollaborationSession {
  id: string
  graphId: string
  users: CollaborationUser[]
  operations: GraphOperation[]
  createdAt: Date
  lastActivity: Date
}

export interface ConflictResolution {
  operationId: string
  conflictType: 'concurrent_edit' | 'delete_modified' | 'permission_denied'
  resolution: 'accept' | 'reject' | 'merge'
  resolvedBy: string
  resolvedAt: Date
}

export interface PresenceInfo {
  userId: string
  cursor?: { x: number; y: number }
  selectedNodeId?: string
  selectedEdgeId?: string
  isTyping?: boolean
  lastActivity: Date
}

export class CollaborationManager extends EventEmitter {
  private graph: MemoryGraph
  private sessionId: string
  private currentUser: CollaborationUser
  private users: Map<string, CollaborationUser> = new Map()
  private operations: GraphOperation[] = []
  private presence: Map<string, PresenceInfo> = new Map()
  private conflictQueue: ConflictResolution[] = []
  private isConnected: boolean = false

  constructor(graph: MemoryGraph, sessionId: string, currentUser: CollaborationUser) {
    super()
    this.graph = graph
    this.sessionId = sessionId
    this.currentUser = currentUser
    this.users.set(currentUser.id, currentUser)
  }

  // Connection management
  async connect(): Promise<void> {
    this.isConnected = true
    this.emit('connected', { sessionId: this.sessionId, user: this.currentUser })

    // Start heartbeat
    this.startHeartbeat()
  }

  async disconnect(): Promise<void> {
    this.isConnected = false
    this.emit('disconnected', { sessionId: this.sessionId, user: this.currentUser })
    this.stopHeartbeat()
  }

  private heartbeatInterval?: NodeJS.Timeout

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.emit('heartbeat', {
          userId: this.currentUser.id,
          timestamp: new Date(),
        })
      }
    }, 30000) // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = undefined
    }
  }

  // User management
  addUser(user: CollaborationUser): void {
    this.users.set(user.id, user)
    this.emit('user_joined', { user, sessionId: this.sessionId })
  }

  removeUser(userId: string): void {
    const user = this.users.get(userId)
    if (user) {
      this.users.delete(userId)
      this.presence.delete(userId)
      this.emit('user_left', { user, sessionId: this.sessionId })
    }
  }

  updateUserStatus(userId: string, isOnline: boolean): void {
    const user = this.users.get(userId)
    if (user) {
      user.isOnline = isOnline
      user.lastSeen = new Date()
      this.emit('user_status_changed', { user })
    }
  }

  getUsers(): CollaborationUser[] {
    return Array.from(this.users.values())
  }

  getOnlineUsers(): CollaborationUser[] {
    return Array.from(this.users.values()).filter(u => u.isOnline)
  }

  // Graph operations with collaboration
  async addNode(
    node: Omit<Node, 'metadata'> & { metadata?: Partial<Node['metadata']> }
  ): Promise<Node | null> {
    if (!this.currentUser.permissions.canWrite) {
      this.emit('permission_denied', {
        operation: 'node_add',
        userId: this.currentUser.id,
      })
      return null
    }

    const operation: GraphOperation = {
      id: this.generateOperationId(),
      type: 'node_add',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: node,
    }

    // Apply operation locally
    const addedNode = this.graph.addNode({
      ...node,
      metadata: {
        ...node.metadata,
        createdBy: this.currentUser.id,
        collaborationSession: this.sessionId,
      },
    })

    // Record operation
    this.operations.push(operation)

    // Broadcast to other users
    this.emit('operation', operation)

    return addedNode
  }

  async updateNode(nodeId: string, updates: Partial<Node>): Promise<Node | null> {
    if (!this.currentUser.permissions.canWrite) {
      this.emit('permission_denied', {
        operation: 'node_update',
        userId: this.currentUser.id,
      })
      return null
    }

    // Check for conflicts
    const conflict = this.checkForConflicts('node_update', nodeId)
    if (conflict) {
      await this.handleConflict(conflict)
      return null
    }

    const operation: GraphOperation = {
      id: this.generateOperationId(),
      type: 'node_update',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: { nodeId, updates },
    }

    // Apply operation locally
    const updatedNode = this.graph.updateNode(nodeId, {
      ...updates,
      metadata: {
        ...updates.metadata,
        updatedBy: this.currentUser.id,
        lastModified: new Date(),
      },
    })

    if (updatedNode) {
      this.operations.push(operation)
      this.emit('operation', operation)
    }

    return updatedNode
  }

  async deleteNode(nodeId: string): Promise<boolean> {
    if (!this.currentUser.permissions.canDelete) {
      this.emit('permission_denied', {
        operation: 'node_delete',
        userId: this.currentUser.id,
      })
      return false
    }

    const operation: GraphOperation = {
      id: this.generateOperationId(),
      type: 'node_delete',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: { nodeId },
    }

    // Apply operation locally
    const deleted = this.graph.deleteNode(nodeId)

    if (deleted) {
      this.operations.push(operation)
      this.emit('operation', operation)
    }

    return deleted
  }

  async addEdge(
    edge: Omit<Edge, 'id' | 'metadata'> & { metadata?: Partial<Edge['metadata']> }
  ): Promise<Edge | null> {
    if (!this.currentUser.permissions.canWrite) {
      this.emit('permission_denied', {
        operation: 'edge_add',
        userId: this.currentUser.id,
      })
      return null
    }

    const operation: GraphOperation = {
      id: this.generateOperationId(),
      type: 'edge_add',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: edge,
    }

    // Apply operation locally
    const addedEdge = this.graph.addEdge({
      ...edge,
      metadata: {
        ...edge.metadata,
        createdBy: this.currentUser.id,
        collaborationSession: this.sessionId,
      },
    })

    this.operations.push(operation)
    this.emit('operation', operation)

    return addedEdge
  }

  // Apply remote operations
  async applyRemoteOperation(operation: GraphOperation): Promise<void> {
    // Validate operation
    if (!this.validateOperation(operation)) {
      this.emit('invalid_operation', operation)
      return
    }

    // Check permissions
    const user = this.users.get(operation.userId)
    if (!user || !this.hasPermissionForOperation(user, operation.type)) {
      this.emit('permission_denied', {
        operation: operation.type,
        userId: operation.userId,
      })
      return
    }

    try {
      switch (operation.type) {
        case 'node_add':
          this.graph.addNode(operation.data)
          break
        case 'node_update':
          this.graph.updateNode(operation.data.nodeId, operation.data.updates)
          break
        case 'node_delete':
          this.graph.deleteNode(operation.data.nodeId)
          break
        case 'edge_add':
          this.graph.addEdge(operation.data)
          break
        case 'edge_delete':
          this.graph.deleteEdge(operation.data.edgeId)
          break
      }

      this.operations.push(operation)
      this.emit('remote_operation_applied', operation)
    } catch (error) {
      this.emit('operation_error', { operation, error })
    }
  }

  // Presence management
  updatePresence(presence: Partial<PresenceInfo>): void {
    const currentPresence = this.presence.get(this.currentUser.id) || {
      userId: this.currentUser.id,
      lastActivity: new Date(),
    }

    const updatedPresence = {
      ...currentPresence,
      ...presence,
      lastActivity: new Date(),
    }

    this.presence.set(this.currentUser.id, updatedPresence)
    this.emit('presence_updated', updatedPresence)
  }

  updateRemotePresence(presence: PresenceInfo): void {
    this.presence.set(presence.userId, presence)
    this.emit('remote_presence_updated', presence)
  }

  getPresence(): Map<string, PresenceInfo> {
    return new Map(this.presence)
  }

  // Conflict resolution
  private checkForConflicts(operationType: string, targetId: string): ConflictResolution | null {
    // Check for concurrent modifications
    const recentOperations = this.operations
      .filter(op => op.timestamp > new Date(Date.now() - 5000)) // Last 5 seconds
      .filter(op => op.userId !== this.currentUser.id)

    const conflictingOp = recentOperations.find(op => {
      if (operationType.startsWith('node_') && op.type.startsWith('node_')) {
        return op.data.nodeId === targetId || op.data.id === targetId
      }
      if (operationType.startsWith('edge_') && op.type.startsWith('edge_')) {
        return op.data.edgeId === targetId || op.data.id === targetId
      }
      return false
    })

    if (conflictingOp) {
      return {
        operationId: this.generateOperationId(),
        conflictType: 'concurrent_edit',
        resolution: 'accept', // Default resolution
        resolvedBy: this.currentUser.id,
        resolvedAt: new Date(),
      }
    }

    return null
  }

  private async handleConflict(conflict: ConflictResolution): Promise<void> {
    this.conflictQueue.push(conflict)
    this.emit('conflict_detected', conflict)

    // Auto-resolve simple conflicts
    if (conflict.conflictType === 'concurrent_edit') {
      // Last-write-wins strategy for now
      conflict.resolution = 'accept'
      this.emit('conflict_resolved', conflict)
    }
  }

  // Utility methods
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private validateOperation(operation: GraphOperation): boolean {
    return !!(
      operation.id &&
      operation.type &&
      operation.userId &&
      operation.timestamp &&
      operation.data
    )
  }

  private hasPermissionForOperation(user: CollaborationUser, operationType: string): boolean {
    switch (operationType) {
      case 'node_add':
      case 'node_update':
      case 'edge_add':
      case 'edge_update':
        return user.permissions.canWrite
      case 'node_delete':
      case 'edge_delete':
        return user.permissions.canDelete
      default:
        return user.permissions.canRead
    }
  }

  // Session management
  getSession(): CollaborationSession {
    return {
      id: this.sessionId,
      graphId: 'current', // Would be actual graph ID in real implementation
      users: Array.from(this.users.values()),
      operations: this.operations,
      createdAt: new Date(), // Would be actual creation time
      lastActivity: new Date(),
    }
  }

  getOperationHistory(limit?: number): GraphOperation[] {
    return limit ? this.operations.slice(-limit) : [...this.operations]
  }

  // Export/Import for persistence
  exportSession(): {
    session: CollaborationSession
    presence: Record<string, PresenceInfo>
    conflicts: ConflictResolution[]
  } {
    return {
      session: this.getSession(),
      presence: Object.fromEntries(this.presence),
      conflicts: this.conflictQueue,
    }
  }

  importSession(data: ReturnType<CollaborationManager['exportSession']>): void {
    // Restore users
    data.session.users.forEach(user => {
      this.users.set(user.id, user)
    })

    // Restore operations
    this.operations = data.session.operations

    // Restore presence
    Object.entries(data.presence).forEach(([userId, presence]) => {
      this.presence.set(userId, presence)
    })

    // Restore conflicts
    this.conflictQueue = data.conflicts

    this.emit('session_restored', data.session)
  }

  // Cleanup
  cleanup(): void {
    this.disconnect()
    this.removeAllListeners()
    this.users.clear()
    this.presence.clear()
    this.operations = []
    this.conflictQueue = []
  }
}

// React hook for collaboration
export function useCollaboration(graph: MemoryGraph, sessionId: string, user: CollaborationUser) {
  const [collaboration] = React.useState(() => new CollaborationManager(graph, sessionId, user))
  const [users, setUsers] = React.useState<CollaborationUser[]>([])
  const [presence, setPresence] = React.useState<Map<string, PresenceInfo>>(new Map())
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    const handleUserJoined = ({ user }: { user: CollaborationUser }) => {
      setUsers(prev => [...prev.filter(u => u.id !== user.id), user])
    }

    const handleUserLeft = ({ user }: { user: CollaborationUser }) => {
      setUsers(prev => prev.filter(u => u.id !== user.id))
    }

    const handlePresenceUpdated = (presenceInfo: PresenceInfo) => {
      setPresence(prev => new Map(prev).set(presenceInfo.userId, presenceInfo))
    }

    const handleConnected = () => setIsConnected(true)
    const handleDisconnected = () => setIsConnected(false)

    collaboration.on('user_joined', handleUserJoined)
    collaboration.on('user_left', handleUserLeft)
    collaboration.on('presence_updated', handlePresenceUpdated)
    collaboration.on('remote_presence_updated', handlePresenceUpdated)
    collaboration.on('connected', handleConnected)
    collaboration.on('disconnected', handleDisconnected)

    // Auto-connect
    collaboration.connect()

    return () => {
      collaboration.off('user_joined', handleUserJoined)
      collaboration.off('user_left', handleUserLeft)
      collaboration.off('presence_updated', handlePresenceUpdated)
      collaboration.off('remote_presence_updated', handlePresenceUpdated)
      collaboration.off('connected', handleConnected)
      collaboration.off('disconnected', handleDisconnected)
      collaboration.cleanup()
    }
  }, [collaboration])

  return {
    collaboration,
    users,
    presence,
    isConnected,
    addNode: collaboration.addNode.bind(collaboration),
    updateNode: collaboration.updateNode.bind(collaboration),
    deleteNode: collaboration.deleteNode.bind(collaboration),
    addEdge: collaboration.addEdge.bind(collaboration),
    updatePresence: collaboration.updatePresence.bind(collaboration),
  }
}
