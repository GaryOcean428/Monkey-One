import { useState, useCallback, useEffect } from 'react'

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface WorkflowStep {
  id: string
  name: string
  status: WorkflowStatus
  agent?: string
  description?: string
  startTime?: Date
  endTime?: Date
}

export interface Workflow {
  id: string
  name: string
  description?: string
  steps: WorkflowStep[]
  status: WorkflowStatus
  createdAt: Date
  updatedAt: Date
}

const initialWorkflow: Workflow = {
  id: '1',
  name: 'Initial Workflow',
  description: 'A sample workflow',
  steps: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export function useWorkflow() {
  const [workflows, setWorkflows] = useState<Workflow[]>([initialWorkflow])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadWorkflows() {
      try {
        // Simulated async load
        await new Promise(resolve => setTimeout(resolve, 500))
        setWorkflows([initialWorkflow])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load workflows'))
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkflows()
  }, [])

  const createWorkflow = useCallback(async (workflow: Omit<Workflow, 'id'>) => {
    try {
      const newWorkflow: Workflow = {
        ...workflow,
        id: Math.random().toString(36).substring(7),
      }
      setWorkflows(prev => [...prev, newWorkflow])
      return newWorkflow
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create workflow'))
      throw err
    }
  }, [])

  const runWorkflow = useCallback(
    async (workflowId: string) => {
      try {
        // Update workflow to running state
        setWorkflows(prev =>
          prev.map(workflow => {
            if (workflow.id !== workflowId) return workflow

            const updatedSteps = workflow.steps.map((step, index) => ({
              ...step,
              status: index === 0 ? ('running' as const) : ('pending' as const),
              startTime: index === 0 ? new Date() : undefined,
              endTime: undefined,
            }))

            return {
              ...workflow,
              status: 'running' as const,
              steps: updatedSteps,
              updatedAt: new Date(),
            }
          })
        )

        // Simulate workflow execution
        const workflow = workflows.find(w => w.id === workflowId)
        if (!workflow) throw new Error('Workflow not found')

        for (let i = 0; i < workflow.steps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate step execution

          setWorkflows(prev =>
            prev.map(w => {
              if (w.id !== workflowId) return w

              const updatedSteps = w.steps.map((step, index) => {
                if (index === i) {
                  return {
                    ...step,
                    status: 'completed' as const,
                    endTime: new Date(),
                  }
                }
                if (index === i + 1) {
                  return {
                    ...step,
                    status: 'running' as const,
                    startTime: new Date(),
                  }
                }
                return step
              })

              const allCompleted = updatedSteps.every(step => step.status === 'completed')

              return {
                ...w,
                steps: updatedSteps,
                status: allCompleted ? ('completed' as const) : ('running' as const),
                updatedAt: new Date(),
              }
            })
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to run workflow'))

        // Update workflow status to failed
        setWorkflows(prev =>
          prev.map(workflow =>
            workflow.id === workflowId
              ? { ...workflow, status: 'failed' as const, updatedAt: new Date() }
              : workflow
          )
        )

        throw err
      }
    },
    [workflows]
  )

  const saveWorkflow = useCallback(async (workflowId: string) => {
    try {
      // Simulate saving to backend
      await new Promise(resolve => setTimeout(resolve, 1000))

      setWorkflows(prev =>
        prev.map(workflow =>
          workflow.id === workflowId ? { ...workflow, updatedAt: new Date() } : workflow
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save workflow'))
      throw err
    }
  }, [])

  return {
    workflows,
    createWorkflow,
    runWorkflow,
    saveWorkflow,
    isLoading,
    error,
  }
}
