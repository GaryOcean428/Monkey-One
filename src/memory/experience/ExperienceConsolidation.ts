import { EventEmitter } from '../../lib/utils/EventEmitter'
import { VectorStore } from '../../lib/vectorstore/VectorStore'
import { logger } from '../../lib/utils/logger'
import { Experience } from './Experience'
import { validateExperience } from './validation'
import { sanitizeExperience } from './sanitization'
import { supabase } from '../../lib/supabase/client'

interface ConsolidationConfig {
  batchSize?: number
  consolidationInterval?: number
  minConfidence?: number
  maxRetries?: number
  retryDelay?: number
}

export class ExperienceConsolidation extends EventEmitter {
  private vectorStore: VectorStore
  private batchSize: number
  private consolidationInterval: number
  private minConfidence: number
  private maxRetries: number
  private retryDelay: number
  private consolidationTimer?: ReturnType<typeof setInterval>
  private isRunning: boolean = false
  private pendingGroups: Set<string> = new Set()

  constructor(vectorStore: VectorStore, config: ConsolidationConfig = {}) {
    super()
    this.vectorStore = vectorStore
    this.batchSize = Math.min(config.batchSize || 50, 100) // Cap batch size
    this.consolidationInterval = Math.max(config.consolidationInterval || 3600000, 60000) // Min 1 minute
    this.minConfidence = Math.min(config.minConfidence || 0.8, 0.95) // Cap confidence
    this.maxRetries = config.maxRetries || 3
    this.retryDelay = config.retryDelay || 1000
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Consolidation already running')
    }

    try {
      // Store in Supabase for persistence
      if (
        !experience.id ||
        !experience.type ||
        !experience.content ||
        !experience.metadata?.timestamp
      ) {
        throw new Error('Invalid experience object: missing required fields')
      }
      const { error: dbError } = await supabase.from('experiences').insert({
        id: experience.id,
        type: experience.type,
        content: experience.content,
        metadata: experience.metadata,
      })

      this.isRunning = true
      this.consolidationTimer = setInterval(() => this.consolidate(), this.consolidationInterval)

      // Run initial consolidation
      await this.consolidate()

      this.emit('consolidation_started')
    } catch (error) {
      this.isRunning = false
      this.emit('error', {
        operation: 'start',
        error: this.sanitizeError(error),
      })
      throw error
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    try {
      if (this.consolidationTimer) {
        clearInterval(this.consolidationTimer)
        this.consolidationTimer = undefined
      }

      // Wait for pending consolidations to complete
      if (this.pendingGroups.size > 0) {
        logger.info(`Waiting for ${this.pendingGroups.size} pending consolidations to complete`)
        await this.waitForPendingConsolidations()
      }

      this.isRunning = false
      this.emit('consolidation_stopped')
    } catch (error) {
      this.emit('error', {
        operation: 'stop',
        error: this.sanitizeError(error),
      })
      throw error
    }
  }

  private async consolidate(): Promise<void> {
    if (!this.isRunning) return

    try {
      this.emit('consolidation_cycle_started')

      // Get recent experiences with retry logic
      const recentExperiences = await this.retryOperation(
        () => this.getRecentExperiences(),
        'getRecentExperiences'
      )

      // Group similar experiences
      const groups = await this.groupSimilarExperiences(recentExperiences)

      // Track consolidation progress
      let successfulGroups = 0
      let failedGroups = 0

      // Consolidate each group with proper cleanup
      for (const group of groups) {
        const groupId = this.generateGroupId(group)
        this.pendingGroups.add(groupId)

        try {
          await this.consolidateGroup(group)
          successfulGroups++
        } catch (error) {
          failedGroups++
          logger.error('Failed to consolidate group:', {
            groupId,
            error: this.sanitizeError(error),
          })
        } finally {
          this.pendingGroups.delete(groupId)
        }

        // Free up memory after each group
        group.length = 0
      }

      this.emit('consolidation_cycle_completed', {
        groupsProcessed: groups.length,
        successfulGroups,
        failedGroups,
      })
    } catch (error) {
      this.emit('error', {
        operation: 'consolidate',
        error: this.sanitizeError(error),
      })
    }
  }

  private async consolidateGroup(group: Experience[]): Promise<void> {
    if (!group.length) return

    try {
      // Validate and sanitize experiences
      const validExperiences = group
        .map(exp => {
          try {
            validateExperience(exp)
            return sanitizeExperience(exp)
          } catch (error) {
            logger.warn('Invalid experience skipped:', {
              id: exp.id,
              error: this.sanitizeError(error),
            })
            return null
          }
        })
        .filter((exp): exp is Experience => exp !== null)

      if (!validExperiences.length) {
        throw new Error('No valid experiences in group')
      }

      // Create consolidated experience
      const consolidated = {
        id: this.generateGroupId(validExperiences),
        type: 'consolidated_experience',
        content: {
          experiences: validExperiences.map(exp => exp.id),
          summary: await this.generateSummary(validExperiences),
        },
        metadata: {
          timestamp: Date.now(),
          source: 'consolidation',
          originalCount: validExperiences.length,
          confidence: await this.calculateConfidence(validExperiences),
        },
      }

      // Store with retry logic
      await this.retryOperation(() => this.storeExperience(consolidated), 'storeExperience')

      // Clean up original experiences to free memory
      validExperiences.length = 0
    } catch (error) {
      throw new Error(`Failed to consolidate group: ${error.message}`)
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    retries = this.maxRetries
  ): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        logger.warn(`${operationName} failed, attempt ${attempt}/${retries}:`, {
          error: this.sanitizeError(error),
        })

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
        }
      }
    }

    throw lastError || new Error(`${operationName} failed after ${retries} attempts`)
  }

  private async waitForPendingConsolidations(timeout = 30000): Promise<void> {
    const start = Date.now()

    while (this.pendingGroups.size > 0) {
      if (Date.now() - start > timeout) {
        logger.warn(
          `Timeout waiting for pending consolidations: ${this.pendingGroups.size} remaining`
        )
        break
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  private generateGroupId(group: Experience[]): string {
    return `consolidated_${Date.now()}_${group[0]?.id || 'empty'}`
  }

  private sanitizeError(error: unknown): Error {
    if (error instanceof Error) {
      // Remove any sensitive information from error message
      const sanitizedMessage = error.message.replace(/[A-Za-z0-9+/=]{40,}/, '[REDACTED]')
      return new Error(sanitizedMessage)
    }
    return new Error('Unknown error occurred')
  }

  private async calculateConfidence(experiences: Experience[]): Promise<number> {
    // Implement confidence calculation based on experience similarity
    return experiences.length > 1 ? 0.9 : 0.8
  }

  private async generateSummary(experiences: Experience[]): Promise<string> {
    // TODO: Implement summary generation using LLM
    return `Consolidated ${experiences.length} experiences`
  }

  private async getRecentExperiences(): Promise<Experience[]> {
    const cutoffTime = Date.now() - this.consolidationInterval

    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .gte('metadata->timestamp', cutoffTime)
      .limit(this.batchSize)

    if (error) throw error
    return data || []
  }

  private async groupSimilarExperiences(experiences: Experience[]): Promise<Experience[][]> {
    const groups: Experience[][] = []
    const processed = new Set<string>()

    for (const exp of experiences) {
      if (processed.has(exp.id)) continue

      const similar = await this.findSimilarExperiences(exp)
      if (similar.length > 0) {
        groups.push([exp, ...similar])
        similar.forEach(s => processed.add(s.id))
      }
      processed.add(exp.id)
    }

    return groups
  }

  private async findSimilarExperiences(experience: Experience): Promise<Experience[]> {
    const vector = await this.generateEmbedding(experience)
    const results = await this.vectorStore.enhancedSemanticSearch(
      vector,
      {
        timestamp: Date.now(),
        tags: experience.metadata.tags,
        source: experience.metadata.source,
      },
      this.batchSize
    )

    // Filter based on comprehensive relevance score
    const relevantResults = results.filter(r => r.relevanceMetrics.finalScore >= this.minConfidence)

    const { data: experiences, error } = await supabase
      .from('experiences')
      .select('*')
      .in(
        'id',
        relevantResults.map(r => r.id)
      )

    if (error) throw error

    // Sort experiences by relevance score
    const orderedExperiences = experiences?.sort((a, b) => {
      const aResult = relevantResults.find(r => r.id === a.id)
      const bResult = relevantResults.find(r => r.id === b.id)
      return (
        (bResult?.relevanceMetrics.finalScore || 0) - (aResult?.relevanceMetrics.finalScore || 0)
      )
    })

    return orderedExperiences || []
  }

  private async storeExperience(experience: Experience): Promise<void> {
    try {
      // Store in Supabase for persistence
      const { error: dbError } = await supabase.from('experiences').insert({
        id: experience.id,
        type: experience.type,
        content: experience.content,
        metadata: experience.metadata,
      })

      if (dbError) throw dbError

      // Store in vector store for semantic search
      const vector = await this.generateEmbedding(experience)
      await this.vectorStore.storeEmbedding(vector, {
        id: experience.id,
        type: experience.type,
        timestamp: experience.metadata.timestamp,
        source: experience.metadata.source,
        context: experience.metadata.context,
        tags: experience.metadata.tags,
      })

      this.emit('experience_stored', {
        id: experience.id,
        type: experience.type,
      })
    } catch (error) {
      this.emit('error', {
        operation: 'store_experience',
        error,
      })
      throw error
    }
  }

  private async generateEmbedding(_input: Experience | { content: string }): Promise<number[]> {
    // TODO: Implement actual embedding generation
    return new Array(1536).fill(0)
  }
}
