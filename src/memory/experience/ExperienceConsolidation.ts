import { EventEmitter } from 'events'
import { VectorStore } from '../vector/VectorStore'
import { supabase } from '../../lib/supabase/client'

interface Experience {
  id: string
  type: string
  content: any
  metadata: {
    timestamp: number
    source: string
    context?: any
    tags?: string[]
  }
}

interface ConsolidationConfig {
  batchSize?: number
  consolidationInterval?: number
  minConfidence?: number
}

export class ExperienceConsolidation extends EventEmitter {
  private vectorStore: VectorStore
  private batchSize: number
  private consolidationInterval: number
  private minConfidence: number
  private consolidationTimer?: ReturnType<typeof setInterval>

  constructor(vectorStore: VectorStore, config: ConsolidationConfig = {}) {
    super()
    this.vectorStore = vectorStore
    this.batchSize = config.batchSize || 50
    this.consolidationInterval = config.consolidationInterval || 3600000 // 1 hour
    this.minConfidence = config.minConfidence || 0.8
  }

  public async start(): Promise<void> {
    if (this.consolidationTimer) {
      throw new Error('Consolidation already running')
    }

    this.consolidationTimer = setInterval(() => this.consolidate(), this.consolidationInterval)

    this.emit('consolidation_started')
  }

  public async stop(): Promise<void> {
    if (this.consolidationTimer) {
      clearInterval(this.consolidationTimer)
      this.consolidationTimer = undefined
      this.emit('consolidation_stopped')
    }
  }

  public async storeExperience(experience: Experience): Promise<void> {
    try {
      // Store in Supabase for persistence
if (!experience.id || !experience.type || !experience.content || !experience.metadata?.timestamp) {
  throw new Error('Invalid experience object: missing required fields')
}
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

  public async retrieveSimilarExperiences(
    context: string,
    limit: number = 5,
    queryContext?: {
      tags?: string[]
      source?: string
    }
  ): Promise<Experience[]> {
    try {
      const queryVector = await this.generateEmbedding({ content: context })
      const results = await this.vectorStore.enhancedSemanticSearch(
        queryVector,
        {
          timestamp: Date.now(),
          tags: queryContext?.tags,
          source: queryContext?.source,
        },
        limit
      )

      // Log relevance metrics for monitoring
      results.forEach(result => {
        this.emit('relevance_metrics', {
          experienceId: result.id,
          metrics: result.relevanceMetrics,
        })
      })

      const { data: experiences, error } = await supabase
        .from('experiences')
        .select('*')
        .in(
          'id',
          results.map(r => r.id)
        )

      if (error) throw error

      // Sort experiences to match the relevance-based order
      const orderedExperiences = experiences?.sort((a, b) => {
        const aIndex = results.findIndex(r => r.id === a.id)
        const bIndex = results.findIndex(r => r.id === b.id)
        return aIndex - bIndex
      })

      return orderedExperiences || []
    } catch (error) {
      this.emit('error', {
        operation: 'retrieve_experiences',
        error,
      })
      throw error
    }
  }

  private async consolidate(): Promise<void> {
    try {
      this.emit('consolidation_started')

      // Get recent experiences
      const recentExperiences = await this.getRecentExperiences()

      // Group similar experiences
      const groups = await this.groupSimilarExperiences(recentExperiences)

      // Consolidate each group
      for (const group of groups) {
        await this.consolidateGroup(group)
      }

      this.emit('consolidation_completed', {
        groupsProcessed: groups.length,
      })
    } catch (error) {
      this.emit('error', {
        operation: 'consolidate',
        error,
      })
    }
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

  private async consolidateGroup(group: Experience[]): Promise<void> {
    // TODO: Implement actual consolidation logic
    const consolidated = {
      id: `consolidated_${Date.now()}`,
      type: 'consolidated_experience',
      content: {
        experiences: group.map(exp => exp.id),
        summary: 'Consolidated experience',
      },
      metadata: {
        timestamp: Date.now(),
        source: 'consolidation',
        originalCount: group.length,
      },
    }

    await this.storeExperience(consolidated)
  }

  private async generateEmbedding(_input: Experience | { content: string }): Promise<number[]> {
    // TODO: Implement actual embedding generation
    return new Array(1536).fill(0)
  }
}
