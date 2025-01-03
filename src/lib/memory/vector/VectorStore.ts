export interface VectorMetadata {
  id: string
  type: string
  source: string
  timestamp: number
  [key: string]: unknown
}

export interface SearchOptions {
  limit?: number
  minScore?: number
  includeVector?: boolean
  includeMetadata?: boolean
  filterBy?: Record<string, unknown>
}

export interface SearchResult {
  metadata: VectorMetadata
  vector?: number[]
  score: number
}

export interface VectorStore {
  storeEmbedding(vector: number[], metadata: VectorMetadata): Promise<void>
  search(queryVector: number[], options?: SearchOptions): Promise<SearchResult[]>
  delete(id: string): Promise<void>
  update(id: string, metadata: Partial<VectorMetadata>): Promise<void>
  getById(id: string): Promise<VectorMetadata | null>
  clear(): Promise<void>
}
