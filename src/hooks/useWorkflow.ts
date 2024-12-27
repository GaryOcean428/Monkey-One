import { useState, useCallback, useEffect } from 'react';
import type { WorkflowDefinition } from '../types';

const initialWorkflow: WorkflowDefinition = {
  id: '1',
  name: 'Initial Workflow',
  description: 'A sample workflow',
  steps: [],
  team: [],
  metadata: {
    iterationCount: 0,
    successMetrics: {
      accuracy: 0,
      efficiency: 0,
      reliability: 0
    }
  },
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  status: 'draft'
};

export function useWorkflow() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([initialWorkflow]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadWorkflows() {
      try {
        // Simulated async load
        await new Promise(resolve => setTimeout(resolve, 500));
        setWorkflows([initialWorkflow]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load workflows'));
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkflows();
  }, []);

  const createWorkflow = useCallback(async (definition: Partial<WorkflowDefinition>) => {
    try {
      const newWorkflow: WorkflowDefinition = {
        ...initialWorkflow,
        ...definition,
        id: Math.random().toString(36).substring(7),
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
      setWorkflows(prev => [...prev, newWorkflow]);
      return newWorkflow;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create workflow'));
      throw err;
    }
  }, []);

  return {
    workflows,
    createWorkflow,
    isLoading,
    error
  };
}