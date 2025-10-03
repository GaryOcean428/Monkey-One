import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface WorkflowState {
  workflows: any[]
}

export const useWorkflowStore = create<WorkflowState>()(
  immer(() => ({
    workflows: [],
  }))
)
