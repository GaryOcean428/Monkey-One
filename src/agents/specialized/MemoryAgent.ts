import { BaseAgent } from '../../lib/agents/base/BaseAgent'
import { AgentType } from '../../lib/types/agent'
import type {
  Message,
  AgentConfig,
  AgentCapabilityType,
  MessageResponse,
} from '../../lib/types/agent'
import type { Tool } from '../../tools/registry/Tool'
import type { VectorStore } from '../../memory/vector/VectorStore'
import type { SearchOptions } from '../../memory/vector/VectorStore'

interface MemoryConfig {
  id: string
  vectorStore: VectorStore
}

import type {
  MemoryItem,
  MemorySearchResult,
  MemoryStats,
  MemoryBatchOperation,
  MemoryQueryResult,
  MemoryType,
} from '../../lib/types/memory'
import type { VectorMetadata, SearchResult } from '../../memory/vector/VectorStore'

export class MemoryAgent extends BaseAgent {
  private vectorStore?: VectorStore

  constructor(config: MemoryConfig) {
    const agentConfig: AgentConfig = {
      id: config.id,
      name: 'MemoryAgent',
      type: AgentType.MEMORY,
      capabilities: [],
    }
    super(agentConfig)
    this.vectorStore = config.vectorStore
    this.setupCapabilities()
  }

  private setupCapabilities(): void {
    const capabilities: AgentCapabilityType[] = [
      {
        name: 'memory_store',
        description: 'Stores items in vector memory',
        version: '1.0.0',
        parameters: {
          content: {
            type: 'string',
            description: 'Content to store',
            required: true,
          },
          type: {
            type: 'string',
            description: 'Type of memory item',
            required: true,
          },
          metadata: {
            type: 'object',
            description: 'Additional metadata',
            required: false,
          },
        },
      },
      {
        name: 'memory_search',
        description: 'Searches vector memory',
        version: '1.0.0',
        parameters: {
          query: {
            type: 'string',
            description: 'Search query',
            required: true,
          },
          type: {
            type: 'string',
            description: 'Filter by type',
            required: false,
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results',
            required: false,
          },
        },
      },
      {
        name: 'memory_backup',
        description: 'Creates memory backup',
        version: '1.0.0',
        parameters: {
          format: {
            type: 'string',
            description: 'Backup format (json, binary)',
            required: false,
          },
        },
      },
    ]

    capabilities.forEach(cap => this.addCapability(cap))
  }

  public async handleMessage(message: Message): Promise<{ success: boolean }> {
    try {
      const intent = await this.classifyIntent(message.content)

      switch (intent) {
        case 'store_memory':
          await this.storeMemory(message)
          break
        case 'search_memory':
          await this.searchMemory(message)
          break
        case 'backup_memory':
          await this.backupMemory(message)
          break
        default:
          throw new Error(`Unsupported intent: ${intent}`)
      }

      return { success: true }
    } catch (error) {
      console.error('[MemoryAgent Error]', error)
      throw error
    }
  }

  public async handleRequest(request: unknown): Promise<unknown> {
    if (typeof request === 'string') {
      return this.handleMessage({
        id: Date.now().toString(),
        type: 'text',
        content: request,
        timestamp: Date.now(),
      })
    }
    throw new Error('Invalid request format')
  }

  public async handleToolUse(tool: unknown): Promise<MessageResponse> {
    try {
      const typedTool = tool as Tool
      const metadata = typedTool.getMetadata()

      if (
        metadata.capabilities.some(cap =>
          ['memory_store', 'memory_search', 'memory_backup'].includes(cap)
        )
      ) {
        const result = await typedTool.execute({})
        return { status: 'success', data: result }
      }

      throw new Error('Unsupported tool for memory operations')
    } catch (error) {
      return {
        status: 'error',
        data: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  private async classifyIntent(content: string): Promise<string> {
    if (content.includes('store') || content.includes('remember')) return 'store_memory'
    if (content.includes('search') || content.includes('find') || content.includes('recall'))
      return 'search_memory'
    if (content.includes('backup')) return 'backup_memory'
    return 'unknown'
  }

  private async storeMemory(_message: Message): Promise<MemoryQueryResult<MemoryItem>> {
    try {
      const vector = await this.generateEmbedding(_message.content)
      const item: MemoryItem = {
        id: `mem_${Date.now()}`,
        content: _message.content,
        vector: vector,
        metadata: {
          type: 'text' as MemoryType,
          source: 'user_message',
          timestamp: Date.now(),
          context: _message.metadata?.context as string,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const vectorMetadata: VectorMetadata = {
        id: item.id,
        type: item.metadata.type,
        source: item.metadata.source,
        timestamp: item.metadata.timestamp,
        content: item.content,
        metadata: item.metadata,
      }

      await this.vectorStore?.storeEmbedding(vector, vectorMetadata)

      return {
        success: true,
        data: item,
        metadata: {
          took: Date.now() - item.createdAt,
          total: 1,
          scanned: 1,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          took: 0,
          total: 0,
          scanned: 0,
        },
      }
    }
  }

  private async searchMemory(_message: Message): Promise<MemoryQueryResult<MemorySearchResult[]>> {
    try {
      const queryVector = await this.generateEmbedding(_message.content)
      const searchOptions: SearchOptions = {
        limit: 10,
        minScore: 0.7,
        includeVector: false,
        includeMetadata: true,
      }

      const results = await this.vectorStore?.search(queryVector, searchOptions)
      const searchResults: MemorySearchResult[] = results.map((result: SearchResult) => {
        const item: MemoryItem = {
          id: result.metadata.id,
          content: result.metadata.content as string,
          vector: result.vector || [],
          metadata: {
            type: result.metadata.type as MemoryType,
            source: result.metadata.source,
            timestamp: result.metadata.timestamp,
          },
          createdAt: result.metadata.timestamp,
          updatedAt: result.metadata.timestamp,
        }
        return {
          item,
          score: result.score,
          distance: 1 - result.score,
        }
      })

      return {
        success: true,
        data: searchResults,
        metadata: {
          took: Date.now() - Date.now(),
          total: searchResults.length,
          scanned: results.length,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          took: 0,
          total: 0,
          scanned: 0,
        },
      }
    }
  }

  private async backupMemory(_message: Message): Promise<MemoryQueryResult<{ path: string }>> {
    try {
      const backupPath = `/tmp/memory_backup_${Date.now()}.json.gz`

      // TODO: Implement actual backup logic
      return {
        success: true,
        data: {
          path: backupPath,
        },
        metadata: {
          took: 0,
          total: 0,
          scanned: 0,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          took: 0,
          total: 0,
          scanned: 0,
        },
      }
    }
  }

  private async generateEmbedding(_text: string): Promise<number[]> {
    // TODO: Implement text to vector embedding using model
    return new Array(384).fill(0) // Placeholder 384-dimensional vector
  }

  private async getStats(): Promise<MemoryStats> {
    return {
      totalItems: 0,
      byType: {
        text: 0,
        code: 0,
        image: 0,
        audio: 0,
        embedding: 0,
      },
      averageVectorDimensions: 384,
      totalStorageSize: 0,
      lastUpdated: Date.now(),
      topSources: [],
      topTags: [],
    }
  }

  private async batchOperation(operations: MemoryBatchOperation): Promise<MemoryQueryResult> {
    try {
      // TODO: Implement batch operations
      return {
        success: true,
        metadata: {
          took: 0,
          total: operations.items.length,
          scanned: operations.items.length,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          took: 0,
          total: 0,
          scanned: 0,
        },
      }
    }
  }

  public async handleSearch(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized')
    }
    return this.vectorStore.search(query, options)
  }
}
