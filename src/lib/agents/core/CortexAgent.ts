import { BaseAgent } from '../base'
import type { Message } from '../../../types'
import { memoryManager } from '../../../lib/memory'

interface WorkingMemoryItem {
  message: Message
  context: string
  startTime: number
}

interface Experience {
  input: Message
  output: Message
  attention: Record<string, number>
}

export class CortexAgent extends BaseAgent {
  protected workingMemory: Map<string, WorkingMemoryItem> = new Map()
  protected longTermMemory: Set<string> = new Set()
  protected attentionSystem: Map<string, number> = new Map()

  constructor(id: string, name: string) {
    super(id, name, 'cortex', ['reasoning', 'planning', 'decision_making', 'learning'])
    this.initializeCortex()
  }

  private async initializeCortex() {
    await this.loadPreviousExperience()
    await this.initializeAttentionSystem()
    await this.registerCapabilities()
  }

  private async loadPreviousExperience() {
    const memories = await memoryManager.search('cortex_experience')
    memories.forEach(memory => {
      this.longTermMemory.add(memory.content)
    })
  }

  private async initializeAttentionSystem() {
    this.attentionSystem.set('task_priority', 1.0)
    this.attentionSystem.set('context_relevance', 0.8)
    this.attentionSystem.set('resource_availability', 0.7)
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Update attention based on message content
      this.updateAttention(message)

      // Process through working memory
      const workingMemoryKey = `task_${Date.now()}`
      this.workingMemory.set(workingMemoryKey, {
        message,
        context: this.getCurrentContext(),
        startTime: Date.now(),
      })

      // Generate response using attention-weighted processing
      const response = await this.generateResponse(message)

      // Store experience in long-term memory
      this.storeExperience({
        input: message,
        output: response,
        attention: Object.fromEntries(this.attentionSystem),
      })

      return response
    } catch (error) {
      console.error('Error in CortexAgent:', error)
      return this.createResponse(
        'I encountered an error in my cognitive processing. Please try rephrasing your request.'
      )
    } finally {
      // Cleanup working memory
      this.cleanupWorkingMemory()
    }
  }

  private updateAttention(message: Message) {
    // Update attention weights based on message content and context
    const urgencyLevel = this.detectUrgency(message)
    const contextRelevance = this.assessContextRelevance(message)

    this.attentionSystem.set('task_priority', urgencyLevel)
    this.attentionSystem.set('context_relevance', contextRelevance)
  }

  private detectUrgency(message: Message): number {
    const urgencyKeywords = ['urgent', 'asap', 'emergency', 'critical']
    const content = message.content.toLowerCase()
    return urgencyKeywords.some(keyword => content.includes(keyword)) ? 1.0 : 0.7
  }

  private assessContextRelevance(message: Message): number {
    const currentContext = Array.from(this.workingMemory.values())
      .map(item => item.context)
      .join(' ')

    const relevanceScore = this.calculateRelevance(message.content, currentContext)
    return relevanceScore
  }

  private calculateRelevance(content: string, context: string): number {
    // Simple relevance calculation - can be enhanced with more sophisticated algorithms
    const contentWords = new Set(content.toLowerCase().split(' '))
    const contextWords = new Set(context.toLowerCase().split(' '))
    const intersection = new Set([...contentWords].filter(x => contextWords.has(x)))
    return intersection.size / Math.max(contentWords.size, contextWords.size)
  }

  private getCurrentContext(): string {
    return Array.from(this.workingMemory.values())
      .slice(-3)
      .map(item => item.message.content)
      .join('\n')
  }

  private async storeExperience(experience: Experience) {
    await memoryManager.add({
      type: 'cortex_experience',
      content: JSON.stringify(experience),
      tags: ['experience', 'learning'],
    })
    this.longTermMemory.add(JSON.stringify(experience))
  }

  private cleanupWorkingMemory() {
    const maxWorkingMemoryItems = 10
    const items = Array.from(this.workingMemory.entries())
    if (items.length > maxWorkingMemoryItems) {
      const itemsToRemove = items.slice(0, items.length - maxWorkingMemoryItems).map(([key]) => key)
      itemsToRemove.forEach(key => this.workingMemory.delete(key))
    }
  }

  protected async generateResponse(message: Message): Promise<Message> {
    // Implement response generation using attention-weighted processing
    const attentionWeights = Object.fromEntries(this.attentionSystem)
    const context = this.getCurrentContext()
    const relevantExperiences = this.findRelevantExperiences(message.content)

    return this.createResponse(
      `Processing with attention weights: ${JSON.stringify(attentionWeights)}\n` +
        `Context: ${context}\n` +
        `Relevant experiences: ${relevantExperiences.length}`
    )
  }

  private findRelevantExperiences(content: string): Experience[] {
    return Array.from(this.longTermMemory)
      .map(exp => JSON.parse(exp) as Experience)
      .filter(exp => this.calculateRelevance(content, exp.input.content) > 0.5)
  }
}
