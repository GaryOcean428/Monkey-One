import { useState, useCallback } from 'react'
import { MLService } from '../lib/ml/MLService'
import * as tf from '@tensorflow/tfjs'

const mlService = new MLService()

export function useML() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialize = useCallback(async () => {
    try {
      await mlService.initialize()
      setIsInitialized(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize ML service')
      throw err
    }
  }, [])

  const train = useCallback(
    async (data: number[][], labels: number[][], epochs?: number) => {
      if (!isInitialized) {
        throw new Error('ML service not initialized')
      }

      setIsTraining(true)
      setError(null)

      try {
        const tensorData = tf.tensor2d(data)
        const tensorLabels = tf.tensor2d(labels)

        const history = await mlService.train(tensorData, tensorLabels, epochs)

        // Cleanup tensors
        tensorData.dispose()
        tensorLabels.dispose()

        return history
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to train model')
        throw err
      } finally {
        setIsTraining(false)
      }
    },
    [isInitialized]
  )

  const predict = useCallback(
    async (input: number[][]) => {
      if (!isInitialized) {
        throw new Error('ML service not initialized')
      }

      try {
        const tensorInput = tf.tensor2d(input)
        const prediction = await mlService.predict(tensorInput)
        const result = await prediction.array()

        // Cleanup tensors
        tensorInput.dispose()
        prediction.dispose()

        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to make prediction')
        throw err
      }
    },
    [isInitialized]
  )

  const getHistory = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('ML service not initialized')
    }

    try {
      return await mlService.getTrainingHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get training history')
      throw err
    }
  }, [isInitialized])

  return {
    initialize,
    train,
    predict,
    getHistory,
    isInitialized,
    isTraining,
    error,
    clearError: () => setError(null),
  }
}
