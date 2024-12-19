import { z } from 'zod';
import type { FirebaseConfig } from './types';

const configSchema = z.object({
  apiKey: z.string(),
  authDomain: z.string(),
  projectId: z.string(), 
  storageBucket: z.string(),
  messagingSenderId: z.string(),
  appId: z.string(),
  databaseURL: z.string(),
  measurementId: z.string().optional()
});

export const validateConfig = (env: Record<string, string | undefined>): FirebaseConfig | null => {
  // Check if all required environment variables are present
  const hasAllConfig = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_DATABASE_URL'
  ].every(key => env[key]);

  if (!hasAllConfig) {
    return null;
  }

  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    databaseURL: env.VITE_FIREBASE_DATABASE_URL,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
  };

  try {
    return configSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError && process.env.NODE_ENV !== 'production') {
      console.warn('Firebase configuration validation failed:', error.errors);
    }
    return null;
  }
};
