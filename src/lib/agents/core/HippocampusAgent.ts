import { BaseAgent } from '../base'
import type { Message } from '../../../types'
import { memoryManager } from '../../../lib/memory'

interface MemoryTrace {
  id: string
  content: string
  context: string[]
  emotionalValence: number
  importance: number
  timestamp: number
  retrievalCount: number
  lastAccessed: number
}

export class HippocampusAgent extends BaseAgent {
  private shortTermMemory: Map<string, MemoryTrace> = new Map()
  private consolidationQueue: MemoryTrace[] = []
  private readonly STM_CAPACITY = 7 // Miller's Law
  private readonly CONSOLIDATION_THRESHOLD = 3
  private consolidationInterval: NodeJS.Timer

  constructor(id: string, name: string) {
    super(id, name, 'hippocampus', [
      'memory_formation',
      'memory_consolidation',
      'pattern_completion',
      'spatial_memory',
    ])
    this.initializeHippocampus()
  }

  private initializeHippocampus() {
    this.startMemoryConsolidation()
    this.initializeMemoryIndexes()
  }

  private startMemoryConsolidation() {
    this.consolidationInterval = setInterval(() => {
      this.consolidateMemories()
    }, 60000) // Consolidate every minute
  }

  private async initializeMemoryIndexes() {
    const existingMemories = await memoryManager.search('hippocampus_memory')
    existingMemories.forEach(memory => {
      const trace = JSON.parse(memory.content) as MemoryTrace
      if (this.shouldKeepInShortTerm(trace)) {
        this.shortTermMemory.set(trace.id, trace)
      }
    })
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Create memory trace
      const trace = await this.createMemoryTrace(message)

      // Store in short-term memory
      this.addToShortTermMemory(trace)

      // Check for pattern completion
      const completedPattern = await this.attemptPatternCompletion(trace)

      if (completedPattern) {
        return this.createResponse(`Memory pattern completed: ${completedPattern.content}`)
      }

      return this.createResponse('Memory trace stored successfully')
    } catch (error) {
      console.error('Error in HippocampusAgent:', error)
      return this.createResponse('Error processing memory formation')
    }
  }

  private async createMemoryTrace(message: Message): Promise<MemoryTrace> {
    const trace: MemoryTrace = {
      id: crypto.randomUUID(),
      content: message.content,
      context: this.extractContext(message),
      emotionalValence: this.calculateEmotionalValence(message),
      importance: this.assessImportance(message),
      timestamp: Date.now(),
      retrievalCount: 0,
      lastAccessed: Date.now(),
    }

    await this.storeMemoryTrace(trace)
    return trace
  }

  private extractContext(message: Message): string[] {
    const context: string[] = []

    // Add temporal context
    context.push(`time:${new Date().toISOString()}`)

    // Add message metadata context
    if (message.metadata) {
      Object.entries(message.metadata).forEach(([key, value]) => {
        context.push(`${key}:${value}`)
      })
    }

    return context
  }

  private calculateEmotionalValence(message: Message): number {
    const emotionalKeywords = {
      positive: ['happy', 'good', 'great', 'excellent'],
      negative: ['sad', 'bad', 'terrible', 'awful'],
    }

    const content = message.content.toLowerCase()
    let valence = 0

    emotionalKeywords.positive.forEach(keyword => {
      if (content.includes(keyword)) valence += 0.2
    })

    emotionalKeywords.negative.forEach(keyword => {
      if (content.includes(keyword)) valence -= 0.2
    })

    return Math.max(-1, Math.min(1, valence))
  }

  private assessImportance(message: Message): number {
    const importanceFactors = {
      urgency: ['urgent', 'important', 'critical'],
      novelty: ['new', 'unexpected', 'surprising'],
      relevance: ['goal', 'task', 'objective'],
    }

    const content = message.content.toLowerCase()
    let importance = 0.5 // Base importance

    Object.values(importanceFactors).forEach(factors => {
      factors.forEach(factor => {
        if (content.includes(factor)) importance += 0.1
      })
    })

    return Math.min(1, importance)
  }

  private addToShortTermMemory(trace: MemoryTrace) {
    // Apply forgetting curve to existing memories
    this.applyForgettingCurve()

    // Add new memory
    this.shortTermMemory.set(trace.id, trace)

    // Check capacity
    if (this.shortTermMemory.size > this.STM_CAPACITY) {
      this.forgetLeastImportant()
    }
  }

  private applyForgettingCurve() {
    const now = Date.now()
    this.shortTermMemory.forEach(trace => {
      const age = (now - trace.timestamp) / (1000 * 60) // Age in minutes
      trace.importance *= Math.exp(-age / 100) // Exponential decay
    })
  }

  private forgetLeastImportant() {
    let leastImportantId = ''
    let lowestImportance = Infinity

    this.shortTermMemory.forEach((trace, id) => {
      if (trace.importance < lowestImportance) {
        lowestImportance = trace.importance
        leastImportantId = id
      }
    })

    if (leastImportantId) {
      const trace = this.shortTermMemory.get(leastImportantId)
      if (trace) {
        this.consolidationQueue.push(trace)
      }
      this.shortTermMemory.delete(leastImportantId)
    }
  }

  private async consolidateMemories() {
    const memories = Array.from(this.shortTermMemory.values()).filter(
      trace => trace.retrievalCount >= this.CONSOLIDATION_THRESHOLD || trace.importance > 0.8
    )

    for (const memory of memories) {
      await this.consolidateMemory(memory)
      this.shortTermMemory.delete(memory.id)
    }

    // Process consolidation queue
    while (this.consolidationQueue.length > 0) {
      const memory = this.consolidationQueue.shift()
      if (memory) {
        await this.consolidateMemory(memory)
      }
    }
  }

  private async consolidateMemory(trace: MemoryTrace) {
    await memoryManager.add({
      type: 'consolidated_memory',
      content: JSON.stringify(trace),
      tags: ['memory', 'consolidated', ...trace.context],
    })
  }

  private async attemptPatternCompletion(trace: MemoryTrace): Promise<MemoryTrace | null> {
    const similarMemories = await memoryManager.search(trace.content, {
      type: 'consolidated_memory',
      limit: 5,
    })

    if (similarMemories.length >= 3) {
      const pattern = this.findPattern(similarMemories.map(m => JSON.parse(m.content)))
      if (pattern) {
        return pattern
      }
    }

    return null
  }

  private findPattern(memories: MemoryTrace[]): MemoryTrace | null {
    // Implement pattern recognition logic
    return null
  }

  private shouldKeepInShortTerm(trace: MemoryTrace): boolean {
    const age = (Date.now() - trace.timestamp) / (1000 * 60) // Age in minutes
    return age < 60 && trace.importance > 0.5 // Keep recent and important memories
  }

  private async storeMemoryTrace(trace: MemoryTrace) {
    await memoryManager.add({
      type: 'hippocampus_memory',
      content: JSON.stringify(trace),
      tags: ['memory', 'trace', ...trace.context],
    })
  }

  cleanup() {
    clearInterval(this.consolidationInterval)
  }
}
