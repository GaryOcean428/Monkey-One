import { create } from 'zustand'

interface WorkflowState {
  workflows: unknown[]
}

export const useWorkflowStore = create<WorkflowState>(() => ({
  workflows: [],
}))
