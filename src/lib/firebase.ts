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

let app: ReturnType<typeof initializeApp>;
let analytics: ReturnType<typeof getAnalytics>;
let auth: ReturnType<typeof getAuth>;
let database: ReturnType<typeof getDatabase>;
let storage: ReturnType<typeof getStorage>;

// Check if we're in demo mode
export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

export async function initializeFirebase() {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    database = getDatabase(app);
    storage = getStorage(app);

    // Test connection
    const isConnected = await testFirebaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Firebase');
    }

    console.log('Firebase initialized successfully');
    return { app, analytics, auth, database, storage };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

// Brain-specific database references
const brainRefs = {
  neuralCore: () => ref(database, 'brain/neuralCore'),
  personalityCore: () => ref(database, 'brain/personalityCore'),
  memories: () => ref(database, 'brain/memories'),
  learningProgress: () => ref(database, 'brain/learningProgress'),
  interactions: () => ref(database, 'brain/interactions'),
  evolution: () => ref(database, 'brain/evolution')
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
export const firebaseOperations = {
  // Neural Core Operations
  saveNeuralState: async (state: any) => {
    await set(brainRefs.neuralCore(), state);
  },

  // Learning Progress
  updateLearningProgress: async (progress: any) => {
    await set(brainRefs.learningProgress(), {
      ...progress,
      timestamp: Date.now()
    });
  },

  // Personality Core Operations
  savePersonalityState: async (state: any) => {
    await set(brainRefs.personalityCore(), state);
  },

  // Interaction Recording
  recordInteraction: async (interaction: any) => {
    await push(brainRefs.interactions(), {
      ...interaction,
      timestamp: Date.now()
    });
  },

  // Memory Operations
  storeMemory: async (memory: any) => {
    const newMemoryRef = push(brainRefs.memories());
    await set(newMemoryRef, {
      ...memory,
      timestamp: Date.now()
    });
  },

  // Evolution Tracking
  recordEvolution: async (evolution: any) => {
    const evolutionRef = push(brainRefs.evolution());
    await set(evolutionRef, {
      ...evolution,
      timestamp: Date.now()
    });
  },

  // Realtime Subscriptions
  onNeuralStateChange: (callback: (state: any) => void) => {
    onValue(brainRefs.neuralCore(), (snapshot) => {
      callback(snapshot.val());
    });
  },

  onPersonalityStateChange: (callback: (state: any) => void) => {
    onValue(brainRefs.personalityCore(), (snapshot) => {
      callback(snapshot.val());
    });
  }
};

export { app, analytics, auth, database, storage };