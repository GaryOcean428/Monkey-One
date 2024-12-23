import { app, analytics, auth, database } from './config';
import { testFirebaseConnection } from './firebase';
import { firebaseCore } from './core';
import { serviceManager } from './services';

let isInitialized = false;

export async function initializeFirebase() {
  if (isInitialized) {
    console.log('Firebase already initialized');
    return;
  }
  
  try {
    // Initialize core Firebase first
    const app = firebaseCore.getApp();
    console.log('Firebase core initialized successfully');

    // Initialize services
    await serviceManager.initializeServices();
    console.log('Firebase services initialized successfully');

    // Test the connection
    const connectionTest = await testFirebaseConnection();
    if (!connectionTest) {
      throw new Error('Firebase connection test failed');
    }
    console.log('Firebase connection test passed');

    isInitialized = true;
    console.log('Firebase initialization complete');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    isInitialized = false;
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