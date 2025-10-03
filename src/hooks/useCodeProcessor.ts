import { useState, useCallback } from 'react'
import { CodeProcessor } from '../lib/llm/CodeProcessor'
import { ScriptGenerator } from '../lib/llm/ScriptGenerator'
import type { Message } from '../types'

const codeProcessor = new CodeProcessor()
const scriptGenerator = new ScriptGenerator()

export function useCodeProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processCodingTask = useCallback(async (task: string, context: Message[] = []) => {
    setIsProcessing(true)
    setError(null)

    try {
      return await codeProcessor.processCodingTask(task, context)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process coding task'
      setError(errorMessage)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const generateHelperScript = useCallback(
    async (task: string, language: 'python' | 'javascript' = 'python') => {
      setIsProcessing(true)
      setError(null)

      try {
        return await scriptGenerator.generateHelperScript(task, language)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate helper script'
        setError(errorMessage)
        throw err
      } finally {
        setIsProcessing(false)
      }
    },
    []
  )

  return {
    processCodingTask,
    generateHelperScript,
    isProcessing,
    error,
  }
}
