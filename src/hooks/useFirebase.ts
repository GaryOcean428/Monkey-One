import { useState, useEffect } from 'react';
import { testFirebaseConnection, database } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

export function useFirebase() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!database) {
      setError('Firebase database not initialized');
      setIsChecking(false);
      return;
    }

    const connectedRef = ref(database, '.info/connected');
    
    const unsubscribe = onValue(connectedRef, (snap) => {
      setIsConnected(snap.val() === true);
      setIsChecking(false);
      setError(null);
    }, (error) => {
      setError(error.message);
      setIsConnected(false);
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    setError(null);
    try {
      const connected = await testFirebaseConnection();
      setIsConnected(connected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Firebase');
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isConnected,
    isChecking,
    error,
    checkConnection
  };
}