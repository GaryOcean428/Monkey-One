/**
 * Machine Learning Enhanced Entity Extractor
 *
 * Uses pattern recognition and context analysis to improve
 * entity extraction accuracy beyond simple regex patterns.
 */

import type { EntityExtraction, RelationshipExtraction, NodeType, EdgeType } from './types'

interface MLExtractionContext {
  domain?: string
  previousEntities?: EntityExtraction[]
  confidence?: number
  source?: string
}

interface EntityPattern {
  pattern: RegExp
  type: NodeType
  confidence: number
  contextBoost?: (text: string, match: RegExpMatchArray) => number
  validator?: (match: RegExpMatchArray, context: string) => boolean
}

interface RelationshipPattern {
  pattern: RegExp
  type: EdgeType
  confidence: number
  extractor: (
    match: RegExpMatchArray,
    entities: Map<string, EntityExtraction>
  ) => {
    from?: EntityExtraction
    to?: EntityExtraction
  } | null
}

export class MLEntityExtractor {
  private entityPatterns: EntityPattern[] = []
  private relationshipPatterns: RelationshipPattern[] = []
  private contextMemory: Map<string, number> = new Map()
  private entityFrequency: Map<string, number> = new Map()

  constructor() {
    this.initializePatterns()
  }

  private initializePatterns(): void {
    // Advanced service patterns with context awareness
    this.entityPatterns.push(
      {
        pattern:
          /(?:the\s+)?(\w+(?:-\w+)*)\s+(?:service|microservice|api|application|app|backend|frontend)/gi,
        type: 'Service',
        confidence: 0.9,
        contextBoost: (text, match) => {
          // Boost confidence if mentioned with deployment terms
          const deploymentTerms = /deploy|production|staging|kubernetes|docker|container/i
          return deploymentTerms.test(text) ? 0.1 : 0
        },
      },
      {
        pattern: /(?:service|api)\s+(?:called\s+|named\s+)?(\w+(?:-\w+)*)/gi,
        type: 'Service',
        confidence: 0.85,
      },
      {
        pattern: /(\w+(?:-\w+)*)\s+(?:is\s+a|acts\s+as)\s+(?:service|api|microservice)/gi,
        type: 'Service',
        confidence: 0.8,
      }
    )

    // Enhanced configuration patterns
    this.entityPatterns.push(
      {
        pattern: /\b([A-Z][A-Z0-9_]*[A-Z0-9])\b/g,
        type: 'Configuration',
        confidence: 0.7,
        validator: (match, context) => {
          const envVarIndicators =
            /env|environment|config|setting|variable|secret|key|token|url|host|port|password/i
          const commonWords = /^(API|URL|DB|JWT|HTTP|HTTPS|SSL|TLS|AWS|GCP|AZURE)$/
          return (
            match[1].length >= 3 &&
            (match[1].includes('_') || commonWords.test(match[1])) &&
            envVarIndicators.test(context)
          )
        },
        contextBoost: (text, match) => {
          const criticalPatterns = /password|secret|key|token|credential/i
          return criticalPatterns.test(text) ? 0.2 : 0
        },
      },
      {
        pattern:
          /(?:config|configuration|setting|env|environment)\s+(?:variable\s+)?(?:called\s+|named\s+)?([A-Z_][A-Z0-9_]*)/gi,
        type: 'Configuration',
        confidence: 0.95,
      }
    )

    // Database patterns with type detection
    this.entityPatterns.push(
      {
        pattern:
          /(?:(\w+)\s+)?(?:postgres|postgresql|mysql|mongodb|redis|elasticsearch|cassandra|dynamodb|sqlite)\s*(?:database|db|cluster|instance)?/gi,
        type: 'Database',
        confidence: 0.9,
        contextBoost: (text, match) => {
          const productionTerms = /production|prod|staging|live/i
          return productionTerms.test(text) ? 0.1 : 0
        },
      },
      {
        pattern: /database\s+(?:called\s+|named\s+)?(\w+)/gi,
        type: 'Database',
        confidence: 0.85,
      }
    )

    // User and team patterns
    this.entityPatterns.push(
      {
        pattern: /(?:developer|engineer|user|person)\s+(\w+)/gi,
        type: 'User',
        confidence: 0.8,
      },
      {
        pattern: /(?:team|group|squad)\s+(\w+)/gi,
        type: 'Team',
        confidence: 0.85,
      },
      {
        pattern: /(@\w+)/g,
        type: 'User',
        confidence: 0.9,
      }
    )

    // Environment patterns
    this.entityPatterns.push(
      {
        pattern:
          /(?:in|on|to)\s+(production|staging|development|dev|prod|test|qa)\s+(?:environment|env)/gi,
        type: 'Environment',
        confidence: 0.95,
      },
      {
        pattern: /(production|staging|development|dev|prod|test|qa)\s+deployment/gi,
        type: 'Environment',
        confidence: 0.8,
      }
    )

    // Incident and issue patterns
    this.entityPatterns.push(
      {
        pattern: /(?:issue|incident|bug|error|problem)\s*#?(\d+)/gi,
        type: 'Incident',
        confidence: 0.9,
      },
      {
        pattern: /(?:ticket|task|story)\s*#?(\d+)/gi,
        type: 'Task',
        confidence: 0.85,
      }
    )

    // Initialize relationship patterns
    this.initializeRelationshipPatterns()
  }

  private initializeRelationshipPatterns(): void {
    this.relationshipPatterns.push(
      {
        pattern:
          /(\w+(?:-\w+)*)\s+(?:requires?|needs?)\s+([A-Z_][A-Z0-9_]*|[\w\s-]+?)(?:\s+(?:to|for|in)|[.,]|$)/gi,
        type: 'REQUIRES',
        confidence: 0.9,
        extractor: (match, entities) => this.findEntityPair(match[1], match[2], entities),
      },
      {
        pattern:
          /(\w+(?:-\w+)*)\s+(?:depends?\s+on|relies\s+on)\s+([\w\s-]+?)(?:\s+(?:to|for|in)|[.,]|$)/gi,
        type: 'DEPENDS_ON',
        confidence: 0.95,
        extractor: (match, entities) => this.findEntityPair(match[1], match[2], entities),
      },
      {
        pattern:
          /(\w+(?:-\w+)*)\s+(?:connects?\s+to|talks\s+to|communicates\s+with)\s+([\w\s-]+?)(?:\s+(?:via|through|using)|[.,]|$)/gi,
        type: 'CONNECTS_TO',
        confidence: 0.85,
        extractor: (match, entities) => this.findEntityPair(match[1], match[2], entities),
      },
      {
        pattern:
          /(\w+(?:-\w+)*)\s+(?:is\s+)?deployed\s+(?:to|on|in)\s+([\w\s-]+?)(?:\s+(?:environment|cluster)|[.,]|$)/gi,
        type: 'DEPLOYED_TO',
        confidence: 0.9,
        extractor: (match, entities) => this.findEntityPair(match[1], match[2], entities),
      },
      {
        pattern:
          /(\w+(?:-\w+)*)\s+(?:was\s+)?(?:caused\s+by|due\s+to|because\s+of)\s+([\w\s-]+?)(?:[.,]|$)/gi,
        type: 'CAUSED_BY',
        confidence: 0.85,
        extractor: (match, entities) => this.findEntityPair(match[1], match[2], entities),
      },
      {
        pattern: /(\w+(?:-\w+)*)\s+(?:manages?|owns?|maintains?)\s+([\w\s-]+?)(?:[.,]|$)/gi,
        type: 'MANAGES',
        confidence: 0.8,
        extractor: (match, entities) => this.findEntityPair(match[1], match[2], entities),
      }
    )
  }

  private findEntityPair(
    fromText: string,
    toText: string,
    entities: Map<string, EntityExtraction>
  ): { from?: EntityExtraction; to?: EntityExtraction } | null {
    const fromKey = this.normalizeEntityName(fromText)
    const toKey = this.normalizeEntityName(toText)

    const from = entities.get(fromKey) || this.findBestMatch(fromKey, entities)
    const to = entities.get(toKey) || this.findBestMatch(toKey, entities)

    return from && to ? { from, to } : null
  }

  private normalizeEntityName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, '_').replace(/-/g, '_')
  }

  private findBestMatch(
    target: string,
    entities: Map<string, EntityExtraction>
  ): EntityExtraction | undefined {
    const candidates = Array.from(entities.entries())

    // Exact match
    const exact = candidates.find(([key]) => key === target)
    if (exact) return exact[1]

    // Partial match
    const partial = candidates.find(
      ([key, entity]) =>
        key.includes(target) ||
        target.includes(key) ||
        entity.properties.name?.toLowerCase().includes(target) ||
        entity.properties.key?.toLowerCase().includes(target)
    )

    return partial?.[1]
  }

  extractEntities(text: string, context: MLExtractionContext = {}): EntityExtraction[] {
    const entities: EntityExtraction[] = []
    const seenEntities = new Set<string>()

    for (const pattern of this.entityPatterns) {
      let match
      pattern.pattern.lastIndex = 0 // Reset regex state

      while ((match = pattern.pattern.exec(text)) !== null) {
        if (pattern.validator && !pattern.validator(match, text)) {
          continue
        }

        const entityName = match[1] || match[0]
        const normalizedName = this.normalizeEntityName(entityName)
        const entityId = `${pattern.type.toLowerCase()}:${normalizedName}`

        if (seenEntities.has(entityId)) continue
        seenEntities.add(entityId)

        let confidence = pattern.confidence

        // Apply context boost
        if (pattern.contextBoost) {
          confidence += pattern.contextBoost(text, match)
        }

        // Apply frequency boost
        const frequency = this.entityFrequency.get(normalizedName) || 0
        confidence += Math.min(0.1, frequency * 0.02)

        // Apply domain context boost
        if (context.domain) {
          const domainBoost = this.getDomainBoost(pattern.type, context.domain)
          confidence += domainBoost
        }

        entities.push({
          id: entityId,
          type: pattern.type,
          properties: {
            name: entityName,
            confidence,
            extractedBy: 'ml-extractor',
            context: match[0],
            ...(pattern.type === 'Configuration' && { key: entityName }),
          },
        })

        // Update frequency tracking
        this.entityFrequency.set(normalizedName, frequency + 1)
      }
    }

    return entities
  }

  extractRelationships(
    text: string,
    entities: EntityExtraction[],
    context: MLExtractionContext = {}
  ): RelationshipExtraction[] {
    const relationships: RelationshipExtraction[] = []
    const entityMap = new Map<string, EntityExtraction>()

    // Build entity lookup map
    entities.forEach(entity => {
      const name = entity.properties.name?.toLowerCase()
      const key = entity.properties.key?.toLowerCase()

      if (name) {
        entityMap.set(name, entity)
        entityMap.set(this.normalizeEntityName(name), entity)
      }
      if (key) {
        entityMap.set(key, entity)
        entityMap.set(this.normalizeEntityName(key), entity)
      }
    })

    for (const pattern of this.relationshipPatterns) {
      let match
      pattern.pattern.lastIndex = 0

      while ((match = pattern.pattern.exec(text)) !== null) {
        const entityPair = pattern.extractor(match, entityMap)

        if (entityPair?.from && entityPair?.to) {
          let confidence = pattern.confidence

          // Boost confidence based on entity confidence
          const avgEntityConfidence =
            ((entityPair.from.properties.confidence || 0.5) +
              (entityPair.to.properties.confidence || 0.5)) /
            2
          confidence += (avgEntityConfidence - 0.5) * 0.2

          relationships.push({
            type: pattern.type,
            from: entityPair.from.id,
            to: entityPair.to.id,
            properties: {
              confidence,
              context: match[0],
              extractedBy: 'ml-extractor',
            },
          })
        }
      }
    }

    return relationships
  }

  private getDomainBoost(nodeType: NodeType, domain: string): number {
    const domainBoosts: Record<string, Partial<Record<NodeType, number>>> = {
      devops: {
        Service: 0.1,
        Configuration: 0.15,
        Environment: 0.1,
        Deployment: 0.15,
      },
      infrastructure: {
        Database: 0.15,
        Service: 0.1,
        Configuration: 0.1,
      },
      development: {
        Repository: 0.15,
        User: 0.1,
        Task: 0.1,
      },
      operations: {
        Incident: 0.15,
        Task: 0.1,
        Environment: 0.1,
      },
    }

    return domainBoosts[domain]?.[nodeType] || 0
  }

  // Advanced context-aware extraction
  extractWithContext(
    text: string,
    context: MLExtractionContext = {}
  ): { entities: EntityExtraction[]; relationships: RelationshipExtraction[] } {
    // First pass: extract entities
    const entities = this.extractEntities(text, context)

    // Second pass: extract relationships with entity context
    const relationships = this.extractRelationships(text, entities, context)

    // Third pass: apply co-occurrence analysis
    this.applyCoccurrenceAnalysis(entities, text)

    // Fourth pass: validate and refine
    const refinedEntities = this.refineEntities(entities, context)
    const refinedRelationships = this.refineRelationships(relationships, refinedEntities)

    return {
      entities: refinedEntities,
      relationships: refinedRelationships,
    }
  }

  private applyCoccurrenceAnalysis(entities: EntityExtraction[], text: string): void {
    // Boost confidence for entities that appear together frequently
    const sentences = text.split(/[.!?]+/)

    for (const sentence of sentences) {
      const entitiesInSentence = entities.filter(entity =>
        sentence.toLowerCase().includes(entity.properties.name?.toLowerCase() || '')
      )

      if (entitiesInSentence.length > 1) {
        entitiesInSentence.forEach(entity => {
          entity.properties.confidence = Math.min(1.0, (entity.properties.confidence || 0.5) + 0.05)
        })
      }
    }
  }

  private refineEntities(
    entities: EntityExtraction[],
    context: MLExtractionContext
  ): EntityExtraction[] {
    return entities
      .filter(entity => (entity.properties.confidence || 0) >= 0.6)
      .map(entity => ({
        ...entity,
        properties: {
          ...entity.properties,
          refined: true,
          contextDomain: context.domain,
        },
      }))
  }

  private refineRelationships(
    relationships: RelationshipExtraction[],
    entities: EntityExtraction[]
  ): RelationshipExtraction[] {
    const entityIds = new Set(entities.map(e => e.id))

    return relationships
      .filter(
        rel =>
          entityIds.has(rel.from) &&
          entityIds.has(rel.to) &&
          (rel.properties?.confidence || 0) >= 0.7
      )
      .map(rel => ({
        ...rel,
        properties: {
          ...rel.properties,
          refined: true,
        },
      }))
  }

  // Learning and adaptation methods
  updateFromFeedback(
    text: string,
    expectedEntities: EntityExtraction[],
    expectedRelationships: RelationshipExtraction[]
  ): void {
    // Update entity frequency based on correct extractions
    expectedEntities.forEach(entity => {
      const name = this.normalizeEntityName(entity.properties.name || entity.id)
      const current = this.entityFrequency.get(name) || 0
      this.entityFrequency.set(name, current + 1)
    })

    // Store context patterns for future use
    const contextKey = this.generateContextKey(text)
    this.contextMemory.set(contextKey, expectedEntities.length + expectedRelationships.length)
  }

  private generateContextKey(text: string): string {
    // Generate a simple hash of key terms for context matching
    const keyTerms =
      text
        .toLowerCase()
        .match(/\b(?:service|database|config|deploy|incident|user|team|api|environment)\b/g) || []
    return keyTerms.sort().join('-')
  }

  getExtractionStats(): {
    totalPatterns: number
    entityPatterns: number
    relationshipPatterns: number
    learnedContexts: number
    entityFrequencies: number
  } {
    return {
      totalPatterns: this.entityPatterns.length + this.relationshipPatterns.length,
      entityPatterns: this.entityPatterns.length,
      relationshipPatterns: this.relationshipPatterns.length,
      learnedContexts: this.contextMemory.size,
      entityFrequencies: this.entityFrequency.size,
    }
  }
}
