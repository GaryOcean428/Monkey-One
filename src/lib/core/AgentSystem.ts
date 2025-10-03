import { EventEmitter } from 'events'
import { ModelClient } from '../clients/ModelClient'
import { MemoryManager } from '../memory/MemoryManager'
import { TaskManager } from '../task/TaskManager'
import { logger } from '../../utils/logger'

export interface AgentCapability {
  id: string
  name: string
  description: string
  skills: string[]
  performance: {
    accuracy: number
    speed: number
    reliability: number
  }
  compatibleModels: string[]
  metadata: Record<string, any>
}

export interface AgentRole {
  id: string
  name: string
  description: string
  requiredCapabilities: string[]
  responsibilities: string[]
  authority: {
    canDelegate: boolean
    canOverride: boolean
    accessLevel: number
  }
}

export interface AgentState {
  id: string
  role: AgentRole
  capabilities: AgentCapability[]
  status: 'available' | 'busy' | 'offline'
  currentTask?: string
  context: {
    goals: string[]
    constraints: string[]
    preferences: Record<string, any>
  }
  performance: {
    taskHistory: {
      taskId: string
      success: boolean
      duration: number
      quality: number
    }[]
    overallScore: number
  }
}

export interface AgentHandoff {
  id: string
  sourceAgent: string
  targetAgent: string
  context: {
    task: any
    memory: any
    state: AgentState
  }
  handoffType: 'delegation' | 'collaboration' | 'escalation'
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  timestamp: Date
}

export class AgentSystem extends EventEmitter {
  private static instance: AgentSystem
  private agents: Map<string, AgentState>
  private handoffs: Map<string, AgentHandoff>
  private modelClient: ModelClient
  private memoryManager: MemoryManager
  private taskManager: TaskManager

  private constructor() {
    super()
    this.agents = new Map()
    this.handoffs = new Map()
    this.modelClient = new ModelClient()
    this.memoryManager = MemoryManager.getInstance()
    this.taskManager = TaskManager.getInstance()
    this.initializeEventListeners()
  }

  static getInstance(): AgentSystem {
    if (!AgentSystem.instance) {
      AgentSystem.instance = new AgentSystem()
    }
    return AgentSystem.instance
  }

  private initializeEventListeners(): void {
    this.on('handoffInitiated', this.handleHandoff.bind(this))
    this.on('capabilityUpdated', this.updateAgentCapabilities.bind(this))
    this.on('roleAssigned', this.handleRoleAssignment.bind(this))
  }

  async registerAgent(role: AgentRole, initialCapabilities: AgentCapability[]): Promise<string> {
    const agentId = crypto.randomUUID()
    const agent: AgentState = {
      id: agentId,
      role,
      capabilities: initialCapabilities,
      status: 'available',
      context: {
        goals: [],
        constraints: [],
        preferences: {},
      },
      performance: {
        taskHistory: [],
        overallScore: 0,
      },
    }

    this.agents.set(agentId, agent)
    await this.memoryManager.add({
      type: 'agent_registration',
      content: JSON.stringify(agent),
      tags: ['agent', role.name],
    })

    return agentId
  }

  async initiateHandoff(
    sourceAgentId: string,
    targetAgentId: string,
    context: any,
    type: AgentHandoff['handoffType']
  ): Promise<string> {
    const sourceAgent = this.agents.get(sourceAgentId)
    const targetAgent = this.agents.get(targetAgentId)

    if (!sourceAgent || !targetAgent) {
      throw new Error('Source or target agent not found')
    }

    const handoff: AgentHandoff = {
      id: crypto.randomUUID(),
      sourceAgent: sourceAgentId,
      targetAgent: targetAgentId,
      context,
      handoffType: type,
      status: 'pending',
      timestamp: new Date(),
    }

    this.handoffs.set(handoff.id, handoff)
    this.emit('handoffInitiated', handoff)

    return handoff.id
  }

  private async handleHandoff(handoff: AgentHandoff): Promise<void> {
    const targetAgent = this.agents.get(handoff.targetAgent)
    if (!targetAgent) return

    try {
      // Analyze handoff context
      const analysis = await this.modelClient.complete(
        `Analyze handoff context and determine if target agent can handle it:\n${JSON.stringify(handoff.context)}`,
        'o1'
      )

      const canHandle = JSON.parse(analysis).canHandle
      if (canHandle) {
        handoff.status = 'accepted'
        targetAgent.status = 'busy'
        targetAgent.currentTask = handoff.context.task.id

        // Create task for target agent
        await this.taskManager.createTask({
          name: `Handoff: ${handoff.context.task.name}`,
          description: handoff.context.task.description,
          type: 'one-off',
          code: handoff.context.task.code,
          tools: [],
          metadata: {
            handoffId: handoff.id,
            sourceAgent: handoff.sourceAgent,
          },
        })
      } else {
        handoff.status = 'rejected'
        logger.warn(`Handoff ${handoff.id} rejected: ${JSON.parse(analysis).reason}`)
      }
    } catch (error) {
      handoff.status = 'rejected'
      logger.error(`Error handling handoff ${handoff.id}:`, error)
    }

    this.handoffs.set(handoff.id, handoff)
  }

  private async updateAgentCapabilities(
    agentId: string,
    capabilities: AgentCapability[]
  ): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent) return

    agent.capabilities = capabilities
    await this.memoryManager.add({
      type: 'capability_update',
      content: JSON.stringify({ agentId, capabilities }),
      tags: ['agent', 'capability'],
    })
  }

  private async handleRoleAssignment(agentId: string, role: AgentRole): Promise<void> {
    const agent = this.agents.get(agentId)
    if (!agent) return

    agent.role = role
    await this.memoryManager.add({
      type: 'role_assignment',
      content: JSON.stringify({ agentId, role }),
      tags: ['agent', 'role'],
    })
  }

  async getAgentStatus(agentId: string): Promise<AgentState | undefined> {
    return this.agents.get(agentId)
  }

  async getHandoffStatus(handoffId: string): Promise<AgentHandoff | undefined> {
    return this.handoffs.get(handoffId)
  }

  async findCapableAgent(requiredCapabilities: string[]): Promise<string | undefined> {
    for (const [agentId, agent] of this.agents.entries()) {
      if (
        agent.status === 'available' &&
        requiredCapabilities.every(cap =>
          agent.capabilities.some(agentCap => agentCap.name === cap)
        )
      ) {
        return agentId
      }
    }
    return undefined
  }
}
