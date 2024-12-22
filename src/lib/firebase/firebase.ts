import { app, analytics, auth, database } from './config';

// Test Firebase connection with proper error handling
export async function testFirebaseConnection(): Promise<boolean> {
  if (!database) {
    console.warn('Firebase database not initialized');
    return false;
  }

  try {
    const connectedRef = ref(database, '.info/connected');
    
    return new Promise((resolve) => {
      const unsubscribe = connectedRef.on('value', (snap) => {
        unsubscribe(); // Clean up listener
        const isConnected = snap.val() === true;
        console.log(isConnected ? "Connected to Firebase" : "Not connected to Firebase");
        resolve(isConnected);
      }, (error) => {
        console.error('Firebase connection error:', error);
        resolve(false);
      });
    });
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
}

// Export initialized services
export { app, analytics, auth, database };