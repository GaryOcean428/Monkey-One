import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getDatabase, type Database } from 'firebase/database';
import type { FirebaseConfig } from './types';

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
    const service = initFn();
    console.log(`Firebase ${serviceName} initialized successfully`);
    return service;
  } catch (error) {
    const logFn = required ? console.error : console.warn;
    logFn(`Failed to initialize Firebase ${serviceName}:`, error);
    if (required) throw error;
    return undefined;
  }
};

let services: FirebaseServices;

try {
  // Initialize Firebase app
  const app = initializeApp(firebaseConfig);

  // Initialize services
  services = {
    app,
    analytics: initializeFirebaseService('Analytics', 
      () => typeof window !== 'undefined' && import.meta.env.PROD ? getAnalytics(app) : undefined,
      false
    ),
    auth: initializeFirebaseService('Auth', 
      () => getAuth(app)
    ) as Auth,
    db: initializeFirebaseService('Firestore', 
      () => getFirestore(app)
    ) as Firestore,
    storage: initializeFirebaseService('Storage', 
      () => getStorage(app)
    ) as FirebaseStorage,
    database: initializeFirebaseService('Realtime Database', 
      () => getDatabase(app)
    ) as Database
  };
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

export const { app, analytics, auth, db, storage, database } = services;
export { firebaseConfig };
