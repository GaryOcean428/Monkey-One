import { useCallback } from 'react';
import { analytics } from '../lib/monitoring/analytics';

export function useMonitoring() {
  const logEvent = useCallback((eventName: string, data: Record<string, any>) => {
    analytics.trackEvent(eventName, data);
  }, []);

  const getMetrics = useCallback((modelName?: string) => {
    return analytics.getMetrics(modelName);
  }, []);

  return {
    logEvent,
    getMetrics
  };
}
