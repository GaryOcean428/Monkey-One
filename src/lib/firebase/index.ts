import { app, analytics, auth, database } from './config';
import { testFirebaseConnection } from './firebase';

// Re-export Firebase services and utilities
export {
  app,
  analytics,
  auth,
  database,
  testFirebaseConnection
};