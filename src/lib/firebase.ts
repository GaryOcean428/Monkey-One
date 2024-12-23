import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Optional configuration
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
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
    // Validate required config
    if (!firebaseConfig.apiKey) {
      throw new Error('Firebase API Key is required but not provided');
    }
    if (!firebaseConfig.projectId) {
      throw new Error('Firebase Project ID is required but not provided');
    }

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Only initialize these services if we're not in demo mode
    if (!isDemo) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn('Analytics initialization failed:', e);
      }
      
      try {
        auth = getAuth(app);
      } catch (e) {
        console.warn('Auth initialization failed:', e);
      }
      
      try {
        database = getDatabase(app);
      } catch (e) {
        console.warn('Database initialization failed:', e);
      }
      
      try {
        storage = getStorage(app);
      } catch (e) {
        console.warn('Storage initialization failed:', e);
      }
    }
    
    // Test connection
    const isConnected = await testFirebaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Firebase');
    }

    console.log('Firebase initialized successfully');
    return app;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
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