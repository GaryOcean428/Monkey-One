import { getDatabase, ref, set, get, query, orderByChild, limitToLast, DatabaseReference } from 'firebase/database';
import { firebaseCore } from './core';
import { firebasePerformance } from './FirebasePerformance';
import { monitoring } from '../monitoring/MonitoringSystem';
import type { FirebaseCollections } from './schema';

export class BrainStorage {
  private readonly database: DatabaseReference;
  private readonly brainRefs: Record<string, DatabaseReference>;
  private readonly cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly BATCH_SIZE = 50;

  constructor() {
    this.database = getDatabase(firebaseCore.getApp());
    this.brainRefs = {
      neuralCore: ref(this.database, 'brain/neuralCore'),
      personalityCore: ref(this.database, 'brain/personalityCore'),
      memories: ref(this.database, 'brain/memories'),
      learningProgress: ref(this.database, 'brain/learningProgress'),
      interactions: ref(this.database, 'brain/interactions'),
      evolution: ref(this.database, 'brain/evolution')
    };

    // Start cache cleanup
    setInterval(() => this.cleanupCache(), 60000);
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  private getCacheKey(path: string, params?: any): string {
    return `${path}:${JSON.stringify(params)}`;
  }

  async saveNeuralState(state: FirebaseCollections['brainState']['neuralState']) {
    return firebasePerformance.trackOperation('save_neural_state', async () => {
      await set(this.brainRefs.neuralCore, {
        ...state,
        timestamp: Date.now()
      });
    });
  }

  async savePersonalityState(state: FirebaseCollections['brainState']['emotionalState']) {
    return firebasePerformance.trackOperation('save_personality_state', async () => {
      await set(this.brainRefs.personalityCore, {
        ...state,
        timestamp: Date.now()
      });
    });
  }

  async saveMemory(memory: any) {
    return firebasePerformance.trackOperation('save_memory', async () => {
      const memoryRef = ref(this.database, `brain/memories/${crypto.randomUUID()}`);
      await set(memoryRef, {
        ...memory,
        timestamp: Date.now()
      });
    });
  }

  async saveMemoryBatch(memories: any[]) {
    return firebasePerformance.trackOperation('save_memory_batch', async () => {
      for (let i = 0; i < memories.length; i += this.BATCH_SIZE) {
        const batch = memories.slice(i, i + this.BATCH_SIZE);
        const updates: Record<string, any> = {};
        
        for (const memory of batch) {
          const id = crypto.randomUUID();
          updates[`brain/memories/${id}`] = {
            ...memory,
            timestamp: Date.now()
          };
        }

        await set(ref(this.database), updates);
      }
    });
  }

  async getRecentMemories(limit: number = 100) {
    const cacheKey = this.getCacheKey('recent_memories', { limit });
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      monitoring.recordMetric('firebase_cache_hit', 1);
      return cached.data;
    }

    return firebasePerformance.trackOperation('get_recent_memories', async () => {
      const memoriesQuery = query(
        this.brainRefs.memories,
        orderByChild('timestamp'),
        limitToLast(limit)
      );

      const snapshot = await get(memoriesQuery);
      const memories = snapshot.val() || {};

      this.cache.set(cacheKey, {
        data: memories,
        timestamp: Date.now()
      });

      monitoring.recordMetric('firebase_cache_hit', 0);
      return memories;
    });
  }

  async updateLearningProgress(progress: any) {
    return firebasePerformance.trackOperation('update_learning_progress', async () => {
      const currentProgress = (await get(this.brainRefs.learningProgress)).val() || {};
      
      await set(this.brainRefs.learningProgress, {
        ...currentProgress,
        ...progress,
        lastUpdated: Date.now()
      });

      // Invalidate related caches
      for (const key of this.cache.keys()) {
        if (key.startsWith('learning_progress')) {
          this.cache.delete(key);
        }
      }
    });
  }

  async getLearningProgress() {
    const cacheKey = this.getCacheKey('learning_progress');
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      monitoring.recordMetric('firebase_cache_hit', 1);
      return cached.data;
    }

    return firebasePerformance.trackOperation('get_learning_progress', async () => {
      const snapshot = await get(this.brainRefs.learningProgress);
      const progress = snapshot.val() || {};

      this.cache.set(cacheKey, {
        data: progress,
        timestamp: Date.now()
      });

      monitoring.recordMetric('firebase_cache_hit', 0);
      return progress;
    });
  }

  async recordInteraction(interaction: Record<string, unknown>) {
    try {
      await push(this.brainRefs.interactions, {
        ...interaction,
        timestamp: Date.now()  
      });
    } catch (error) {
      console.error('Failed to record interaction:', error);
      throw error;
    }
  }

  async recordEvolution(evolution: Record<string, unknown>) {
    try {
      await push(this.brainRefs.evolution, {
        ...evolution,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to record evolution:', error);
      throw error;
    }
  }

  async cleanupOldData(cutoffDate: number) {
    return firebasePerformance.trackOperation('cleanup_old_data', async () => {
      const updates: Record<string, null> = {};

      // Find old memories
      const memoriesSnapshot = await get(this.brainRefs.memories);
      const memories = memoriesSnapshot.val() || {};

      for (const [id, memory] of Object.entries<any>(memories)) {
        if (memory.timestamp < cutoffDate) {
          updates[`brain/memories/${id}`] = null;
        }
      }

      // Find old interactions
      const interactionsSnapshot = await get(this.brainRefs.interactions);
      const interactions = interactionsSnapshot.val() || {};

      for (const [id, interaction] of Object.entries<any>(interactions)) {
        if (interaction.timestamp < cutoffDate) {
          updates[`brain/interactions/${id}`] = null;
        }
      }

      // Batch delete old data
      if (Object.keys(updates).length > 0) {
        await set(ref(this.database), updates);
      }

      // Clear entire cache after cleanup
      this.cache.clear();
    });
  }

  onNeuralStateChange(callback: (state: FirebaseCollections['brainState']['neuralState']) => void) {
    return onValue(this.brainRefs.neuralCore, (snapshot) => {
      callback(snapshot.val());
    });
  }

  onPersonalityStateChange(callback: (state: FirebaseCollections['brainState']['emotionalState']) => void) {
    return onValue(this.brainRefs.personalityCore, (snapshot) => {
      callback(snapshot.val());
    });
  }
}

export const brainStorage = new BrainStorage();