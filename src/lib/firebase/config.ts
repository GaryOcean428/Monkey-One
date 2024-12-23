import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { getDatabase, connectDatabaseEmulator, type Database } from 'firebase/database';
import type { FirebaseConfig } from './types';

// Debug: Log all environment variables (excluding sensitive values)
console.log('Environment Variables Check:', {
  hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  hasSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
  hasMeasurementId: !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
});

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_DATABASE_URL'
] as const;

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error('Missing required Firebase configuration:', missingEnvVars);
  throw new Error(
    `Missing required Firebase configuration: ${missingEnvVars.join(', ')}`
  );
}

// Firebase configuration with required values
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log non-sensitive config info
console.log('Initializing Firebase with project:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseURL: firebaseConfig.databaseURL,
  storageBucket: firebaseConfig.storageBucket
});

interface FirebaseServices {
  app: FirebaseApp;
  analytics?: Analytics;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  database: Database;
}

const initializeFirebaseService = <T>(
  serviceName: string,
  initFn: () => T,
  required = true
): T | undefined => {
  try {
    console.log(`Initializing Firebase ${serviceName}...`);
    const service = initFn();
    console.log(`Firebase ${serviceName} initialized successfully`);
    return service;
  } catch (error) {
    const logFn = required ? console.error : console.warn;
    logFn(`Failed to initialize Firebase ${serviceName}:`, error);
    if (required) {
    return undefined;
  }
};

let services: FirebaseServices;

try {
  console.log('Starting Firebase initialization...');
  
  // Initialize Firebase app
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  // Initialize Analytics conditionally
  let analytics: Analytics | null = null;
  if (import.meta.env.PROD) {
    isSupported().then(yes => yes && (analytics = getAnalytics(app)));
  }

  // Initialize other services
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const database = getDatabase(app);

  // Use emulators in development
  if (import.meta.env.DEV) {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectDatabaseEmulator(database, 'localhost', 9000);
  }

  services = {
    app,
    analytics,
    auth,
    db,
    storage,
    database
  };

  console.log('All Firebase services initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  if (error instanceof Error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
  throw error;
}

export const { app, analytics, auth, db, storage, database } = services;
export { firebaseConfig };
