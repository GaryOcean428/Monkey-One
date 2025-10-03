import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  WorkflowStatus,
  WorkflowEvent,
  Agent,
  DelegationRequest,
} from './types'
import { XAIMessage } from '../types'
import { AdvancedRouter } from '../router'
import { TokenEstimator } from '../tokenEstimator'

export class WorkflowOrchestrator {
  private workflows: Map<string, WorkflowDefinition>
  private executions: Map<string, WorkflowExecution>
  private agents: Map<string, Agent>
  private router: AdvancedRouter

  constructor() {
    this.workflows = new Map()
    this.executions = new Map()
    this.agents = new Map()
    this.router = new AdvancedRouter()
  }

  /**
   * Register a new workflow definition
   */
  public registerWorkflow(workflow: WorkflowDefinition): void {
    this.validateWorkflow(workflow)
    this.workflows.set(workflow.id, workflow)
  }

  /**
   * Start workflow execution
   */
  public async startWorkflow(
    workflowId: string,
    context: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`)

    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      workflowId,
      status: 'running',
      currentStep: workflow.steps[0].id,
      history: [],
      context,
      startedAt: new Date(),
    }

    this.executions.set(execution.id, execution)
    await this.executeStep(execution, workflow.steps[0])
    return execution
  }

  /**
   * Execute a workflow step
   */
  private async executeStep(execution: WorkflowExecution, step: WorkflowStep): Promise<void> {
    try {
      // Check dependencies
      if (!this.areDependenciesMet(step, execution)) {
        execution.status = 'pending'
        return
      }

      // Find suitable agent
      const agent = this.findSuitableAgent(step)
      if (!agent) {
        await this.handleNoAgentAvailable(step, execution)
        return
      }

      // Execute step
      execution.status = 'running'
      const result = await this.executeWithAgent(agent, step, execution)

      // Update history
      execution.history.push({
        timestamp: new Date(),
        step,
        status: result.status,
        metadata: result.metadata,
        agentId: agent.id,
        messages: result.messages,
      })

      // Handle completion
      if (result.status === 'completed') {
        await this.handleStepCompletion(execution, step)
      } else if (result.status === 'failed') {
        await this.handleStepFailure(execution, step, result.error)
      }
    } catch (error) {
      await this.handleStepError(execution, step, error)
    }
  }

  /**
   * Check if step dependencies are met
   */
  private areDependenciesMet(step: WorkflowStep, execution: WorkflowExecution): boolean {
    return step.dependencies.every(depId => {
      const depHistory = execution.history.find(h => h.step.id === depId)
      return depHistory?.status === 'completed'
    })
  }

  /**
   * Find suitable agent for step
   */
  private findSuitableAgent(step: WorkflowStep): Agent | undefined {
    return Array.from(this.agents.values()).find(
      agent =>
        agent.status === 'available' &&
        agent.role === step.role &&
        this.hasRequiredCapabilities(agent, step)
    )
  }

  /**
   * Check if agent has required capabilities
   */
  private hasRequiredCapabilities(agent: Agent, step: WorkflowStep): boolean {
    const requiredCapabilities = step.metadata.requiredCapabilities || []
    return requiredCapabilities.every(cap =>
      agent.capabilities.some(agentCap => agentCap.id === cap)
    )
  }

  /**
   * Execute step with selected agent
   */
  private async executeWithAgent(
    agent: Agent,
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<{
    status: WorkflowStatus
    metadata: Record<string, any>
    messages: XAIMessage[]
    error?: Error
  }> {
    agent.status = 'busy'
    agent.currentTask = step.id

    try {
      // Prepare context
      const context = {
        ...execution.context,
        step: step.metadata,
        history: execution.history,
      }

      // Route to appropriate model
      const routerConfig = this.router.route(
        step.description,
        execution.history.flatMap(h => h.messages)
      )

      // Execute step logic
      const result = await this.executeStepLogic(step, context, routerConfig)

      // Update agent status
      agent.status = 'available'
      agent.currentTask = undefined

      return result
    } catch (error) {
      agent.status = 'available'
      agent.currentTask = undefined
      throw error
    }
  }

  /**
   * Handle step completion
   */
  private async handleStepCompletion(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<void> {
    const workflow = this.workflows.get(execution.workflowId)
    if (!workflow) return

    const nextStep = this.findNextStep(workflow, step)
    if (nextStep) {
      execution.currentStep = nextStep.id
      await this.executeStep(execution, nextStep)
    } else {
      execution.status = 'completed'
      execution.completedAt = new Date()
    }
  }

  /**
   * Find next step in workflow
   */
  private findNextStep(
    workflow: WorkflowDefinition,
    currentStep: WorkflowStep
  ): WorkflowStep | undefined {
    const currentIndex = workflow.steps.findIndex(s => s.id === currentStep.id)
    return workflow.steps[currentIndex + 1]
  }

  /**
   * Handle step failure
   */
  private async handleStepFailure(
    execution: WorkflowExecution,
    step: WorkflowStep,
    error: Error
  ): Promise<void> {
    if (step.retryPolicy && this.shouldRetry(step, execution)) {
      await this.retryStep(execution, step)
    } else {
      execution.status = 'failed'
      execution.error = error
    }
  }

  /**
   * Check if step should be retried
   */
  private shouldRetry(step: WorkflowStep, execution: WorkflowExecution): boolean {
    if (!step.retryPolicy) return false

    const attempts = execution.history.filter(
      h => h.step.id === step.id && h.status === 'failed'
    ).length

    return attempts < step.retryPolicy.maxAttempts
  }

  /**
   * Retry failed step
   */
  private async retryStep(execution: WorkflowExecution, step: WorkflowStep): Promise<void> {
    const attempts = execution.history.filter(
      h => h.step.id === step.id && h.status === 'failed'
    ).length

    const delay = Math.min(
      step.retryPolicy!.initialDelay * Math.pow(step.retryPolicy!.backoffMultiplier, attempts),
      step.retryPolicy!.maxDelay
    )

    await new Promise(resolve => setTimeout(resolve, delay))
    await this.executeStep(execution, step)
  }

  /**
   * Handle no agent available
   */
  private async handleNoAgentAvailable(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<void> {
    // Try delegation
    const delegated = await this.tryDelegation(step, execution)
    if (!delegated) {
      execution.status = 'paused'
      this.emitEvent({
        id: crypto.randomUUID(),
        type: 'NO_AGENT_AVAILABLE',
        payload: { stepId: step.id, executionId: execution.id },
        timestamp: new Date(),
        source: 'orchestrator',
        metadata: {},
      })
    }
  }

  /**
   * Try to delegate step to another agent
   */
  private async tryDelegation(step: WorkflowStep, execution: WorkflowExecution): Promise<boolean> {
    const availableAgents = Array.from(this.agents.values()).filter(
      agent => agent.status === 'available'
    )

    for (const agent of availableAgents) {
      const request: DelegationRequest = {
        id: crypto.randomUUID(),
        taskId: step.id,
        fromAgentId: 'orchestrator',
        toAgentId: agent.id,
        context: execution.context,
        priority: step.metadata.priority || 1,
        status: 'pending',
      }

      const accepted = await this.requestDelegation(request)
      if (accepted) {
        step.status = 'delegated'
        return true
      }
    }

    return false
  }

  /**
   * Request delegation to agent
   */
  private async requestDelegation(request: DelegationRequest): Promise<boolean> {
    const agent = this.agents.get(request.toAgentId)
    if (!agent) return false

    // Simulate agent decision
    const willAccept = Math.random() > 0.3 // 70% chance of accepting
    if (willAccept) {
      request.status = 'accepted'
      agent.status = 'busy'
      agent.currentTask = request.taskId
    } else {
      request.status = 'rejected'
    }

    return willAccept
  }

  /**
   * Emit workflow event
   */
  private emitEvent(event: WorkflowEvent): void {
    // Implement event emission logic
    console.log('Event emitted:', event)
  }

  /**
   * Validate workflow definition
   */
  private validateWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.steps.length) {
      throw new Error('Workflow must have at least one step')
    }

    // Check for circular dependencies
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) return true
      if (visited.has(stepId)) return false

      visited.add(stepId)
      recursionStack.add(stepId)

      const step = workflow.steps.find(s => s.id === stepId)
      if (step) {
        for (const depId of step.dependencies) {
          if (hasCycle(depId)) return true
        }
      }

      recursionStack.delete(stepId)
      return false
    }

    for (const step of workflow.steps) {
      if (hasCycle(step.id)) {
        throw new Error('Circular dependency detected in workflow')
      }
    }
  }
}
