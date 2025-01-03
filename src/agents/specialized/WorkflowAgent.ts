import { BaseAgent } from '../../lib/agents/base/BaseAgent'
import { AgentType } from '../../lib/types/agent'
import type {
  Message,
  AgentConfig,
  AgentCapabilityType,
  MessageResponse,
} from '../../lib/types/agent'
import type { Tool } from '../../tools/registry/Tool'

interface WorkflowConfig {
  id: string
  agents: BaseAgent[]
}

interface WorkflowStep {
  id: string
  agentId: string
  action: string
  parameters: Record<string, unknown>
  dependencies?: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: unknown
}

interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: number
  updatedAt: number
  metadata: Record<string, unknown>
}

export class WorkflowAgent extends BaseAgent {
  private agents: Map<string, BaseAgent>
  private workflows: Map<string, Workflow>

  constructor(config: WorkflowConfig) {
    const agentConfig: AgentConfig = {
      id: config.id,
      name: 'WorkflowAgent',
      type: AgentType.ORCHESTRATOR,
      capabilities: [],
    }
    super(agentConfig)

    this.agents = new Map()
    this.workflows = new Map()

    config.agents.forEach(agent => {
      this.agents.set(agent.getId(), agent)
    })

    this.setupCapabilities()
  }

  private setupCapabilities(): void {
    const capabilities: AgentCapabilityType[] = [
      {
        name: 'workflow_create',
        description: 'Creates a new workflow',
        version: '1.0.0',
        parameters: {
          name: {
            type: 'string',
            description: 'Workflow name',
            required: true,
          },
          description: {
            type: 'string',
            description: 'Workflow description',
            required: true,
          },
          steps: {
            type: 'array',
            description: 'Workflow steps',
            required: true,
          },
        },
      },
      {
        name: 'workflow_execute',
        description: 'Executes a workflow',
        version: '1.0.0',
        parameters: {
          workflowId: {
            type: 'string',
            description: 'Workflow ID',
            required: true,
          },
          parameters: {
            type: 'object',
            description: 'Workflow parameters',
            required: false,
          },
        },
      },
      {
        name: 'workflow_status',
        description: 'Gets workflow status',
        version: '1.0.0',
        parameters: {
          workflowId: {
            type: 'string',
            description: 'Workflow ID',
            required: true,
          },
        },
      },
    ]

    capabilities.forEach(cap => this.addCapability(cap))
  }

  public async handleMessage(message: Message): Promise<{ success: boolean }> {
    try {
      const intent = await this.classifyIntent(message.content)

      switch (intent) {
        case 'create_workflow':
          await this.createWorkflow(message)
          break
        case 'execute_workflow':
          await this.executeWorkflow(message)
          break
        case 'check_status':
          await this.checkWorkflowStatus(message)
          break
        default:
          throw new Error(`Unsupported intent: ${intent}`)
      }

      return { success: true }
    } catch (error) {
      console.error('[WorkflowAgent Error]', error)
      throw error
    }
  }

  public async handleRequest(request: unknown): Promise<unknown> {
    if (typeof request === 'string') {
      return this.handleMessage({
        id: Date.now().toString(),
        type: 'text',
        content: request,
        timestamp: Date.now(),
      })
    }
    throw new Error('Invalid request format')
  }

  public async handleToolUse(tool: unknown): Promise<MessageResponse> {
    try {
      const typedTool = tool as Tool
      const metadata = typedTool.getMetadata()

      if (
        metadata.capabilities.some(cap =>
          ['workflow_create', 'workflow_execute', 'workflow_status'].includes(cap)
        )
      ) {
        const result = await typedTool.execute({})
        return { status: 'success', data: result }
      }

      throw new Error('Unsupported tool for workflow operations')
    } catch (error) {
      return {
        status: 'error',
        data: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  private async classifyIntent(content: string): Promise<string> {
    if (content.includes('create') || content.includes('new')) return 'create_workflow'
    if (content.includes('execute') || content.includes('run')) {
    if (content.includes('status') || content.includes('check')) return 'check_status'
    return 'unknown'
  }

  private async createWorkflow(_message: Message): Promise<Workflow> {
    // TODO: Implement workflow creation
    // 1. Extract workflow details from message
    // 2. Validate steps and dependencies
    // 3. Create workflow object
    return {
      id: `wf_${Date.now()}`,
      name: 'placeholder',
      description: '',
      steps: [],
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {},
    }
  }

  private async executeWorkflow(_message: Message): Promise<void> {
    // TODO: Implement workflow execution
    // 1. Extract workflow ID from message
    // 2. Get workflow from storage
    // 3. Execute steps in order, respecting dependencies
  }

  private async checkWorkflowStatus(_message: Message): Promise<Workflow> {
    // TODO: Implement status check
    // 1. Extract workflow ID from message
    // 2. Get workflow from storage
    // 3. Return current status
    return {
      id: 'wf_1',
      name: 'placeholder',
      description: '',
      steps: [],
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {},
    }
  }

  private async executeStep(step: WorkflowStep): Promise<void> {
    const agent = this.agents.get(step.agentId)
    if (!agent) {
      throw new Error(`Agent ${step.agentId} not found`)
    }

    step.status = 'running'
    try {
      const result = await agent.handleMessage({
        id: `step_${step.id}`,
        type: 'workflow_step',
        content: step.action,
        timestamp: Date.now(),
        metadata: step.parameters,
      })
      step.status = 'completed'
      step.result = result
    } catch (error) {
      step.status = 'failed'
      throw error
    }
  }

  private validateWorkflow(workflow: Workflow): void {
    // Check for circular dependencies
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
      if (visited.has(stepId)) return false

      visited.add(stepId)
      recursionStack.add(stepId)

      const step = workflow.steps.find(s => s.id === stepId)
      if (step?.dependencies) {
        for (const depId of step.dependencies) {
          if (hasCycle(depId)) return true
        }
      }

      recursionStack.delete(stepId)
      return false
    }

    for (const step of workflow.steps) {
      if (hasCycle(step.id)) {
        throw new Error(`Circular dependency detected in workflow ${workflow.id}`)
      }
    }
  }
}
