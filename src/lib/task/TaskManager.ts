import { EventEmitter } from 'events'
import { ModelClient } from '../clients/ModelClient'
import { memoryManager } from '../memory'
import { logger } from '../utils/logger'
import { VectorStore } from '../../memory/vector/VectorStore'

type TaskType =
  | 'one-off' // Single execution tasks
  | 'continuous' // Continuously running tasks
  | 'scheduled' // Tasks that run on a schedule
  | 'event-driven' // Tasks triggered by events

type TaskStatus = 'created' | 'running' | 'paused' | 'completed' | 'failed' | 'waiting'

interface TaskTrigger {
  type: 'schedule' | 'event' | 'condition'
  config: {
    schedule?: string // Cron expression
    eventType?: string // Event to listen for
    condition?: string // Condition to evaluate
    cooldown?: number // Minimum time between executions
  }
}

interface TaskDefinition {
  id: string
  name: string
  description: string
  type: TaskType
  status: TaskStatus
  trigger?: TaskTrigger
  code: string // Dynamic code/logic for the task
  tools: string[] // Required tools
  lastRun?: Date
  nextRun?: Date
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

interface DynamicTool {
  id: string
  name: string
  description: string
  code: string
  inputSchema: Record<string, any>
  outputSchema: Record<string, any>
  metadata: {
    creator: string
    version: string
    tags: string[]
    usageCount: number
  }
}

export class TaskManager extends EventEmitter {
  private static instance: TaskManager
  private tasks: Map<string, TaskDefinition>
  private runningTasks: Set<string>
  private tools: Map<string, DynamicTool>
  private modelClient: ModelClient
  private vectorStore: VectorStore

  private constructor() {
    super()
    this.tasks = new Map()
    this.runningTasks = new Set()
    this.tools = new Map()
    this.modelClient = new ModelClient()
    this.vectorStore = new VectorStore()
    this.initializeEventListeners()
  }

  static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager()
    }
    return TaskManager.instance
  }

  private initializeEventListeners() {
    // Listen for system events
    this.on('taskCreated', this.handleTaskCreated.bind(this))
    this.on('taskCompleted', this.handleTaskCompleted.bind(this))
    this.on('toolCreated', this.handleToolCreated.bind(this))
  }

  async createTask(
    definition: Omit<TaskDefinition, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const id = crypto.randomUUID()
    const task: TaskDefinition = {
      ...definition,
      id,
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.tasks.set(id, task)
    this.emit('taskCreated', task)

    // Store in vector store for semantic search
    await this.vectorStore.add({
      id,
      type: 'task',
      content: JSON.stringify(task),
      metadata: {
        type: task.type,
        name: task.name,
        tools: task.tools,
      },
    })

    return id
  }

  async createDynamicTool(
    name: string,
    description: string,
    code: string,
    inputSchema: Record<string, any>,
    outputSchema: Record<string, any>
  ): Promise<string> {
    // Use model to validate and optimize the tool code
    const validatedCode = await this.modelClient.complete(
      `Validate and optimize this tool code:\n${code}`,
      'o1'
    )

    const id = crypto.randomUUID()
    const tool: DynamicTool = {
      id,
      name,
      description,
      code: validatedCode,
      inputSchema,
      outputSchema,
      metadata: {
        creator: 'system',
        version: '1.0.0',
        tags: [],
        usageCount: 0,
      },
    }

    this.tools.set(id, tool)
    this.emit('toolCreated', tool)

    // Store tool in memory for future reference
    await memoryManager.add({
      type: 'tool_creation',
      content: JSON.stringify(tool),
      tags: ['tool', ...tool.metadata.tags],
    })

    return id
  }

  async startTask(taskId: string, inputs?: Record<string, any>): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task ${taskId} not found`)
    }

    if (task.type === 'continuous') {
      await this.startContinuousTask(task, inputs)
    } else {
      await this.executeTask(task, inputs)
    }
  }

  private async startContinuousTask(
    task: TaskDefinition,
    inputs?: Record<string, any>
  ): Promise<void> {
    if (this.runningTasks.has(task.id)) {
      throw new Error(`Task ${task.id} is already running`)
    }

    this.runningTasks.add(task.id)
    task.status = 'running'

    // Start monitoring based on trigger type
    if (task.trigger?.type === 'schedule') {
      this.scheduleTask(task)
    } else if (task.trigger?.type === 'event') {
      this.setupEventListener(task)
    } else if (task.trigger?.type === 'condition') {
      this.setupConditionMonitor(task)
    }
  }

  private async executeTask(task: TaskDefinition, inputs?: Record<string, any>): Promise<void> {
    try {
      // Load required tools
      const toolInstances = await Promise.all(task.tools.map(toolId => this.loadTool(toolId)))

      // Create execution context
      const context = {
        tools: toolInstances,
        inputs,
        memory: memoryManager,
        modelClient: this.modelClient,
      }

      // Execute task code
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      const executor = new AsyncFunction('context', task.code)
      await executor(context)

      task.status = 'completed'
      task.lastRun = new Date()
      this.emit('taskCompleted', task)
    } catch (error) {
      task.status = 'failed'
      logger.error(`Task ${task.id} failed:`, error)
      throw error
    }
  }

  private async loadTool(toolId: string): Promise<any> {
    const tool = this.tools.get(toolId)
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`)
    }

    tool.metadata.usageCount++
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    return new AsyncFunction('inputs', tool.code)
  }

  private scheduleTask(task: TaskDefinition): void {
    if (!task.trigger?.config.schedule) return

    const schedule = require('node-schedule')
    schedule.scheduleJob(task.trigger.config.schedule, () => {
      this.executeTask(task).catch(logger.error)
    })
  }

  private setupEventListener(task: TaskDefinition): void {
    if (!task.trigger?.config.eventType) return

    this.on(task.trigger.config.eventType, async eventData => {
      if (this.canExecute(task)) {
        await this.executeTask(task, { eventData }).catch(logger.error)
      }
    })
  }

  private setupConditionMonitor(task: TaskDefinition): void {
    if (!task.trigger?.config.condition) return

    const interval = setInterval(async () => {
      if (!this.runningTasks.has(task.id)) {
        clearInterval(interval)
        return
      }

      try {
        const condition = new Function('return ' + task.trigger!.config.condition!)
        if (condition() && this.canExecute(task)) {
          await this.executeTask(task).catch(logger.error)
        }
      } catch (error) {
        logger.error(`Error evaluating condition for task ${task.id}:`, error)
      }
    }, 1000)
  }

  private canExecute(task: TaskDefinition): boolean {
    if (!task.trigger?.config.cooldown || !task.lastRun) return true
    const cooldownMs = task.trigger.config.cooldown * 1000
    return Date.now() - task.lastRun.getTime() >= cooldownMs
  }

  async stopTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Task ${taskId} not found`)
    }

    this.runningTasks.delete(taskId)
    task.status = 'paused'
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.stopTask(taskId)
    this.tasks.delete(taskId)
  }

  async findSimilarTasks(description: string): Promise<TaskDefinition[]> {
    const results = await this.vectorStore.search(description, 5)
    return results
      .filter(result => result.type === 'task')
      .map(result => JSON.parse(result.content))
  }

  private handleTaskCreated(task: TaskDefinition): void {
    logger.info(`Task created: ${task.name} (${task.id})`)
  }

  private handleTaskCompleted(task: TaskDefinition): void {
    logger.info(`Task completed: ${task.name} (${task.id})`)
  }

  private handleToolCreated(tool: DynamicTool): void {
    logger.info(`Tool created: ${tool.name} (${tool.id})`)
  }
}
