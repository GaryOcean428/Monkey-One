import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MLService } from '../../lib/ml/MLService'
import * as tf from '@tensorflow/tfjs'
import { supabase } from '../../lib/supabase/client'

// Mock Supabase
vi.mock('../../lib/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        download: vi.fn().mockResolvedValue({ data: new Blob([JSON.stringify({})]), error: null }),
        upload: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}))

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn().mockResolvedValue(true),
  sequential: vi.fn(() => ({
    add: vi.fn(),
    compile: vi.fn(),
    fit: vi.fn().mockResolvedValue({ history: { loss: [0.1] } }),
    predict: vi.fn(() => tf.tensor2d([[0.5]], [1, 1])),
    save: vi.fn().mockResolvedValue(undefined),
    loadLayersModel: vi.fn(),
  })),
  layers: {
    dense: vi.fn(() => ({ apply: vi.fn() })),
    dropout: vi.fn(() => ({ apply: vi.fn() })),
  },
  tensor2d: vi.fn(data => ({
    data,
    dataSync: vi.fn(() => data),
    dispose: vi.fn(),
  })),
}))

describe('MLService', () => {
  let mlService: MLService

  beforeEach(async () => {
    vi.clearAllMocks()
    mlService = new MLService()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize successfully', async () => {
    await mlService.initialize()
    expect(mlService).toBeDefined()
  })

  it('should create a model with the correct architecture', async () => {
    await mlService.initialize()
    expect(tf.sequential).toHaveBeenCalled()
  })

  it('should handle training with valid data', async () => {
    await mlService.initialize()
    const data = [1, 2, 3, 4]
    const labels = [1, 0]

    const result = await mlService.train(data, labels)
    expect(result.history.loss).toBeDefined()

    // Verify model was saved after training
    expect(supabase.storage.from).toHaveBeenCalledWith('ml-models')
    expect(supabase.from).toHaveBeenCalledWith('ml_models')
  })

  it('should throw error when predicting without initialization', async () => {
    const input = [1, 2]
    await expect(mlService.predict(input)).rejects.toThrow()
  })

  it('should handle prediction after initialization', async () => {
    await mlService.initialize()
    const input = [1, 2]
    const prediction = await mlService.predict(input)
    expect(prediction).toBeDefined()
    expect(Array.isArray(prediction)).toBe(true)
  })

  it('should get training history', async () => {
    await mlService.initialize()
    const data = [1, 2]
    const labels = [1]
    await mlService.train(data, labels)

    const history = await mlService.getTrainingHistory()
    expect(history).toBeDefined()
    expect(Array.isArray(history)).toBe(true)
  })

  it('should handle model storage operations during training', async () => {
    await mlService.initialize()
    const data = [1, 2]
    const labels = [1]

    await mlService.train(data, labels)

    // Verify storage operations were called
    expect(supabase.storage.from).toHaveBeenCalledWith('ml-models')
    expect(supabase.from).toHaveBeenCalledWith('ml_models')
  })

  it('should handle training metrics storage', async () => {
    await mlService.initialize()
    const data = [1, 2]
    const labels = [1]

    await mlService.train(data, labels)

    // Verify metrics were stored
    expect(supabase.from).toHaveBeenCalledWith('training_metrics')
  })

  it('should cleanup resources properly', () => {
    mlService.cleanup()
    expect(mlService.getMemoryInfo()).toBeDefined()
  })
})
