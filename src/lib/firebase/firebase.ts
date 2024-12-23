import { ref, get, type DatabaseReference } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { app, analytics, auth, database } from './config';

const TIMEOUT_MS = 5000;

async function testDatabaseConnection(): Promise<boolean> {
  if (!database) return false;

  try {
    const connectedRef = ref(database, '.info/connected');
    const snapshot = await Promise.race([
      get(connectedRef),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), TIMEOUT_MS)
      )
    ]);

    const isConnected = snapshot.val() === true;
    console.log(
      isConnected 
        ? 'Successfully connected to Firebase Database'
        : 'Firebase Database connection test returned false'
    );

    return isConnected;
  } catch (error) {
    console.error('Firebase Database connection test failed:', error);
    return false;
  }
}

async function testAuthConnection(): Promise<boolean> {
  if (!auth) return false;

  try {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        console.log('Firebase Auth connection test passed');
        resolve(true);
      }, (error) => {
        console.error('Firebase Auth connection test failed:', error);
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        unsubscribe();
        console.warn('Firebase Auth connection test timed out');
        resolve(false);
      }, TIMEOUT_MS);
    });
  } catch (error) {
    console.error('Firebase Auth connection test failed:', error);
    return false;
  }
}

export async function testFirebaseConnection(): Promise<boolean> {
  if (!app) {
    console.error('Firebase app not initialized');
    return false;
  }

  console.log('Testing Firebase connections...');
  
  // Test both database and auth connections
  const [dbConnected, authConnected] = await Promise.all([
    testDatabaseConnection(),
    testAuthConnection()
  ]);

  // Log analytics status
  if (analytics) {
    console.log('Firebase Analytics is available');
  } else {
    console.log('Firebase Analytics is not available (expected in development)');
  }

  return dbConnected && authConnected;
}

export { app, analytics, auth, database };