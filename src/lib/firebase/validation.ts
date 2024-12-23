import { z } from 'zod';
import type { FirebaseConfig } from './types';

const configSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1), 
  storageBucket: z.string().min(1),
  messagingSenderId: z.string().min(1),
  appId: z.string().min(1),
  databaseURL: z.string().min(1),
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

  try {
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

    // Parse and validate the config
    const validatedConfig = configSchema.parse(config);
    console.log('Firebase config validated successfully');
    return validatedConfig;
  } catch (error) {
    if (error instanceof z.ZodError && process.env.NODE_ENV !== 'production') {
      console.warn('Firebase configuration validation failed:', error.errors);
    } else if (error instanceof z.ZodError) {
      console.error('Firebase configuration validation failed:', error.errors);
    } else {
      console.error('Unexpected error during Firebase config validation:', error);
    }
    return null;
  }
};
