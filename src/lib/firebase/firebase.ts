import { ref, get, type DatabaseReference } from 'firebase/database';
import { app, analytics, auth, database } from './config';

interface ServiceValidation {
  name: string;
  instance: unknown;
  required: boolean;
}

function validateFirebaseServices(): boolean {
  const services: ServiceValidation[] = [
    { name: 'App', instance: app, required: true },
    { name: 'Database', instance: database, required: true },
    { name: 'Auth', instance: auth, required: true },
    { name: 'Analytics', instance: analytics, required: false }
  ];

  const requiredServicesValid = services
    .filter(service => service.required)
    .every(({ name, instance }) => {
      const isValid = !!instance;
      if (!isValid) {
        console.error(`Required Firebase service ${name} not initialized`);
      }
      return isValid;
    });

  // Log status of optional services
  services
    .filter(service => !service.required)
    .forEach(({ name, instance }) => {
      console.log(`Optional Firebase service ${name} status:`, !!instance);
    });

  return requiredServicesValid;
}

async function testDatabaseConnection(): Promise<boolean> {
  if (!database) return false;

  try {
    const testRef: DatabaseReference = ref(database, '.info/connected');
    const snapshot = await get(testRef);
    const isConnected = snapshot.val() === true;
    
    console.log(
      isConnected 
        ? 'Successfully connected to Firebase Database'
        : 'Firebase Database connection test returned false'
    );

    return isConnected;
  } catch (error) {
    console.error('Firebase Database connection test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return false;
  }
}

export async function testFirebaseConnection(): Promise<boolean> {
  // First validate service initialization
  if (!validateFirebaseServices()) {
    return false;
  }

  // Then test database connection
  return await testDatabaseConnection();
}

// Export initialized services
export { app, analytics, auth, database };