import { config } from '../config';
import { VectorStore } from './VectorStore';
import { llmManager } from '../llm/providers';

interface MemoryItem {
  type: string;
  content: string;
  tags: string[];
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

interface MemoryMetrics {
  totalItems: number;
  averageAge: number;
  typeDistribution: Record<string, number>;
  storageUsage: number;
}

class MemoryManager {
  private items: Map<string, MemoryItem> = new Map();
  private vectorStore: VectorStore;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private cleanupTimer: NodeJS.Timeout;
  private metrics: MemoryMetrics;

  constructor() {
    this.vectorStore = new VectorStore(llmManager.getActiveProvider());
    this.metrics = {
      totalItems: 0,
      averageAge: 0,
      typeDistribution: {},
      storageUsage: 0
    };
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  async add(item: MemoryItem): Promise<void> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    const memoryItem = {
      ...item,
      timestamp
    };

    this.items.set(id, memoryItem);

    // Add to vector store for semantic search if applicable
    if (item.type === 'document' || item.type === 'conversation') {
      await this.vectorStore.addDocument(item.content, {
        type: item.type,
        tags: item.tags,
        timestamp,
        ...item.metadata
      });
    }

    this.cleanup();
    this.updateMetrics();
  }

  private cleanup(): void {
    const maxSize = config.memory.maxSize;
    const cutoff = Date.now() - (config.memory.retentionDays * 24 * 60 * 60 * 1000);
    
    // Convert to array for better performance in filtering/sorting
    const items = Array.from(this.items.entries());
    
    // Remove old items
    const validItems = items.filter(([, item]) => 
      (item.timestamp || 0) > cutoff
    );

    // Keep only most recent if over size limit
    if (validItems.length > maxSize) {
      validItems.sort(([, a], [, b]) => 
        (b.timestamp || 0) - (a.timestamp || 0)
      );
      validItems.splice(maxSize);
    }

    // Update map with remaining items
    this.items = new Map(validItems);
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const items = Array.from(this.items.values());
    const now = Date.now();

    // Calculate metrics
    this.metrics = {
      totalItems: items.length,
      averageAge: items.length > 0 
        ? items.reduce((sum, item) => sum + (now - (item.timestamp || 0)), 0) / items.length 
        : 0,
      typeDistribution: items.reduce((dist, item) => {
        dist[item.type] = (dist[item.type] || 0) + 1;
        return dist;
      }, {} as Record<string, number>),
      storageUsage: items.reduce((size, item) => 
        size + new TextEncoder().encode(JSON.stringify(item)).length, 0
      )
    };
  }

  async search(query: string, options?: {
    type?: string;
    tags?: string[];
    limit?: number;
    useSemanticSearch?: boolean;
  }): Promise<MemoryItem[]> {
    if (options?.useSemanticSearch) {
      const results = await this.vectorStore.search(query, options.limit);
      return results.map(doc => ({
        type: doc.metadata?.type as string || 'document',
        content: doc.content,
        tags: doc.metadata?.tags as string[] || [],
        timestamp: doc.metadata?.timestamp as number,
        metadata: doc.metadata
      }));
    }

    let results = Array.from(this.items.values());

    if (options?.type) {
      results = results.filter(item => item.type === options.type);
    }

    if (options?.tags?.length) {
      results = results.filter(item => 
        options.tags!.some(tag => item.tags.includes(tag))
      );
    }

    results = results.filter(item =>
      item.content.toLowerCase().includes(query.toLowerCase())
    );

    results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    return results.slice(0, options?.limit || results.length);
  }

  getRecent(count: number, type?: string): MemoryItem[] {
    let items = Array.from(this.items.values());
    
    if (type) {
      items = items.filter(item => item.type === type);
    }

    return items
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, count);
  }

  async clear(): Promise<void> {
    this.items.clear();
    await this.vectorStore.clear();
    this.updateMetrics();
  }

  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  getSize(): number {
    return this.items.size;
  }

  getMetrics(): MemoryMetrics {
    return { ...this.metrics };
  }
}

export const memoryManager = new MemoryManager();
