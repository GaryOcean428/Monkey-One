import { tensor, dispose, memory, Tensor, Rank, History } from '@tensorflow/tfjs-core'
import { loadLayersModel, LayersModel, Logs } from '@tensorflow/tfjs-layers'
import { supabase } from '../supabase/client'
import { logger } from '../../utils/logger'
import { captureException } from '../../utils/sentry'
import { mlPredictionDuration } from '../../utils/metrics'
import { encrypt, decrypt } from '../utils/browserCrypto'

interface ModelMetrics {
  dateSaved: Date
  modelTopologyType: string
  modelTopologyBytes: number
  weightSpecsBytes: number
  weightDataBytes: number
}

/**
 * MLService handles machine learning operations including model management,
 * training, and predictions. It integrates with Supabase for model storage
 * and metrics tracking.
 */
export class MLService {
  private model: LayersModel | null = null

  /**
   * Initializes the MLService by loading or creating a model.
   * @throws {Error} If initialization fails
   */
  async initialize(): Promise<void> {
    try {
      try {
        this.model = await this.loadModel()
        logger.info('Model loaded successfully')
      } catch (error) {
        logger.warn('No existing model found, creating new one')
        this.model = await this.createModel()
        await this.saveModel()
      }
    } catch (error) {
      logger.error('Failed to initialize MLService:', error)
      captureException(error as Error)
      throw error
    }
  }

  /**
   * Creates a new neural network model with predefined architecture.
   * @returns A new TensorFlow.js LayersModel
   */
  private async createModel(): Promise<LayersModel> {
    return await loadLayersModel('https://example.com/model.json')
  }

  /**
   * Loads a model from Supabase Storage.
   * @returns Promise resolving to the loaded model
   * @throws {Error} If model loading fails
   */
  private async loadModel(): Promise<LayersModel> {
    try {
      const { data, error } = await supabase.storage.from('ml-models').download('latest/model.json')

      if (error) throw error
      if (!data) throw new Error('No model data found')

      const encryptedData = await data.text()
      const modelJson = await decrypt(encryptedData)

      const weightsResponse = await supabase.storage
        .from('ml-models')
        .download('latest/weights.bin')
      if (!weightsResponse.data) throw new Error('No weights data found')
      const weights = await weightsResponse.data.arrayBuffer()

      return await loadLayersModel({
        modelTopology: JSON.parse(modelJson),
        weightData: weights,
      })
    } catch (error) {
      logger.error('Failed to load model:', error)
      throw error
    }
  }

  /**
   * Saves the current model to Supabase Storage and records metadata.
   * @throws {Error} If saving fails
   */
  private async saveModel(): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save')
    }

    try {
      // Convert model to JSON format and encrypt
      const modelConfig = this.model.toJSON()
      const modelJson = JSON.stringify(modelConfig)
      const encryptedData = await encrypt(modelJson)

      // Upload encrypted model to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('ml-models')
        .upload('latest/model.json', new Blob([encryptedData]), {
          upsert: true,
        })

      if (uploadError) throw uploadError

      const metrics: ModelMetrics = {
        dateSaved: new Date(),
        modelTopologyType: 'JSON',
        modelTopologyBytes: modelJson.length,
        weightSpecsBytes: 0,
        weightDataBytes: 0,
      }

      // Save metadata to Supabase
      const { error: insertError } = await supabase.from('ml_models').insert({
        version: 'latest',
        architecture: modelConfig,
        saved_at: new Date().toISOString(),
        metrics,
      })

      if (insertError) throw insertError

      logger.info('Model saved successfully')
    } catch (error) {
      logger.error('Failed to save model:', error)
      captureException(error as Error)
      throw error
    }
  }

  /**
   * Trains the model on provided data.
   * @param data - Training data tensor
   * @param labels - Training labels tensor
   * @param epochs - Number of training epochs
   * @returns Training history
   * @throws {Error} If training fails
   */
  async train(data: number[], labels: number[], epochs: number = 10): Promise<History> {
    if (!this.model) {
      throw new Error('Model not initialized')
    }

    try {
      const timer = mlPredictionDuration.startTimer()
      const trainData = tensor(data)
      const trainLabels = tensor(labels)

      try {
        const history = await this.model.fit(trainData, trainLabels, {
          epochs,
          callbacks: {
            onEpochEnd: this.onEpochEnd.bind(this),
          },
        })
        timer({ success: true })
        return history
      } catch (error) {
        timer({ success: false })
        throw error
      } finally {
        trainData.dispose()
        trainLabels.dispose()
      }
    } catch (error) {
      logger.error('Training failed:', error)
      captureException(error as Error)
      throw error
    }
  }

  /**
   * Makes predictions using the trained model.
   * @param input - Input tensor
   * @returns Prediction tensor
   * @throws {Error} If prediction fails or model is not initialized
   */
  async predict(input: number[]): Promise<number[]> {
    try {
      if (!this.model) {
        throw new Error('Model not initialized')
      }

      const timer = mlPredictionDuration.startTimer()
      const inputTensor = tensor(input)

      try {
        const prediction = this.model.predict(inputTensor) as Tensor<Rank>
        const result = Array.from(prediction.dataSync())

        // Cleanup tensors
        inputTensor.dispose()
        prediction.dispose()

        timer({ success: true })
        return result
      } catch (error) {
        timer({ success: false })
        throw error
      }
    } catch (error) {
      logger.error('Prediction failed:', error)
      captureException(error as Error)
      throw error
    }
  }

  /**
   * Retrieves training history from Supabase.
   * @returns Array of training metrics
   */
  async getTrainingHistory(): Promise<unknown[]> {
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('training_metrics')
        .select('*')
        .gte('timestamp', weekAgo.toISOString())

      if (error) throw error
      return data || []
    } catch (error) {
      logger.error('Failed to get training history:', error)
      captureException(error as Error)
      throw error
    }
  }

  /**
   * Cleans up resources used by the MLService.
   */
  cleanup(): void {
    try {
      if (this.model) {
        this.model.dispose()
        this.model = null
      }

      // Force garbage collection of tensors
      dispose()

      logger.info('MLService cleanup complete', {
        memoryInfo: this.getMemoryInfo(),
      })
    } catch (error) {
      logger.error('Cleanup failed:', error)
      captureException(error as Error)
    }
  }

  getMemoryInfo() {
    return {
      ...memory(),
      timestamp: new Date().toISOString(),
    }
  }

  onEpochEnd(epoch: number, logs?: Logs) {
    if (!logs) return

    const { error } = supabase.from('training_metrics').insert({
      epoch,
      loss: logs.loss,
      val_loss: logs.val_loss,
      accuracy: logs.acc,
      val_accuracy: logs.val_acc,
      timestamp: new Date().toISOString(),
    })

    if (error) throw error
  }
}
