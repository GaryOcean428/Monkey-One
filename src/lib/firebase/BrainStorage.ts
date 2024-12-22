import { getDatabase, ref, set, push, onValue, DatabaseReference } from 'firebase/database';
import { firebaseCore } from './core';
import type { FirebaseCollections } from './types';

export class BrainStorage {
  private readonly database: DatabaseReference;
  private readonly brainRefs: Record<string, DatabaseReference>;

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
  }

  private async safeWrite(ref: DatabaseReference, data: unknown, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await set(ref, data);
        return;
      } catch (error) {
        console.error(`Firebase write attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  async saveNeuralState(state: FirebaseCollections['brainState']['neuralState']) {
    await this.safeWrite(this.brainRefs.neuralCore, state);
  }

  async savePersonalityState(state: FirebaseCollections['brainState']['emotionalState']) {
    await this.safeWrite(this.brainRefs.personalityCore, state);
  }

  async storeMemory(memory: Omit<FirebaseCollections['memories'], 'id'>) {
    try {
      const result = await push(this.brainRefs.memories, {
        ...memory,
        timestamp: Date.now()
      });
      return result.key;
    } catch (error) {
      console.error('Failed to store memory:', error);
      throw error;
    }
  }

  async updateLearningProgress(progress: Record<string, unknown>) {
    try {
      await push(this.brainRefs.learningProgress, {
        ...progress, 
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to update learning progress:', error);
      throw error;
    }
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