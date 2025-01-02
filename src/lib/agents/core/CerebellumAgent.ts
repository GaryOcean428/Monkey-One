/// <reference types="node" />
import { BaseAgent } from '../base/BaseAgent'
import { AgentMessage, AgentStatus, AgentType, AgentCapability } from '../../../lib/types/agent'
import { randomUUID } from 'crypto'
import { EventEmitter } from 'events'

interface MotorPattern {
  id: string
  name: string
  sequence: string[]
  efficiency: number
  lastUsed: number
  usageCount: number
}

interface LearningMetric {
  patternId: string
  successRate: number
  executionTime: number
  adaptationScore: number
}

export class CerebellumAgent extends BaseAgent {
  private motorPatterns: Map<string, MotorPattern>
  private learningMetrics: Map<string, LearningMetric>
  private readonly REFINEMENT_THRESHOLD = 0.8
  private readonly PATTERN_EVAL_INTERVAL = 5000
  private readonly MAX_PATTERNS = 100
  private optimizationInterval: ReturnType<typeof setInterval> | null = null
  private eventEmitter: EventEmitter
  private messageQueue: AgentMessage[]
  private capabilities: Set<AgentCapability>

  constructor() {
    super(undefined, 'Cerebellum Agent', AgentType.SPECIALIST)
    this.motorPatterns = new Map()
    this.learningMetrics = new Map()
    this.eventEmitter = new EventEmitter()
    this.messageQueue = []
    this.capabilities = new Set()
    this.status = AgentStatus.IDLE
  }

  async initialize(): Promise<void> {
    await super.initialize()
    await this.loadMotorPatterns()
    this.startPerformanceOptimization()
    this.eventEmitter.setMaxListeners(100)
  }

  private startPerformanceOptimization(): void {
    this.optimizationInterval = setInterval(() => {
      void this.optimizePerformance()
    }, this.PATTERN_EVAL_INTERVAL)
  }

  private async optimizePerformance(): Promise<void> {
    for (const [patternId, metrics] of this.learningMetrics) {
      if (metrics.successRate < this.REFINEMENT_THRESHOLD) {
        await this.analyzeMotorComponents(patternId)
      }
    }
  }

  private async analyzeMotorComponents(patternId: string): Promise<void> {
    const pattern = this.getMotorPattern(patternId)
    if (!pattern) return

    await this.executeMotorPattern(pattern)
  }

  private async executeMotorPattern(pattern: MotorPattern): Promise<void> {
    try {
      // Execute motor pattern sequence
      pattern.usageCount++
      pattern.lastUsed = Date.now()
      this.updateLearningMetrics(pattern.id, true)
    } catch (error) {
      this.updateLearningMetrics(pattern.id, false)
      throw error
    }
  }

  async handleMessage(message: AgentMessage): Promise<void> {
    if (this.status !== AgentStatus.AVAILABLE) {
      throw new Error('Agent is not available to handle messages')
    }

    try {
      this.status = AgentStatus.BUSY
      await this.processMessage(message)
      this.status = AgentStatus.AVAILABLE
    } catch (error) {
      this.status = AgentStatus.ERROR
      throw error
    }
  }

  addCapability(capability: AgentCapability): void {
    this.capabilities.add(capability)
  }

  removeCapability(capability: AgentCapability): void {
    this.capabilities.delete(capability)
  }

  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.has(capability)
  }

  getCapabilities(): Set<AgentCapability> {
    return new Set(this.capabilities)
  }

  async start(): Promise<void> {
    if (this.status !== AgentStatus.IDLE) {
      throw new Error('Agent is already running')
    }

    try {
      this.status = AgentStatus.STARTING
      await this.initialize()
      this.status = AgentStatus.AVAILABLE
    } catch (error) {
      this.status = AgentStatus.ERROR
      throw error
    }
  }

  protected async processMessage(message: AgentMessage): Promise<void> {
    const patternId = randomUUID()
    const pattern: MotorPattern = {
      id: patternId,
      name: `pattern-${patternId}`,
      sequence: [message.content],
      efficiency: 1.0,
      lastUsed: Date.now(),
      usageCount: 1,
    }

    // Check pattern limit before adding
    if (this.motorPatterns.size >= this.MAX_PATTERNS) {
      // Remove oldest pattern
      const oldest = Array.from(this.motorPatterns.entries()).sort(
        (a, b) => a[1].lastUsed - b[1].lastUsed
      )[0]
      if (oldest) {
        this.motorPatterns.delete(oldest[0])
        this.learningMetrics.delete(oldest[0])
      }
    }

    this.motorPatterns.set(patternId, pattern)
    await this.executeMotorPattern(pattern)
    const response = await super.processMessage(message)

    return {
      ...response,
      content: `Cerebellum processed: ${message.content}`,
    }
  }

  private async loadMotorPatterns(): Promise<void> {
    // Load patterns from storage or initialize defaults
    if (this.motorPatterns.size >= this.MAX_PATTERNS) {
      // Remove oldest patterns if we exceed the limit
      const patterns = Array.from(this.motorPatterns.entries()).sort(
        (a, b) => a[1].lastUsed - b[1].lastUsed
      )

      while (patterns.length >= this.MAX_PATTERNS) {
        const [oldestId] = patterns.shift()!
        this.motorPatterns.delete(oldestId)
        this.learningMetrics.delete(oldestId)
      }
    }

    const defaultPattern: MotorPattern = {
      id: randomUUID(),
      name: 'default-pattern',
      sequence: [],
      efficiency: 1.0,
      lastUsed: Date.now(),
      usageCount: 0,
    }
    this.motorPatterns.set(defaultPattern.id, defaultPattern)
  }

  private updateLearningMetrics(patternId: string, success: boolean): void {
    const metrics = this.learningMetrics.get(patternId) ?? {
      patternId,
      successRate: 0,
      executionTime: 0,
      adaptationScore: 0,
    }

    metrics.successRate = success ? (metrics.successRate + 1) / 2 : metrics.successRate * 0.9

    this.learningMetrics.set(patternId, metrics)
  }

  private getMotorPattern(id: string): MotorPattern | undefined {
    return this.motorPatterns.get(id)
  }

  async stop(): Promise<void> {
    if (this.status === AgentStatus.IDLE) {
      return
    }

    try {
      this.status = AgentStatus.STOPPING
      await this.shutdown()
      this.status = AgentStatus.IDLE
    } catch (error) {
      this.status = AgentStatus.ERROR
      throw error
    }
  }

  protected async shutdown(): Promise<void> {
    // Clean up resources
    this.eventEmitter.removeAllListeners()
    this.messageQueue = []
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval)
    }
  }
}
