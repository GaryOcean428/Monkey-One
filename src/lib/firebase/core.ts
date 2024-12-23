import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { validateConfig } from './validation';
import type { FirebaseConfig } from './types';

class FirebaseCore {
  private app: FirebaseApp | null = null;
  private config: FirebaseConfig | null = null;

  constructor() {
    try {
      const validatedConfig = validateConfig(import.meta.env);
      if (!validatedConfig) {
        throw new Error('Invalid Firebase configuration');
      }
      this.config = validatedConfig;
      console.log('FirebaseCore initialized with valid configuration');
    } catch (error) {
      console.error('Failed to initialize FirebaseCore:', error);
      throw error;
    }
  }

  initialize(): FirebaseApp {
    try {
      if (this.app) {
        return this.app;
      }

      if (!this.config) {
        throw new Error('Firebase configuration not available');
      }

      // Check if app is already initialized
      const existingApps = getApps();
      if (existingApps.length > 0) {
        console.log('Using existing Firebase app instance');
        this.app = existingApps[0];
        return this.app;
      }

      // Initialize new app
      console.log('Initializing new Firebase app instance');
      this.app = initializeApp(this.config);
      return this.app;
    } catch (error) {
      console.error('Failed to initialize Firebase app:', error);
      throw error;
    }
  }

  getApp(): FirebaseApp {
    if (!this.app) {
      return this.initialize();
    }
    return this.app;
  }

  getAuth() {
    const app = this.getApp();
    return getAuth(app);
  }

  getFirestore() {
    const app = this.getApp();
    return getFirestore(app);
  }

  getStorage() {
    const app = this.getApp();
    return getStorage(app);
  }

  getDatabase() {
    const app = this.getApp();
    return getDatabase(app);
  }
}

export const firebaseCore = new FirebaseCore();
