import { useState, useCallback } from 'react'
import { toolManager } from '../lib/tools'

export function useTools() {
  const [tools, setTools] = useState(toolManager.listTools())
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateTool = useCallback(async (spec: any) => {
    setIsGenerating(true)
    setError(null)

    try {
      const tool = await toolManager.generateTool(spec)
      setTools(toolManager.listTools())
      return tool
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate tool'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const executeTool = useCallback(async (name: string, args: Record<string, unknown>) => {
    try {
      return await toolManager.execute(name, args)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute tool'
      throw new Error(errorMessage)
    }
  }, [])

  return {
    tools,
    isGenerating,
    error,
    generateTool,
    executeTool,
  }
}

export default useTools
