import { app, analytics, auth, database } from './config';
import { testFirebaseConnection } from './firebase';
import { firebaseCore } from './core';
import { serviceManager } from './services';

let isInitialized = false;

export async function initializeFirebase() {
  if (isInitialized) {
  
  try {
    await serviceManager.initializeServices();
    isInitialized = true;
    console.log('Firebase services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

export function getFirebaseServices() {
  if (!isInitialized) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first');
  }
  return serviceManager.getServices();
}

// Re-export Firebase services and utilities
export {
  app,
  analytics,
  auth,
  database,
  testFirebaseConnection,
  firebaseCore,
  serviceManager
};