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

    const { projectId, apiKey, authDomain } = this.config;
    
    if (!projectId || !apiKey || !authDomain) {
      throw new Error('Missing required Firebase configuration');
    }

    // Check if app is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      this.app = existingApps[0];
      return this.app;
    }

    // Initialize new app
    this.app = initializeApp(this.config);
    return this.app;
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
