import { useState, useCallback } from 'react';
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

  const createWorkflow = useCallback(async (definition: Partial<WorkflowDefinition>) => {
    const newWorkflow: WorkflowDefinition = {
      ...initialWorkflow,
      ...definition,
      id: Math.random().toString(36).substring(7),
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    setWorkflows(prev => [...prev, newWorkflow]);
  }, []);

  return {
    workflows,
    createWorkflow
  };
}