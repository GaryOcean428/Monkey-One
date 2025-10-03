/**
 * Ingestor Agent Implementation
 *
 * Responsible for extracting entities and relationships from text
 * and adding them to the memory graph.
 */

import type { NodeType, EdgeType, EntityExtraction, RelationshipExtraction } from './types'
import type { MemoryGraph } from './memory-graph'

export class IngestorAgent {
  constructor(private graph: MemoryGraph) {}

  async ingestText(text: string, source: string): Promise<void> {
    // Extract entities and relationships
    const entities = this.extractEntities(text)
    const relationships = this.extractRelationships(text, entities)

    // Add to graph
    for (const entity of entities) {
      this.graph.addNode({
        id: entity.id,
        type: entity.type,
        properties: entity.properties,
        metadata: { createdBy: 'IngestorAgent', source },
      })
    }

    for (const rel of relationships) {
      this.graph.addEdge({
        type: rel.type,
        from: rel.from,
        to: rel.to,
        properties: rel.properties,
      })
    }
  }

  async ingestStructuredData(
    data: {
      entities: EntityExtraction[]
      relationships: RelationshipExtraction[]
    },
    source: string
  ): Promise<void> {
    // Add entities
    for (const entity of data.entities) {
      this.graph.addNode({
        id: entity.id,
        type: entity.type,
        properties: entity.properties,
        metadata: { createdBy: 'IngestorAgent', source },
      })
    }

    // Add relationships
    for (const rel of data.relationships) {
      this.graph.addEdge({
        type: rel.type,
        from: rel.from,
        to: rel.to,
        properties: rel.properties,
      })
    }
  }

  private extractEntities(text: string): EntityExtraction[] {
    const entities: EntityExtraction[] = []

    // Service detection - more flexible patterns
    const servicePattern =
      /(?:(\w+(?:-\w+)*)\s+(?:service|api|backend|frontend|microservice)|(?:service|api)\s+(\w+(?:-\w+)*))/gi
    let match
    while ((match = servicePattern.exec(text)) !== null) {
      const serviceName = match[1] || match[2]
      entities.push({
        id: `service:${serviceName.toLowerCase()}`,
        type: 'Service' as NodeType,
        properties: {
          name: serviceName,
          description: `Service extracted from text: ${match[0]}`,
        },
      })
    }

    // Environment variable detection - look for ALL_CAPS patterns
    const envVarPattern = /\b([A-Z][A-Z0-9_]*[A-Z0-9])\b/g
    while ((match = envVarPattern.exec(text)) !== null) {
      // Only consider it an env var if it's reasonably long and contains underscore or is known pattern
      if (
        match[1].length >= 3 &&
        (match[1].includes('_') ||
          /^(API|DB|URL|KEY|SECRET|TOKEN|HOST|PORT|PASSWORD)/.test(match[1]))
      ) {
        entities.push({
          id: `env:${match[1]}`,
          type: 'Configuration' as NodeType,
          properties: {
            key: match[1],
            type: 'environment_variable',
            description: `Environment variable: ${match[1]}`,
          },
        })
      }
    }

    // Issue/Incident detection
    const issuePattern = /(?:issue|incident|bug|error|INC-|ISSUE-|BUG-)\s*#?(\d+)/gi
    while ((match = issuePattern.exec(text)) !== null) {
      entities.push({
        id: `incident:${match[1]}`,
        type: 'Incident' as NodeType,
        properties: {
          number: match[1],
          description: `Incident #${match[1]}`,
        },
      })
    }

    // Database detection
    const dbPattern =
      /(?:(\w+)\s+(?:database|db)|(?:postgres|mysql|mongodb|redis|postgresql)\s*(?:database|db)?)/gi
    while ((match = dbPattern.exec(text)) !== null) {
      const dbName = match[1] || match[0].split(/\s+/)[0]
      entities.push({
        id: `database:${dbName.toLowerCase()}`,
        type: 'Database' as NodeType,
        properties: {
          name: dbName,
          description: `Database: ${dbName}`,
        },
      })
    }

    // API detection
    const apiPattern = /(\w+)\s+(?:api|endpoint|rest|graphql)/gi
    while ((match = apiPattern.exec(text)) !== null) {
      entities.push({
        id: `api:${match[1].toLowerCase()}`,
        type: 'API' as NodeType,
        properties: {
          name: match[1],
          description: `API: ${match[1]}`,
        },
      })
    }

    // User/Team detection
    const userPattern = /(?:user|developer|engineer|team)\s+(\w+)/gi
    while ((match = userPattern.exec(text)) !== null) {
      entities.push({
        id: `user:${match[1].toLowerCase()}`,
        type: 'User' as NodeType,
        properties: {
          name: match[1],
          description: `User: ${match[1]}`,
        },
      })
    }

    // Project detection
    const projectPattern = /(?:project|repo|repository)\s+(\w+)/gi
    while ((match = projectPattern.exec(text)) !== null) {
      entities.push({
        id: `project:${match[1].toLowerCase()}`,
        type: 'Project' as NodeType,
        properties: {
          name: match[1],
          description: `Project: ${match[1]}`,
        },
      })
    }

    // Environment detection
    const envPattern =
      /(?:(?:to|in|on)\s+)?(production|staging|development|dev|prod|test)\s+environment/gi
    while ((match = envPattern.exec(text)) !== null) {
      entities.push({
        id: `environment:${match[1].toLowerCase()}`,
        type: 'Environment' as NodeType,
        properties: {
          name: match[1].toLowerCase(),
          description: `Environment: ${match[1]}`,
        },
      })
    }

    return entities
  }

  private extractRelationships(
    text: string,
    entities: EntityExtraction[]
  ): RelationshipExtraction[] {
    const relationships: RelationshipExtraction[] = []

    // Create comprehensive entity lookup
    const entityLookup = new Map<string, EntityExtraction>()
    entities.forEach(entity => {
      const name = entity.properties.name?.toLowerCase()
      const key = entity.properties.key?.toLowerCase()

      if (name) {
        entityLookup.set(name, entity)
        // Also add without common suffixes
        const cleanName = name.replace(/\s+(service|api|database|db)$/, '')
        if (cleanName !== name) {
          entityLookup.set(cleanName, entity)
        }
      }
      if (key) {
        entityLookup.set(key, entity)
      }
    })

    // Helper function to find entity by various name variations
    const findEntity = (name: string): EntityExtraction | undefined => {
      const cleanName = name.toLowerCase().trim()
      return (
        entityLookup.get(cleanName) ||
        entityLookup.get(cleanName.replace(/\s+/g, '')) ||
        entityLookup.get(cleanName.replace(/-/g, ''))
      )
    }

    // Pattern: "X requires Y" - handle env vars specially
    const requiresPattern =
      /(\w+(?:-\w+)*)\s+requires?\s+([A-Z_][A-Z0-9_]*|[\w\s-]+?)(?:\s+(?:and|configuration|variable|env)|\.|$)/gi
    let match
    while ((match = requiresPattern.exec(text)) !== null) {
      const fromEntity = findEntity(match[1])
      const toEntity = findEntity(match[2])

      if (fromEntity && toEntity) {
        relationships.push({
          type: 'REQUIRES' as EdgeType,
          from: fromEntity.id,
          to: toEntity.id,
          properties: {
            context: match[0],
            confidence: 0.8,
          },
        })
      }
    }

    // Pattern: "X depends on Y"
    const dependsPattern =
      /(\w+(?:-\w+)*)\s+depends?\s+on\s+(\w+(?:\s+\w+)*?)(?:\s+(?:and|database|service)|\.|$)/gi
    while ((match = dependsPattern.exec(text)) !== null) {
      const fromEntity = findEntity(match[1])
      const toEntity = findEntity(match[2])

      if (fromEntity && toEntity) {
        relationships.push({
          type: 'DEPENDS_ON' as EdgeType,
          from: fromEntity.id,
          to: toEntity.id,
          properties: {
            context: match[0],
            confidence: 0.9,
          },
        })
      }
    }

    // Pattern: "X connects to Y"
    const connectsPattern =
      /(\w+(?:-\w+)*)\s+connects?\s+to\s+(\w+(?:\s+\w+)*?)(?:\s+(?:and|database|service|cache)|\.|$)/gi
    while ((match = connectsPattern.exec(text)) !== null) {
      const fromEntity = findEntity(match[1])
      const toEntity = findEntity(match[2])

      if (fromEntity && toEntity) {
        relationships.push({
          type: 'CONNECTS_TO' as EdgeType,
          from: fromEntity.id,
          to: toEntity.id,
          properties: {
            context: match[0],
            confidence: 0.7,
          },
        })
      }
    }

    // Pattern: "X deployed to Y"
    const deployedPattern =
      /(\w+(?:-\w+)*)\s+(?:deployed\s+to|is\s+deployed\s+to)\s+(\w+(?:\s+\w+)*?)(?:\s+(?:and|environment)|\.|$)/gi
    while ((match = deployedPattern.exec(text)) !== null) {
      const fromEntity = findEntity(match[1])
      const toEntity = findEntity(match[2])

      if (fromEntity && toEntity) {
        relationships.push({
          type: 'DEPLOYED_TO' as EdgeType,
          from: fromEntity.id,
          to: toEntity.id,
          properties: {
            context: match[0],
            confidence: 0.8,
          },
        })
      }
    }

    // Pattern: "X caused by Y" or "X was caused by Y"
    const causedByPattern =
      /(\w+(?:-\w+)*)\s+(?:was\s+)?(?:caused\s+by|due\s+to)\s+(\w+(?:\s+\w+)*?)(?:\s+(?:and|failure|issue)|\.|$)/gi
    while ((match = causedByPattern.exec(text)) !== null) {
      const fromEntity = findEntity(match[1])
      const toEntity = findEntity(match[2])

      if (fromEntity && toEntity) {
        relationships.push({
          type: 'CAUSED_BY' as EdgeType,
          from: fromEntity.id,
          to: toEntity.id,
          properties: {
            context: match[0],
            confidence: 0.8,
          },
        })
      }
    }

    // Pattern: "X manages Y"
    const managesPattern =
      /(\w+(?:-\w+)*)\s+manages?\s+(\w+(?:\s+\w+)*?)(?:\s+(?:and|database|service)|\.|$)/gi
    while ((match = managesPattern.exec(text)) !== null) {
      const fromEntity = findEntity(match[1])
      const toEntity = findEntity(match[2])

      if (fromEntity && toEntity) {
        relationships.push({
          type: 'MANAGES' as EdgeType,
          from: fromEntity.id,
          to: toEntity.id,
          properties: {
            context: match[0],
            confidence: 0.7,
          },
        })
      }
    }

    // Pattern: "X owns Y"
    const ownsPattern =
      /(\w+(?:-\w+)*)\s+owns?\s+(\w+(?:\s+\w+)*?)(?:\s+(?:and|service|api)|\.|$)/gi
    while ((match = ownsPattern.exec(text)) !== null) {
      const fromEntity = findEntity(match[1])
      const toEntity = findEntity(match[2])

      if (fromEntity && toEntity) {
        relationships.push({
          type: 'OWNS' as EdgeType,
          from: fromEntity.id,
          to: toEntity.id,
          properties: {
            context: match[0],
            confidence: 0.8,
          },
        })
      }
    }

    return relationships
  }

  // Advanced entity extraction using patterns and context
  extractEntitiesWithContext(
    text: string,
    context?: {
      domain?: string
      source?: string
      timestamp?: Date
    }
  ): EntityExtraction[] {
    const entities = this.extractEntities(text)

    // Enhance entities with context
    return entities.map(entity => ({
      ...entity,
      properties: {
        ...entity.properties,
        domain: context?.domain,
        extractedAt: context?.timestamp || new Date(),
        sourceContext: context?.source,
      },
    }))
  }

  // Batch processing for multiple texts
  async ingestMultipleTexts(
    texts: Array<{ content: string; source: string; metadata?: any }>,
    options?: { batchSize?: number }
  ): Promise<void> {
    const batchSize = options?.batchSize || 10

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)

      await Promise.all(
        batch.map(({ content, source, metadata }) => this.ingestText(content, source))
      )
    }
  }

  // Get extraction statistics
  getExtractionStats(): {
    totalEntitiesExtracted: number
    totalRelationshipsExtracted: number
    entityTypeDistribution: Record<NodeType, number>
    relationshipTypeDistribution: Record<EdgeType, number>
  } {
    const stats = this.graph.getStats()

    // Get relationship type distribution
    const relationshipTypeDistribution = {} as Record<EdgeType, number>
    // This would need to be tracked during extraction or queried from the graph

    return {
      totalEntitiesExtracted: stats.nodeCount,
      totalRelationshipsExtracted: stats.edgeCount,
      entityTypeDistribution: stats.nodeTypes,
      relationshipTypeDistribution,
    }
  }
}
