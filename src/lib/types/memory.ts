export type MemoryType = 'text' | 'code' | 'image' | 'audio' | 'embedding'

export interface MemoryMetadata {
  type: MemoryType
  source: string
  timestamp: number
  context?: string
  tags?: string[]
  confidence?: number
  ttl?: number
  version?: string
  userId?: string
  sessionId?: string
  metadata?: Record<string, unknown>
}

export interface MemoryItem {
  id: string
  content: string
  vector: number[]
  metadata: MemoryMetadata
  createdAt: number
  updatedAt: number
  lastAccessed?: number
  accessCount?: number
}

export interface MemorySearchResult {
  item: MemoryItem
  score: number
  distance: number
}

export interface MemorySearchOptions {
  limit?: number
  offset?: number
  minScore?: number
  maxDistance?: number
  includeVector?: boolean
  includeMetadata?: boolean
  filterBy?: {
    types?: MemoryType[]
    sources?: string[]
    tags?: string[]
    dateRange?: {
      start: number
      end: number
    }
    metadata?: Record<string, unknown>
  }
}

export interface MemoryStats {
  totalItems: number
  byType: Record<MemoryType, number>
  averageVectorDimensions: number
  totalStorageSize: number
  lastUpdated: number
  topSources: Array<{
    source: string
    count: number
  }>
  topTags: Array<{
    tag: string
    count: number
  }>
}

export interface MemoryMaintenanceOptions {
  vacuum?: {
    olderThan?: number
    accessedBefore?: number
    minAccessCount?: number
    types?: MemoryType[]
    sources?: string[]
  }
  reindex?: {
    types?: MemoryType[]
    sources?: string[]
    updatedSince?: number
  }
  backup?: {
    format?: 'json' | 'binary'
    compress?: boolean
    includeVectors?: boolean
    path?: string
  }
}

export interface VectorOperations {
  similarity: (a: number[], b: number[]) => number
  add: (a: number[], b: number[]) => number[]
  subtract: (a: number[], b: number[]) => number[]
  multiply: (vector: number[], scalar: number) => number[]
  normalize: (vector: number[]) => number[]
  magnitude: (vector: number[]) => number
}

export interface MemoryBatchOperation {
  type: 'upsert' | 'delete' | 'update'
  items: Array<{
    id?: string
    content?: string
    vector?: number[]
    metadata?: Partial<MemoryMetadata>
  }>
  options?: {
    ordered?: boolean
    skipErrors?: boolean
  }
}

export interface MemoryQueryResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    took: number
    total: number
    scanned: number
    cached?: boolean
  }
}
