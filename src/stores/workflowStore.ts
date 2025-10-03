import { create } from 'zustand'

export interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'failed'
  type: string
  lastRun: string
  nextRun?: string
}

interface WorkflowState {
  workflows: Workflow[]
  isLoading: boolean
  error: Error | null
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'status' | 'lastRun'>) => Promise<void>
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>
  deleteWorkflow: (id: string) => Promise<void>
  toggleWorkflowStatus: (id: string) => Promise<void>
  fetchWorkflows: () => Promise<void>
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  isLoading: false,
  error: null,

  createWorkflow: async workflow => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Replace with actual API call
      const newWorkflow: Workflow = {
        id: crypto.randomUUID(),
        status: 'paused',
        lastRun: new Date().toISOString(),
        ...workflow,
      }
      set(state => ({ workflows: [...state.workflows, newWorkflow] }))
    } catch (error) {
      set({ error: error as Error })
    } finally {
      set({ isLoading: false })
    }
  },

  updateWorkflow: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Replace with actual API call
      set(state => ({
        workflows: state.workflows.map(workflow =>
          workflow.id === id ? { ...workflow, ...updates } : workflow
        ),
      }))
    } catch (error) {
      set({ error: error as Error })
    } finally {
      set({ isLoading: false })
    }
  },

  deleteWorkflow: async id => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Replace with actual API call
      set(state => ({
        workflows: state.workflows.filter(workflow => workflow.id !== id),
      }))
    } catch (error) {
      set({ error: error as Error })
    } finally {
      set({ isLoading: false })
    }
  },

  toggleWorkflowStatus: async id => {
    set({ isLoading: true, error: null })
    try {
      const workflow = get().workflows.find(w => w.id === id)
      if (!workflow) throw new Error('Workflow not found')

      const newStatus = workflow.status === 'active' ? 'paused' : 'active'
      await get().updateWorkflow(id, { status: newStatus })
    } catch (error) {
      set({ error: error as Error })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchWorkflows: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Replace with actual API call
      const workflows: Workflow[] = [
        {
          id: '1',
          name: 'Data Processing Pipeline',
          description: 'Automated data processing and analysis workflow',
          status: 'active',
          type: 'data-processing',
          lastRun: '2024-12-29T02:30:00Z',
          nextRun: '2024-12-29T03:30:00Z',
        },
        {
          id: '2',
          name: 'Content Generation',
          description: 'AI-powered content creation and optimization',
          status: 'paused',
          type: 'content',
          lastRun: '2024-12-29T02:00:00Z',
        },
      ]
      set({ workflows })
    } catch (error) {
      set({ error: error as Error })
    } finally {
      set({ isLoading: false })
    }
  },
}))
