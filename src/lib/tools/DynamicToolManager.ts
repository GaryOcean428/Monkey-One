import { EventEmitter } from 'events'
import { ModelClient } from '../clients/ModelClient'
import { MemoryManager } from '../memory/MemoryManager'
import { logger } from '../../utils/logger'

export interface DynamicTool {
  id: string
  name: string
  description: string
  capabilities: string[]
  inputSchema: any
  outputSchema: any
  performance: {
    latency: number
    successRate: number
    errorRate: number
  }
  version: string
  lastUsed: Date
  usageCount: number
  metadata: Record<string, any>
}

export interface ToolExecutionResult {
  success: boolean
  output: any
  error?: string
  duration: number
  metadata: Record<string, any>
}

export class DynamicToolManager extends EventEmitter {
  private static instance: DynamicToolManager
  private tools: Map<string, DynamicTool>
  private modelClient: ModelClient
  private memoryManager: MemoryManager

  private constructor() {
    super()
    this.tools = new Map()
    this.modelClient = new ModelClient()
    this.memoryManager = MemoryManager.getInstance()
    this.initializeEventListeners()
  }

  static getInstance(): DynamicToolManager {
    if (!DynamicToolManager.instance) {
      DynamicToolManager.instance = new DynamicToolManager()
    }
    return DynamicToolManager.instance
  }

  private initializeEventListeners(): void {
    this.on('toolRegistered', this.handleToolRegistration.bind(this))
    this.on('toolExecuted', this.updateToolMetrics.bind(this))
    this.on('toolError', this.handleToolError.bind(this))
  }

  async registerTool(
    tool: Omit<DynamicTool, 'id' | 'performance' | 'lastUsed' | 'usageCount'>
  ): Promise<string> {
    const toolId = crypto.randomUUID()
    const newTool: DynamicTool = {
      ...tool,
      id: toolId,
      performance: {
        latency: 0,
        successRate: 1,
        errorRate: 0,
      },
      lastUsed: new Date(),
      usageCount: 0,
      metadata: tool.metadata || {},
    }

    // Validate tool schemas
    try {
      await this.validateToolSchemas(newTool)
      this.tools.set(toolId, newTool)
      this.emit('toolRegistered', newTool)

      await this.memoryManager.add({
        type: 'tool_registration',
        content: JSON.stringify(newTool),
        tags: ['tool', 'registration'],
      })

      return toolId
    } catch (error) {
      logger.error('Error registering tool:', error)
      throw error
    }
  }

  private async validateToolSchemas(tool: DynamicTool): Promise<void> {
    const validationPrompt = `
      Validate the following tool schemas:
      Input Schema: ${JSON.stringify(tool.inputSchema)}
      Output Schema: ${JSON.stringify(tool.outputSchema)}
    `

    try {
      const analysis = await this.modelClient.complete(validationPrompt, 'o1')
      const validation = JSON.parse(analysis)

      if (!validation.isValid) {
        throw new Error(`Invalid tool schemas: ${validation.errors.join(', ')}`)
      }
    } catch (error) {
      throw new Error(`Schema validation failed: ${error.message}`)
    }
  }

  async executeTool(toolId: string, input: any): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolId)
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`)
    }

    const startTime = Date.now()
    try {
      // Validate input against schema
      const inputValidation = await this.validateInput(tool, input)
      if (!inputValidation.isValid) {
        throw new Error(`Invalid input: ${inputValidation.errors.join(', ')}`)
      }

      // Execute tool logic
      const result = await this.executeToolLogic(tool, input)

      // Validate output against schema
      const outputValidation = await this.validateOutput(tool, result)
      if (!outputValidation.isValid) {
        throw new Error(`Invalid output: ${outputValidation.errors.join(', ')}`)
      }

      const duration = Date.now() - startTime
      const executionResult: ToolExecutionResult = {
        success: true,
        output: result,
        duration,
        metadata: {
          toolId,
          timestamp: new Date(),
          inputSize: JSON.stringify(input).length,
          outputSize: JSON.stringify(result).length,
        },
      }

      this.emit('toolExecuted', { tool, result: executionResult })
      return executionResult
    } catch (error) {
      const duration = Date.now() - startTime
      const executionResult: ToolExecutionResult = {
        success: false,
        output: null,
        error: error.message,
        duration,
        metadata: {
          toolId,
          timestamp: new Date(),
          errorType: error.name,
        },
      }

      this.emit('toolError', { tool, error, result: executionResult })
      return executionResult
    }
  }

  private async validateInput(
    tool: DynamicTool,
    input: any
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const validationPrompt = `
      Validate the following input against the schema:
      Schema: ${JSON.stringify(tool.inputSchema)}
      Input: ${JSON.stringify(input)}
    `

    const analysis = await this.modelClient.complete(validationPrompt, 'o1')
    return JSON.parse(analysis)
  }

  private async validateOutput(
    tool: DynamicTool,
    output: any
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const validationPrompt = `
      Validate the following output against the schema:
      Schema: ${JSON.stringify(tool.outputSchema)}
      Output: ${JSON.stringify(output)}
    `

    const analysis = await this.modelClient.complete(validationPrompt, 'o1')
    return JSON.parse(analysis)
  }

  private async executeToolLogic(tool: DynamicTool, input: any): Promise<any> {
    // This is a placeholder for actual tool execution logic
    // In a real implementation, this would delegate to the appropriate execution engine
    const executionPrompt = `
      Execute tool with the following configuration:
      Tool: ${tool.name}
      Input: ${JSON.stringify(input)}
      Capabilities: ${tool.capabilities.join(', ')}
    `

    const result = await this.modelClient.complete(executionPrompt, 'o1')
    return JSON.parse(result)
  }

  private async handleToolRegistration(tool: DynamicTool): Promise<void> {
    // Update tool registry in memory
    await this.memoryManager.add({
      type: 'tool_registry_update',
      content: JSON.stringify({
        action: 'register',
        tool: {
          id: tool.id,
          name: tool.name,
          capabilities: tool.capabilities,
        },
      }),
      tags: ['tool', 'registry'],
    })
  }

  private async updateToolMetrics(data: {
    tool: DynamicTool
    result: ToolExecutionResult
  }): Promise<void> {
    const { tool, result } = data
    const updatedTool = { ...tool }

    // Update performance metrics
    const totalExecutions = tool.usageCount + 1
    updatedTool.performance.latency =
      (tool.performance.latency * tool.usageCount + result.duration) / totalExecutions
    updatedTool.performance.successRate =
      (tool.performance.successRate * tool.usageCount + (result.success ? 1 : 0)) / totalExecutions
    updatedTool.performance.errorRate =
      (tool.performance.errorRate * tool.usageCount + (result.success ? 0 : 1)) / totalExecutions

    updatedTool.lastUsed = new Date()
    updatedTool.usageCount = totalExecutions

    this.tools.set(tool.id, updatedTool)
  }

  private async handleToolError(data: {
    tool: DynamicTool
    error: Error
    result: ToolExecutionResult
  }): Promise<void> {
    const { tool, error, result } = data

    await this.memoryManager.add({
      type: 'tool_error',
      content: JSON.stringify({
        toolId: tool.id,
        error: error.message,
        context: result.metadata,
      }),
      tags: ['tool', 'error'],
    })

    // Update error metrics
    this.updateToolMetrics({ tool, result })
  }

  async getToolById(toolId: string): Promise<DynamicTool | undefined> {
    return this.tools.get(toolId)
  }

  async findToolsByCapability(capability: string): Promise<DynamicTool[]> {
    return Array.from(this.tools.values()).filter(tool => tool.capabilities.includes(capability))
  }

  async getToolMetrics(toolId: string): Promise<DynamicTool['performance'] | undefined> {
    const tool = await this.getToolById(toolId)
    return tool?.performance
  }
}
