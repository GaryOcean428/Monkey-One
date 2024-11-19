import { useState, useCallback, useEffect } from 'react';
import { ObserverAgent } from '@/lib/agents/core/ObserverAgent';
import type { CodeInsight, LearningMetric } from '@/types';

export function useObserver() {
  const [observer] = useState(() => new ObserverAgent('observer-1', 'System Observer'));
  const [insights, setInsights] = useState<CodeInsight[]>([]);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetric[]>([]);

  useEffect(() => {
    // Initialize insights and metrics
    setInsights(observer.getInsights());
    setLearningMetrics(observer.getLearningMetrics());

    // Set up periodic updates
    const interval = setInterval(() => {
      setInsights(observer.getInsights());
      setLearningMetrics(observer.getLearningMetrics());
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [observer]);

  const analyzeCodebase = useCallback(async () => {
    const newInsights = await observer.analyzeCodebase();
    setInsights(newInsights);
  }, [observer]);

  const provideFeedback = useCallback(async (insightId: string, type: 'positive' | 'negative') => {
    // Store feedback for learning
    await observer.processFeedback(insightId, type);
    
    // Update insights after feedback
    setInsights(observer.getInsights());
    setLearningMetrics(observer.getLearningMetrics());
  }, [observer]);

  return {
    insights,
    learningMetrics,
    analyzeCodebase,
    provideFeedback
  };
}