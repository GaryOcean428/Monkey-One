import { LLMProvider } from '../llm/providers'

interface Document {
  id: string
  content: string
  metadata?: Record<string, unknown>
  embedding?: number[]
  similarity?: number
}

export class VectorStore {
  private documents: Map<string, Document> = new Map()
  private provider: LLMProvider
  private readonly BATCH_SIZE = 50
  private readonly SIMILARITY_THRESHOLD = 0.7
  private embeddingCache: Map<string, number[]> = new Map()
  private readonly MAX_CACHE_SIZE = 1000

  constructor(provider: LLMProvider) {
    this.provider = provider
  }

  async addDocument(content: string, metadata?: Record<string, unknown>): Promise<string> {
    if (!this.provider.generateEmbedding) {
      throw new Error('Provider does not support embeddings')
    }

    const id = crypto.randomUUID()
    let embedding: number[]

    // Check cache first
    const cachedEmbedding = this.embeddingCache.get(content)
    if (cachedEmbedding) {
      embedding = cachedEmbedding
    } else {
      embedding = await this.generateEmbedding(content)
    }

    this.documents.set(id, {
      id,
      content,
      metadata,
      embedding,
    })

    return id
  }

  async addDocuments(
    documents: { content: string; metadata?: Record<string, unknown> }[]
  ): Promise<string[]> {
    const ids: string[] = []

    // Process in batches
    for (let i = 0; i < documents.length; i += this.BATCH_SIZE) {
      const batch = documents.slice(i, i + this.BATCH_SIZE)
      const batchPromises = batch.map(doc => this.addDocument(doc.content, doc.metadata))
      const batchIds = await Promise.all(batchPromises)
      ids.push(...batchIds)
    }

    return ids
  }

  async search(query: string, limit: number = 5): Promise<Document[]> {
    if (!this.provider.generateEmbedding) {
      throw new Error('Provider does not support embeddings')
    }

    const queryEmbedding = await this.generateEmbedding(query)

    // Use array for better performance in sorting
    const documents = Array.from(this.documents.values())
    const results = documents
      .map(doc => ({
        ...doc,
        similarity: this.cosineSimilarity(queryEmbedding, doc.embedding || []),
      }))
      .filter(doc => doc.similarity !== undefined && doc.similarity >= this.SIMILARITY_THRESHOLD)
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit)

    return results
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
  }

  private updateEmbeddingCache(content: string, embedding: number[]): void {
    if (this.embeddingCache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries (FIFO)
      const entries = Array.from(this.embeddingCache.entries())
      if (entries.length > 0) {
        const [oldestKey] = entries[0]
        this.embeddingCache.delete(oldestKey)
      }
    }
    this.embeddingCache.set(content, embedding)
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.provider.generateEmbedding) {
      console.warn('Embedding generation not supported by the provider.')
      return []
    }

    const cachedEmbedding = this.embeddingCache.get(text)
    if (cachedEmbedding) {
      return cachedEmbedding
    }

    try {
      const embedding = await this.provider.generateEmbedding(text)
      if (embedding && embedding.length > 0) {
        this.updateEmbeddingCache(text, embedding)
        return embedding
      } else {
        console.warn('Received empty embedding.')
        return []
      }
    } catch (error) {
      console.error('Error generating embedding:', error)
      return []
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id)
  }

  async clear(): Promise<void> {
    this.documents.clear()
    this.embeddingCache.clear()
  }

  getDocuments(): Document[] {
    return Array.from(this.documents.values())
  }

  getCacheSize(): number {
    return this.embeddingCache.size
  }

  getDocument(id: string): Document | undefined {
    return this.documents.get(id)
  }
}
