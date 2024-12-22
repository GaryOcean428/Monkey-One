import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Check if we're in demo mode
export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

// Brain-specific database references
const brainRefs = {
  neuralCore: ref(database, 'brain/neuralCore'),
  personalityCore: ref(database, 'brain/personalityCore'),
  memories: ref(database, 'brain/memories'),
  learningProgress: ref(database, 'brain/learningProgress'),
  interactions: ref(database, 'brain/interactions'),
  evolution: ref(database, 'brain/evolution')
};

// Test Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snap) => {
      const isConnected = snap.val() === true;
      console.log(isConnected ? "Connected to Firebase" : "Not connected to Firebase");
      resolve(isConnected);
    });
  });
}

// Brain-specific database operations
export const brainDB = {
  // Neural Core Operations
  async saveNeuralState(state: any) {
    await set(brainRefs.neuralCore, state);
  },

  async updateLearningProgress(progress: any) {
    await push(brainRefs.learningProgress, {
      ...progress,
      timestamp: Date.now()
    });
  },

  // Personality Core Operations
  async savePersonalityState(state: any) {
    await set(brainRefs.personalityCore, state);
  },

  async recordInteraction(interaction: any) {
    await push(brainRefs.interactions, {
      ...interaction,
      timestamp: Date.now()
    });
  },

  // Memory Operations
  async storeMemory(memory: any) {
    await push(brainRefs.memories, {
      ...memory,
      timestamp: Date.now()
    });
  },

  // Evolution Tracking
  async recordEvolution(evolution: any) {
    await push(brainRefs.evolution, {
      ...evolution,
      timestamp: Date.now()
    });
  },

  // Realtime Subscriptions
  onNeuralStateChange(callback: (state: any) => void) {
    return onValue(brainRefs.neuralCore, (snapshot) => {
      callback(snapshot.val());
    });
  },

  onPersonalityStateChange(callback: (state: any) => void) {
    return onValue(brainRefs.personalityCore, (snapshot) => {
      callback(snapshot.val());
    });
  }
};

export { app, analytics, auth, database, storage };