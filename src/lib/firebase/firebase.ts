import { ref, get, type DatabaseReference } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { app, analytics, auth, database } from './config';

const TIMEOUT_MS = 5000;

/**
 * Tests the database connection by checking the .info/connected reference
 * @returns Promise<boolean> Connection status
 */
async function testDatabaseConnection(): Promise<boolean> {
  if (!database) {
    console.error('Firebase Database not initialized');
    return false;
  }

  try {
    const connectedRef: DatabaseReference = ref(database, '.info/connected');
    const snapshot = await Promise.race([
      get(connectedRef),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), TIMEOUT_MS);
      })
    ]);

    const isConnected = snapshot.val() === true;
    
    if (isConnected) {
      console.log('Firebase Database connection successful');
    } else {
      console.warn('Firebase Database connection test returned false');
    }
    
    return isConnected;
  } catch (error) {
    console.error('Firebase Database connection test failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

/**
 * Tests the authentication service connection
 * @returns Promise<boolean> Connection status
 */
async function testAuthConnection(): Promise<boolean> {
  if (!auth) {
    console.error('Firebase Auth not initialized');
    return false;
  }

  try {
    return new Promise<boolean>((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('Firebase Auth connection test timed out');
        unsubscribe();
        resolve(false);
      }, TIMEOUT_MS);

      const unsubscribe = onAuthStateChanged(
        auth,
        () => {
          clearTimeout(timeoutId);
          console.log('Firebase Auth connection successful');
          unsubscribe();
          resolve(true);
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error('Firebase Auth connection error:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          unsubscribe();
          resolve(false);
        }
      );
    });
  } catch (error) {
    console.error('Firebase Auth connection test failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

/**
 * Tests all Firebase service connections
 * @returns Promise<boolean> Overall connection status
 */
export async function testFirebaseConnection(): Promise<boolean> {
  if (!app) {
    console.error('Firebase app not initialized');
    return false;
  }

  console.log('Testing Firebase connections...');

  try {
    const [dbConnected, authConnected] = await Promise.all([
      testDatabaseConnection(),
      testAuthConnection()
    ]);

    if (analytics) {
      console.log('Firebase Analytics is available');
    } else {
      console.log('Firebase Analytics is not available (expected in development)');
    }

    const isFullyConnected = dbConnected && authConnected;
    
    if (isFullyConnected) {
      console.log('All Firebase services connected successfully');
    } else {
      console.warn('Some Firebase services failed to connect:', {
        database: dbConnected,
        auth: authConnected
      });
    }

    return isFullyConnected;
  } catch (error) {
    console.error('Error testing Firebase connections:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

// Export initialized services
export { app, analytics, auth, database };