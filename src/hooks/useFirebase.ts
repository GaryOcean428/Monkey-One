import { useEffect, useState } from 'react';
import { getFirebaseServices } from '../lib/firebase';
import type { FirebaseServices } from '../lib/firebase/services';

export function useFirebase() {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const firebaseServices = getFirebaseServices();
      setServices(firebaseServices);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to get Firebase services'));
    }
  }, []);

  return { services, error };
}