import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { getDatabase, connectDatabaseEmulator, type Database } from 'firebase/database';
import { getRemoteConfig, getValue, fetchAndActivate, type RemoteConfig } from 'firebase/remote-config';
import type { FirebaseConfig } from './types';

// Validate required environment variables without logging their values
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_DATABASE_URL'
] as const;

const missingEnvVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error('Missing required Firebase configuration variables');
}

// Initialize Firebase configuration without logging
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

interface FirebaseServices {
  app: FirebaseApp;
  analytics?: Analytics;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  database: Database;
  remoteConfig: RemoteConfig;
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
  }
};

let services: FirebaseServices;

try {
  console.log('Initializing Firebase services...');
  
  // Initialize Firebase app
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  // Initialize services without logging details
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const database = getDatabase(app);
  
  // Initialize Remote Config with default settings
  const remoteConfig = getRemoteConfig(app);
  remoteConfig.settings = {
    minimumFetchIntervalMillis: import.meta.env.PROD ? 3600000 : 0,
    fetchTimeoutMillis: 60000
  };

  // Set default values without exposing sensitive information
  remoteConfig.defaultConfig = {
    app_version: '1.0.0',
    maintenance_mode: false,
    theme: 'light',
    api_endpoint: import.meta.env.VITE_API_ENDPOINT || 'https://api.default.com'
  };

  // Use emulators in development without logging connection details
  if (import.meta.env.DEV) {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectDatabaseEmulator(database, 'localhost', 9000);
  }

  services = {
    app,
    analytics: null,
    auth,
    db,
    storage,
    database,
    remoteConfig
  };

  // Initialize analytics in production only
  if (import.meta.env.PROD) {
    isSupported().then(yes => {
      if (yes) {
        services.analytics = getAnalytics(app);
      }
    });
  }

  // Fetch remote config values immediately
  fetchAndActivate(remoteConfig)
    .then(() => console.log('Remote config fetched and activated'))
    .catch(error => console.error('Error fetching remote config:', error));

  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed');
  throw error;
}

export const { app, analytics, auth, db, storage, database, remoteConfig } = services;
export { firebaseConfig };
