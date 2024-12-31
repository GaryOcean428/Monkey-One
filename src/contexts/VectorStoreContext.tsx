/* eslint-env browser */
import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import { vectorStore } from '../lib/vectorstore/VectorStoreManager'
import { monitoring } from '../lib/monitoring/MonitoringSystem'
import type { CodeInsight, LearningMetric } from '../types'

interface VectorStoreContextType {
  storeInsight: (insight: CodeInsight, embedding: number[]) => Promise<void>
  findSimilarInsights: (
    embedding: number[],
    options?: {
      type?: string
      confidence?: number
      limit?: number
    }
  ) => Promise<CodeInsight[]>
  storeLearningMetrics: (metrics: LearningMetric[], embedding: number[]) => Promise<void>
  findSimilarLearningPatterns: (embedding: number[], limit?: number) => Promise<LearningMetric[]>
  cleanup: (retentionDays?: number) => Promise<void>
}

const VectorStoreContext = createContext<VectorStoreContextType | null>(null)

export const useVectorStore = () => {
  const context = useContext(VectorStoreContext)
  if (!context) {
    throw new Error('useVectorStore must be used within a VectorStoreProvider')
  }
  return context
}

interface VectorStoreProviderProps {
  children: ReactNode
}

export const VectorStoreProvider: React.FC<VectorStoreProviderProps> = ({ children }) => {
  useEffect(() => {
    const initVectorStore = async () => {
      try {
        await vectorStore.initialize()
      } catch (error) {
        monitoring.recordError(
          'vector_store',
          error instanceof Error ? error.message : 'Failed to initialize vector store'
        )
      }
    }

    initVectorStore()
  }, [])

  const value: VectorStoreContextType = {
    storeInsight: vectorStore.storeCodeInsight.bind(vectorStore),
    findSimilarInsights: vectorStore.findSimilarInsights.bind(vectorStore),
    storeLearningMetrics: vectorStore.storeLearningMetrics.bind(vectorStore),
    findSimilarLearningPatterns: vectorStore.findSimilarLearningPatterns.bind(vectorStore),
    cleanup: vectorStore.cleanup.bind(vectorStore),
  }

  return <VectorStoreContext.Provider value={value}>{children}</VectorStoreContext.Provider>
}
