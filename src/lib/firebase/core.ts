import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { validateConfig } from './validation';
import type { FirebaseConfig } from './types';

class FirebaseCore {
  private app: FirebaseApp | null = null;
  private config: FirebaseConfig;

  constructor() {
    const validatedConfig = validateConfig(import.meta.env);
    if (!validatedConfig) {
      throw new Error('Invalid Firebase configuration');
    }
    this.config = validatedConfig;
  }

  initialize(): FirebaseApp {
    if (this.app) {
      return this.app;
    }
    try {
      this.app = initializeApp(this.config);
      return this.app;
    } catch (error) {
      console.error('Failed to initialize Firebase app:', error);
      throw new Error('Firebase initialization failed');
    }
  }

  getApp(): FirebaseApp {
    if (!this.app) {
      return this.initialize();
    }
    return this.app;
  }

  getAuth() {
    return getAuth(this.getApp());
  }

  getFirestore() {
    return getFirestore(this.getApp());
  }

  getStorage() {
    return getStorage(this.getApp());
  }

  getDatabase() {
    return getDatabase(this.getApp());
  }
}

export const firebaseCore = new FirebaseCore();
