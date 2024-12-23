import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

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
  console.error('Missing required Firebase configuration:', missingEnvVars.join(', '));
  throw new Error(
    `Missing required Firebase configuration: ${missingEnvVars.join(', ')}`
  );
}

// Firebase configuration with required values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: '***' // Hide sensitive data
});

let app;
let analytics;
let auth;
let db;
let storage;
let database;

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');

  // Initialize services
  try {
    analytics = typeof window !== 'undefined' && import.meta.env.PROD ? getAnalytics(app) : undefined;
    console.log('Firebase Analytics initialized:', !!analytics);
  } catch (error) {
    console.warn('Failed to initialize Firebase Analytics:', error);
  }

  try {
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Auth:', error);
    throw error;
  }

  try {
    db = getFirestore(app);
    console.log('Firebase Firestore initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    throw error;
  }

  try {
    storage = getStorage(app);
    console.log('Firebase Storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Storage:', error);
    throw error;
  }

  try {
    database = getDatabase(app);
    console.log('Firebase Realtime Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Realtime Database:', error);
    throw error;
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

// Export initialized services and config
export { app, analytics, auth, db, storage, database, firebaseConfig };
