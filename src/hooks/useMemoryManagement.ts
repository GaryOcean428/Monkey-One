import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toolhouse } from '../lib/toolhouse'

export interface MemoryTrace {
  id: string
  content: string
  importance: number
  timestamp: number
  metadata?: Record<string, any>
}

const SHORT_TERM_THRESHOLD = 60 // minutes
const IMPORTANCE_THRESHOLD = 0.5

export const useMemoryManagement = () => {
  const queryClient = useQueryClient()

  const shouldKeepInShortTerm = useCallback((trace: MemoryTrace): boolean => {
    const age = (Date.now() - trace.timestamp) / (1000 * 60) // Age in minutes
    return age < SHORT_TERM_THRESHOLD && trace.importance > IMPORTANCE_THRESHOLD
  }, [])

  const storeMemory = useMutation({
    mutationFn: async ({
      content,
      importance,
      metadata,
    }: {
      content: string
      importance: number
      metadata?: Record<string, any>
    }) => {
      const memoryTrace: MemoryTrace = {
        id: `mem_${Date.now()}`,
        content,
        importance,
        timestamp: Date.now(),
        metadata,
      }

      if (shouldKeepInShortTerm(memoryTrace)) {
        // Store in both short-term and long-term memory
        await Promise.all([
          toolhouse.storeMemory(content, { ...metadata, importance, isShortTerm: true }),
          toolhouse.storeMemory(content, { ...metadata, importance, isShortTerm: false }),
        ])
      } else {
        // Store only in long-term memory
        await toolhouse.storeMemory(content, { ...metadata, importance, isShortTerm: false })
      }

      return memoryTrace
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })

  const searchMemories = useCallback(
    async (
      query: string,
      options?: {
        shortTermOnly?: boolean
        minImportance?: number
      }
    ) => {
      const memories = await toolhouse.searchMemory(query, {
        filter: {
          ...(options?.shortTermOnly && { isShortTerm: true }),
          ...(options?.minImportance && { importance: { $gte: options.minImportance } }),
        },
      })

      return memories.filter(
        memory => !options?.shortTermOnly || shouldKeepInShortTerm(memory as MemoryTrace)
      )
    },
    [shouldKeepInShortTerm]
  )

  const consolidateMemories = useMutation({
    mutationFn: async () => {
      const allMemories = await toolhouse.searchMemory('', {
        filter: { isShortTerm: true },
      })

      const outdatedMemories = allMemories.filter(
        memory => !shouldKeepInShortTerm(memory as MemoryTrace)
      )

      if (outdatedMemories.length > 0) {
        await toolhouse.deleteMemory(outdatedMemories.map(m => m.id))
      }

      return outdatedMemories.length
    },
  })

  // Auto-consolidate memories periodically
  useEffect(() => {
    const interval = setInterval(
      () => {
        consolidateMemories.mutate()
      },
      1000 * 60 * 15
    ) // Every 15 minutes

    return () => clearInterval(interval)
  }, [])

  return {
    storeMemory,
    searchMemories,
    consolidateMemories,
    shouldKeepInShortTerm,
  }
}
