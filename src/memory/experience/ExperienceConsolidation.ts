import { supabase } from '../../lib/supabase/client'
import { EventEmitter } from '../../lib/utils/EventEmitter'
import { logger } from '../../lib/utils/logger'

interface ExperienceMetadata {
  timestamp: number
  source?: string
  context?: Record<string, unknown>
  tags?: string[]
  [key: string]: unknown
}

export interface Experience {
  id: string
  type: string
  content: Record<string, unknown>
  metadata: ExperienceMetadata
}

export interface ConsolidatedExperience extends Experience {
  content: {
    experiences: string[]
    summary: string
  }
  metadata: ExperienceMetadata & {
    originalCount: number
    confidence: number
  }
}

interface ConsolidationConfig {
  batchSize?: number
  consolidationIntervalMs?: number
  retryDelayMs?: number
  maxRetries?: number
}

interface ConsolidationEvents {
  consolidation_started: []
  consolidation_stopped: []
  consolidation_cycle_started: []
  consolidation_cycle_completed: [
    {
      groupsProcessed: number
      successfulGroups: number
      failedGroups: number
    }
  ]
  experience_stored: [
    {
      id: string
      type: string
    }
  ]
  error: [
    {
      operation: string
      error: Error
    }
  ]
}

export interface VectorStoreLike {
  storeEmbedding?: (
    vector: number[],
    metadata: {
      id: string
      type: string
      timestamp: number
      source?: string
      context?: Record<string, unknown>
      tags?: string[]
    }
  ) => Promise<void>
}

export class ExperienceConsolidation extends EventEmitter<ConsolidationEvents> {
  private readonly vectorStore: VectorStoreLike
  private readonly batchSize: number
  private readonly intervalMs: number
  private readonly retryDelayMs: number
  private readonly maxRetries: number
  private timer: ReturnType<typeof setInterval> | undefined
  private running = false

  constructor(vectorStore: VectorStoreLike, config: ConsolidationConfig = {}) {
    super()
    this.vectorStore = vectorStore
    this.batchSize = Math.min(config.batchSize ?? 25, 100)
    this.intervalMs = Math.max(config.consolidationIntervalMs ?? 60_000, 5_000)
    this.retryDelayMs = Math.max(config.retryDelayMs ?? 1_000, 250)
    this.maxRetries = Math.max(config.maxRetries ?? 3, 1)
  }

  async start(): Promise<void> {
    if (this.running) {
      throw new Error('Experience consolidation already running')
    }

    this.running = true
    this.emit('consolidation_started')
    this.timer = setInterval(() => void this.consolidate(), this.intervalMs)
    await this.consolidate()
  }

  async stop(): Promise<void> {
    if (!this.running) return

    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }

    this.running = false
    this.emit('consolidation_stopped')
  }

  private async consolidate(): Promise<void> {
    if (!this.running) return

    this.emit('consolidation_cycle_started')

    try {
      const experiences = await this.withRetry(() => this.loadRecentExperiences())
      if (!experiences.length) {
        this.emit('consolidation_cycle_completed', {
          groupsProcessed: 0,
          successfulGroups: 0,
          failedGroups: 0,
        })
        return
      }

      const groups = this.groupByType(experiences)
      let successful = 0
      let failed = 0

      for (const group of groups) {
        try {
          await this.consolidateGroup(group)
          successful += 1
        } catch (error) {
          failed += 1
          logger.error('Failed to consolidate experiences', {
            error,
            groupSize: group.length,
          })
          this.emit('error', {
            operation: 'consolidate_group',
            error: this.normalizeError(error),
          })
        }
      }

      this.emit('consolidation_cycle_completed', {
        groupsProcessed: groups.length,
        successfulGroups: successful,
        failedGroups: failed,
      })
    } catch (error) {
      this.emit('error', {
        operation: 'consolidate',
        error: this.normalizeError(error),
      })
    }
  }

  private async consolidateGroup(group: Experience[]): Promise<void> {
    if (!group.length) return

    const consolidated: ConsolidatedExperience = {
      id: `cx-${group[0].id}-${Date.now()}`,
      type: 'consolidated_experience',
      content: {
        experiences: group.map(exp => exp.id),
        summary: this.buildSummary(group),
      },
      metadata: {
        ...group[0].metadata,
        timestamp: Date.now(),
        originalCount: group.length,
        confidence: 0.8,
      },
    }

    await this.withRetry(() => this.persistExperience(consolidated))
    await this.maybeStoreEmbedding(consolidated)
    this.emit('experience_stored', { id: consolidated.id, type: consolidated.type })
  }

  private async persistExperience(experience: Experience): Promise<void> {
    const { error } = await supabase.from('experiences').insert({
      id: experience.id,
      type: experience.type,
      content: experience.content,
      metadata: experience.metadata,
    })

    if (error) {
      throw error
    }
  }

  private async maybeStoreEmbedding(experience: Experience): Promise<void> {
    if (!this.vectorStore.storeEmbedding) return

    const vector = this.createPlaceholderEmbedding()
    await this.vectorStore.storeEmbedding(vector, {
      id: experience.id,
      type: experience.type,
      timestamp: experience.metadata.timestamp,
      source: experience.metadata.source,
      context: experience.metadata.context,
      tags: experience.metadata.tags,
    })
  }

  private buildSummary(group: Experience[]): string {
    const preview = group
      .map(item => item.content.summary ?? JSON.stringify(item.content))
      .slice(0, 3)
      .join(' | ')
    return `Consolidated ${group.length} experiences: ${preview}`
  }

  private async loadRecentExperiences(): Promise<Experience[]> {
    const cutoff = Date.now() - this.intervalMs

    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .gte('metadata->timestamp', cutoff)
      .limit(this.batchSize)

    if (error) {
      throw error
    }

    return (data ?? []) as Experience[]
  }

  private groupByType(experiences: Experience[]): Experience[][] {
    const groups = new Map<string, Experience[]>()

    for (const experience of experiences) {
      const key = experience.type || 'unknown'
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(experience)
    }

    return Array.from(groups.values())
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0
    let lastError: Error | undefined

    while (attempt < this.maxRetries) {
      try {
        return await operation()
      } catch (error) {
        lastError = this.normalizeError(error)
        attempt += 1
        if (attempt >= this.maxRetries) break
        await new Promise(resolve => setTimeout(resolve, this.retryDelayMs * attempt))
      }
    }

    throw lastError ?? new Error('Unknown consolidation error')
  }

  private createPlaceholderEmbedding(): number[] {
    return new Array(1536).fill(0)
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    return new Error(typeof error === 'string' ? error : 'Unexpected error')
  }
}
