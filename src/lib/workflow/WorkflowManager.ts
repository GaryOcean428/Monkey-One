import { BaseAgent } from '../agents/base'
import { memoryManager } from '../memory'
import { TaskManager } from '../task/TaskManager'
import { ModelClient } from '../clients/ModelClient'
import { logger } from '../utils/logger'
import type { WorkflowDefinition, AgentTask } from '../../types'

interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'completion'
  config: {
    schedule?: string
    eventType?: string
    dependsOn?: string[]
  }
}

interface WorkflowStep {
  id: string
  taskId: string
  agentId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  inputs?: Record<string, any>
  outputs?: Record<string, any>
  error?: string
  startedAt?: number
  completedAt?: number
}

interface EnhancedWorkflowDefinition extends WorkflowDefinition {
  name?: string
  description?: string
  trigger?: WorkflowTrigger
  variables?: Record<string, any>
  steps: WorkflowStep[]
  errorHandling?: {
    retry: boolean
    maxRetries: number
    onError: 'continue' | 'stop' | 'rollback'
  }
}

export class WorkflowManager {
  private workflows: Map<string, EnhancedWorkflowDefinition> = new Map()
  private taskManager: TaskManager
  private modelClient: ModelClient
  private activeWorkflows: Set<string> = new Set()

  constructor() {
    this.taskManager = TaskManager.getInstance()
    this.modelClient = new ModelClient()
    this.initializeEventListeners()
  }

  private initializeEventListeners() {
    // Listen for workflow completion events
    this.taskManager.on('taskCompleted', this.handleTaskCompletion.bind(this))
  }

  async createWorkflow(
    task: AgentTask,
    team: BaseAgent[],
    options?: {
      name?: string
      description?: string
      trigger?: WorkflowTrigger
      variables?: Record<string, any>
    }
  ): Promise<EnhancedWorkflowDefinition> {
    const workflow: EnhancedWorkflowDefinition = {
      id: crypto.randomUUID(),
      taskId: task.id,
      status: 'initializing',
      team: team.map(agent => ({
        id: agent.id,
        role: agent.role,
        status: 'standby',
      })),
      steps: [],
      created: Date.now(),
      updated: Date.now(),
      metadata: {
        originalTask: task,
        iterationCount: 0,
        successMetrics: {
          accuracy: 0,
          efficiency: 0,
          reliability: 0,
        },
      },
      ...options,
    }

    // Use model to generate optimal workflow steps
    const steps = await this.generateWorkflowSteps(task, team)
    workflow.steps = steps

    // Store workflow
    this.workflows.set(workflow.id, workflow)

    // Record in memory
    await memoryManager.add({
      type: 'workflow_creation',
      content: JSON.stringify(workflow),
      tags: ['workflow', task.type],
    })

    return workflow
  }

  private async generateWorkflowSteps(task: AgentTask, team: BaseAgent[]): Promise<WorkflowStep[]> {
    // Use model to analyze task and generate optimal steps
    const analysis = await this.modelClient.complete(
      `Analyze this task and generate optimal workflow steps:\n${JSON.stringify(task)}`,
      'o1'
    )

    // Parse and validate steps
    const steps: WorkflowStep[] = JSON.parse(analysis).map((step: any) => ({
      id: crypto.randomUUID(),
      taskId: step.taskId,
      agentId: this.assignAgentToStep(step, team),
      status: 'pending',
      inputs: step.inputs,
    }))

    return steps
  }

  private assignAgentToStep(step: any, team: BaseAgent[]): string {
    // Implement agent assignment logic based on capabilities
    return team[0].id // Placeholder
  }

  async saveWorkflow(
    id: string,
    name: string,
    description: string,
    isTemplate: boolean = false
  ): Promise<void> {
    const workflow = this.workflows.get(id)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    workflow.name = name
    workflow.description = description

    // Save workflow definition
    await memoryManager.add({
      type: isTemplate ? 'workflow_template' : 'saved_workflow',
      content: JSON.stringify(workflow),
      tags: ['workflow', isTemplate ? 'template' : 'saved', workflow.metadata.originalTask.type],
    })
  }

  async executeWorkflow(
    id: string,
    inputs?: Record<string, unknown>,
    options?: {
      dryRun?: boolean
      stepDelay?: number
    }
  ): Promise<void> {
    const workflow = this.workflows.get(id)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    if (this.activeWorkflows.has(id)) {
      throw new Error('Workflow is already running')
    }

    this.activeWorkflows.add(id)
    workflow.status = 'running'

    try {
      // Execute workflow steps
      for (const step of workflow.steps) {
        if (options?.dryRun) {
          logger.info(`[DryRun] Would execute step: ${step.id}`)
          continue
        }

        try {
          // Start step execution
          step.status = 'running'
          step.startedAt = Date.now()

          // Execute step using TaskManager
          await this.taskManager.startTask(step.taskId, {
            ...inputs,
            ...step.inputs,
            workflowId: workflow.id,
            stepId: step.id,
          })

          // Add delay if specified
          if (options?.stepDelay) {
            await new Promise(resolve => setTimeout(resolve, options.stepDelay))
          }
        } catch (error) {
          step.status = 'failed'
          step.error = error instanceof Error ? error.message : 'Unknown error'

          if (workflow.errorHandling?.onError === 'stop') {
            throw error
          } else if (workflow.errorHandling?.onError === 'rollback') {
            await this.rollbackWorkflow(workflow)
            throw error
          }
          // Continue to next step if onError is 'continue'
        }
      }

      workflow.status = 'completed'
    } finally {
      this.activeWorkflows.delete(id)
    }
  }

  private async rollbackWorkflow(workflow: EnhancedWorkflowDefinition): Promise<void> {
    // Implement rollback logic for completed steps
    for (const step of workflow.steps) {
      if (step.status === 'completed') {
        // Rollback logic here
      }
    }
  }

  private async handleTaskCompletion(taskId: string, outputs: any): Promise<void> {
    // Update workflow step status when task completes
    for (const workflow of this.workflows.values()) {
      const step = workflow.steps.find(s => s.taskId === taskId)
      if (step) {
        step.status = 'completed'
        step.completedAt = Date.now()
        step.outputs = outputs

        // Check if workflow is complete
        if (workflow.steps.every(s => s.status === 'completed')) {
          workflow.status = 'completed'
          this.activeWorkflows.delete(workflow.id)
        }
      }
    }
  }

  async getWorkflowStatus(id: string): Promise<{
    status: string
    progress: number
    currentStep?: WorkflowStep
  }> {
    const workflow = this.workflows.get(id)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length
    const progress = (completedSteps / workflow.steps.length) * 100
    const currentStep = workflow.steps.find(s => s.status === 'running')

    return {
      status: workflow.status,
      progress,
      currentStep,
    }
  }

  async findSimilarWorkflows(description: string): Promise<EnhancedWorkflowDefinition[]> {
    const results = await memoryManager.search('workflow', description)
    return results.map(result => JSON.parse(result.content))
  }
}
