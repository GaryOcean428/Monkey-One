import { ref, get, type DatabaseReference } from 'firebase/database';
import { app, analytics, auth, database } from './config';

// Test Firebase connection with proper error handling
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    if (!app) {
      console.error('Firebase app not initialized');
      return false;
    }

    if (!database) {
      console.error('Firebase database not initialized');
      return false;
    }

    // Test database connection
    const testRef: DatabaseReference = ref(database, '.info/connected');
    const snapshot = await get(testRef);
    const isConnected = snapshot.val() === true;
    
    if (isConnected) {
      console.log('Successfully connected to Firebase');
    } else {
      console.warn('Firebase connection test returned false');
    }

    // Test auth initialization
    if (!auth) {
      console.error('Firebase auth not initialized');
      return false;
    }

    // Additional service checks
    const services = [
      { name: 'Database', instance: database },
      { name: 'Auth', instance: auth },
      { name: 'Analytics', instance: analytics }
    ];

    for (const service of services) {
      if (!service.instance) {
        console.warn(`Firebase ${service.name} not initialized`);
      } else {
        console.log(`Firebase ${service.name} initialized successfully`);
      }
    }

    return isConnected;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

// Export initialized services
export { app, analytics, auth, database };