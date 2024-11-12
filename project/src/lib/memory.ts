import type { MemoryItem } from '../types';
import { config } from './config';
import { XAIClient } from './xai';

class MemoryManager {
  private items: MemoryItem[] = [];
  private embeddings: Map<string, number[]> = new Map();
  private xai: XAIClient;

  constructor() {
    this.xai = new XAIClient(config.xai.apiKey);
  }

  async add(item: Omit<MemoryItem, 'id' | 'timestamp'>): Promise<void> {
    const memoryItem: MemoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    // Generate embedding for the content
    const [embedding] = await this.xai.createEmbeddings(item.content);
    this.embeddings.set(memoryItem.id, embedding);

    this.items.push(memoryItem);
    this.cleanup();
  }

  getRecent(count: number): MemoryItem[] {
    return [...this.items]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  async search(query: string): Promise<MemoryItem[]> {
    // Get embedding for the query
    const [queryEmbedding] = await this.xai.createEmbeddings(query);
    
    // Calculate cosine similarity with all stored embeddings
    const similarities = this.items.map(item => ({
      item,
      similarity: this.cosineSimilarity(
        queryEmbedding,
        this.embeddings.get(item.id) || []
      )
    }));

    // Sort by similarity and return top results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(({ item }) => item);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private cleanup(): void {
    const cutoff = Date.now() - (config.memory.retentionDays * 24 * 60 * 60 * 1000);
    const removed = new Set<string>();

    this.items = this.items
      .filter(item => {
        const keep = item.timestamp > cutoff;
        if (!keep) {
          removed.add(item.id);
        }
        return keep;
      })
      .slice(-config.memory.maxSize);

    // Clean up embeddings for removed items
    removed.forEach(id => this.embeddings.delete(id));
  }
}

export const memoryManager = new MemoryManager();