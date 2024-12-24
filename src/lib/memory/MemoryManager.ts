import { EventEmitter } from 'events';
import { ModelClient } from '../clients/ModelClient';
import { logger } from '../../utils/logger';

export interface MemoryItem {
  id: string;
  type: string;
  content: string;
  tags: string[];
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MemoryHierarchy {
  shortTerm: {
    capacity: number;
    ttl: number;
    priority: number;
    items: Map<string, MemoryItem>;
  };
  workingMemory: {
    context: Map<string, any>;
    activeGoals: string[];
    currentFocus: string;
    items: Map<string, MemoryItem>;
  };
  longTerm: {
    episodic: Map<string, MemoryItem>;
    semantic: Map<string, MemoryItem>;
    procedural: Map<string, MemoryItem>;
  };
}

export class MemoryManager extends EventEmitter {
  private static instance: MemoryManager;
  private hierarchy: MemoryHierarchy;
  private modelClient: ModelClient;

  private constructor() {
    super();
    this.modelClient = new ModelClient();
    this.hierarchy = {
      shortTerm: {
        capacity: 100,
        ttl: 300000, // 5 minutes
        priority: 1,
        items: new Map()
      },
      workingMemory: {
        context: new Map(),
        activeGoals: [],
        currentFocus: '',
        items: new Map()
      },
      longTerm: {
        episodic: new Map(),
        semantic: new Map(),
        procedural: new Map()
      }
    };
    this.initializeEventListeners();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private initializeEventListeners(): void {
    this.on('memoryAdded', this.handleMemoryAddition.bind(this));
    this.on('memoryAccessed', this.updateMemoryPriority.bind(this));
    this.on('memoryPruned', this.consolidateMemory.bind(this));
  }

  async add(item: Omit<MemoryItem, 'id' | 'timestamp'>): Promise<string> {
    const memoryItem: MemoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    // Analyze memory content to determine placement
    const analysis = await this.modelClient.complete(
      `Analyze memory content and determine placement:\n${item.content}`,
      'o1'
    );
    const placement = JSON.parse(analysis).placement;

    switch (placement) {
      case 'shortTerm':
        this.hierarchy.shortTerm.items.set(memoryItem.id, memoryItem);
        break;
      case 'workingMemory':
        this.hierarchy.workingMemory.items.set(memoryItem.id, memoryItem);
        break;
      case 'episodic':
        this.hierarchy.longTerm.episodic.set(memoryItem.id, memoryItem);
        break;
      case 'semantic':
        this.hierarchy.longTerm.semantic.set(memoryItem.id, memoryItem);
        break;
      case 'procedural':
        this.hierarchy.longTerm.procedural.set(memoryItem.id, memoryItem);
        break;
      default:
        this.hierarchy.shortTerm.items.set(memoryItem.id, memoryItem);
    }

    this.emit('memoryAdded', memoryItem);
    return memoryItem.id;
  }

  async retrieve(query: string, context?: string[]): Promise<MemoryItem[]> {
    const searchContext = context ? context.join(' ') : '';
    const searchPrompt = `Search memory with query: ${query}\nContext: ${searchContext}`;

    try {
      // Use embeddings to find relevant memories
      const results = await this.modelClient.embed(searchPrompt);
      const relevantMemories: MemoryItem[] = [];

      // Search through all memory stores
      for (const [id, memory] of [
        ...this.hierarchy.shortTerm.items,
        ...this.hierarchy.workingMemory.items,
        ...this.hierarchy.longTerm.episodic,
        ...this.hierarchy.longTerm.semantic,
        ...this.hierarchy.longTerm.procedural
      ]) {
        const memoryEmbedding = await this.modelClient.embed(memory.content);
        const similarity = this.calculateCosineSimilarity(results, memoryEmbedding);

        if (similarity > 0.8) {
          relevantMemories.push(memory);
          this.emit('memoryAccessed', memory);
        }
      }

      return relevantMemories;
    } catch (error) {
      logger.error('Error retrieving memories:', error);
      return [];
    }
  }

  private calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    const dotProduct = embedding1.reduce((sum, value, i) => sum + value * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, value) => sum + value * value, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, value) => sum + value * value, 0));
    return dotProduct / (magnitude1 * magnitude2);
  }

  private async handleMemoryAddition(memory: MemoryItem): Promise<void> {
    // Check short-term memory capacity
    if (this.hierarchy.shortTerm.items.size > this.hierarchy.shortTerm.capacity) {
      await this.pruneShortTermMemory();
    }

    // Update working memory context
    if (memory.tags.includes('context')) {
      this.hierarchy.workingMemory.context.set(memory.id, memory);
    }

    // Update active goals if relevant
    if (memory.tags.includes('goal')) {
      this.hierarchy.workingMemory.activeGoals.push(memory.id);
    }
  }

  private async pruneShortTermMemory(): Promise<void> {
    const now = Date.now();
    const itemsToRemove: string[] = [];

    for (const [id, memory] of this.hierarchy.shortTerm.items) {
      const age = now - memory.timestamp.getTime();
      if (age > this.hierarchy.shortTerm.ttl) {
        itemsToRemove.push(id);
      }
    }

    for (const id of itemsToRemove) {
      const memory = this.hierarchy.shortTerm.items.get(id);
      if (memory) {
        this.hierarchy.shortTerm.items.delete(id);
        this.emit('memoryPruned', memory);
      }
    }
  }

  private async consolidateMemory(memory: MemoryItem): Promise<void> {
    try {
      // Analyze memory for long-term storage
      const analysis = await this.modelClient.complete(
        `Analyze memory for long-term storage:\n${memory.content}`,
        'o1'
      );
      const storageType = JSON.parse(analysis).storageType;

      switch (storageType) {
        case 'episodic':
          this.hierarchy.longTerm.episodic.set(memory.id, memory);
          break;
        case 'semantic':
          this.hierarchy.longTerm.semantic.set(memory.id, memory);
          break;
        case 'procedural':
          this.hierarchy.longTerm.procedural.set(memory.id, memory);
          break;
      }
    } catch (error) {
      logger.error('Error consolidating memory:', error);
    }
  }

  private async updateMemoryPriority(memory: MemoryItem): Promise<void> {
    // Update access patterns and adjust memory placement based on frequency of access
    const metadata = memory.metadata || {};
    metadata.accessCount = (metadata.accessCount || 0) + 1;
    metadata.lastAccessed = new Date();

    if (metadata.accessCount > 5) {
      // Move frequently accessed memories to working memory
      this.hierarchy.workingMemory.items.set(memory.id, {
        ...memory,
        metadata
      });
    }
  }

  async getContext(): Promise<Map<string, any>> {
    return this.hierarchy.workingMemory.context;
  }

  async getActiveGoals(): Promise<string[]> {
    return this.hierarchy.workingMemory.activeGoals;
  }

  async getCurrentFocus(): Promise<string> {
    return this.hierarchy.workingMemory.currentFocus;
  }
}
