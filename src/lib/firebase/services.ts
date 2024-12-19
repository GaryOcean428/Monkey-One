import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Storage, getStorage } from 'firebase/storage';
import { firebaseCore } from './core';

interface FirebaseServices {
  auth: Auth;
  firestore: Firestore;
  storage: Storage;
}

class ServiceManager {
  private services: Partial<FirebaseServices> = {};
  private initialized = false;

  async initializeServices(): Promise<FirebaseServices> {
    try {
      const app = firebaseCore.getApp();

      this.services = {
        auth: getAuth(app),
        firestore: getFirestore(app),
        storage: getStorage(app)
      };

      this.initialized = true;
      return this.services as FirebaseServices;
    } catch (error) {
      console.error('Failed to initialize Firebase services:', error);
      throw new Error('Firebase services initialization failed');
    }
  }

  getServices(): FirebaseServices {
    if (!this.initialized) {
      throw new Error('Firebase services not initialized');
    }
    return this.services as FirebaseServices;
  }

  getAuth(): Auth {
    if (!this.services.auth) {
      throw new Error('Firebase Auth not initialized');
    }
    return this.services.auth;
  }

  getFirestore(): Firestore {
    if (!this.services.firestore) {
      throw new Error('Firestore not initialized');
    }
    return this.services.firestore;
  }

  getStorage(): Storage {
    if (!this.services.storage) {
      throw new Error('Firebase Storage not initialized');
    }
    return this.services.storage;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const serviceManager = new ServiceManager();
