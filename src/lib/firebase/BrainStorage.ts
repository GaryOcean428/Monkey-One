import { getDatabase, ref, set, get, push, onValue } from 'firebase/database';
import { database } from './firebase';
import type { FirebaseCollections } from './schema';

export class BrainStorage {
  private readonly brainRefs = {
    neuralCore: ref(database, 'brain/neuralCore'),
    personalityCore: ref(database, 'brain/personalityCore'),
    memories: ref(database, 'brain/memories'),
    learningProgress: ref(database, 'brain/learningProgress'),
    interactions: ref(database, 'brain/interactions'),
    evolution: ref(database, 'brain/evolution')
  };

  async saveNeuralState(state: FirebaseCollections['brainState']['neuralState']) {
    await set(this.brainRefs.neuralCore, state);
  }

  async savePersonalityState(state: FirebaseCollections['brainState']['emotionalState']) {
    await set(this.brainRefs.personalityCore, state);
  }

  async storeMemory(memory: Omit<FirebaseCollections['memories'], 'id'>) {
    await push(this.brainRefs.memories, {
      ...memory,
      timestamp: Date.now()
    });
  }

  async updateLearningProgress(progress: Record<string, unknown>) {
    await push(this.brainRefs.learningProgress, {
      ...progress,
      timestamp: Date.now()
    });
  }

  async recordInteraction(interaction: Record<string, unknown>) {
    await push(this.brainRefs.interactions, {
      ...interaction,
      timestamp: Date.now()
    });
  }

  async recordEvolution(evolution: Record<string, unknown>) {
    await push(this.brainRefs.evolution, {
      ...evolution,
      timestamp: Date.now()
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