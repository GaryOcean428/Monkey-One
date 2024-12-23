import { useState, useCallback } from 'react';

export function useObserver() {
  const [observations, setObservations] = useState([]);
  const [isActive, setIsActive] = useState(false);

  const startObserving = useCallback(() => {
    setIsActive(true);
  }, []);

  const stopObserving = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    observations,
    isActive,
    startObserving,
    stopObserving
  };
}