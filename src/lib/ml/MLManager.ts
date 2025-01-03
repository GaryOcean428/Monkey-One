import * as tf from '@tensorflow/tfjs'
import { supabase } from '../supabase/client'

export class MLManager {
  constructor() {
    this.initializeInfrastructure()
  }

  private async initializeInfrastructure() {
    await this.setupDatabase()
    await this.setupModelStorage()
  }

  private async setupDatabase() {
    // Create ML-related tables using Supabase
    const { error } = await supabase.rpc('setup_ml_tables', {
      query: `
        CREATE TABLE IF NOT EXISTS ml_models (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          version VARCHAR(50) NOT NULL,
          architecture JSONB,
          metrics JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS training_metrics (
          id SERIAL PRIMARY KEY,
          model_id INTEGER REFERENCES ml_models(id),
          epoch INTEGER,
          loss FLOAT,
          accuracy FLOAT,
          metrics JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS embeddings (
          id SERIAL PRIMARY KEY,
          vector FLOAT[],
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS model_cache (
          cache_key TEXT PRIMARY KEY,
          model_json JSONB,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
    })

    if (error) {
      console.error('Error setting up database:', error)
      throw error
    }
  }

  private async setupModelStorage() {
    // Ensure storage buckets exist
    const { error: storageError } = await supabase.storage.createBucket('ml-models', {
      public: false,
      allowedMimeTypes: ['application/json'],
    })

    if (storageError && storageError.message !== 'Bucket already exists') {
      console.error('Error setting up storage:', storageError)
      throw storageError
    }
  }

  async saveModel(model: tf.LayersModel, name: string, version: string) {
    try {
      // Save model architecture and weights
      const modelArtifacts = await model.save('indexeddb://temp')
      const modelJson = JSON.stringify(modelArtifacts)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('ml-models')
        .upload(`${name}/${version}/model.json`, new Blob([modelJson]), {
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Save model metadata to Supabase database
      const { error: dbError } = await supabase.from('ml_models').insert({
        name,
        version,
        architecture: model.toJSON(),
        metrics: {},
      })

      if (dbError) throw dbError
    } catch (error) {
      console.error('Error saving model:', error)
      throw error
    }
  }

  async loadModel(name: string, version: string): Promise<tf.LayersModel> {
    try {
      // Check if model exists in cache
      const cacheKey = `model:${name}:${version}`
      const { data: cachedModel } = await supabase
        .from('model_cache')
        .select('model_json')
        .eq('cache_key', cacheKey)
        .single()

      if (cachedModel) {
        return tf.loadLayersModel(tf.io.fromMemory(JSON.parse(cachedModel.model_json)))
      }

      // Load from storage
      const { data, error } = await supabase.storage
        .from('ml-models')
        .download(`${name}/${version}/model.json`)

      if (error) throw error

      const modelJson = await data.text()
      const model = await tf.loadLayersModel(tf.io.fromMemory(JSON.parse(modelJson)))

      // Cache model
      const { error: cacheError } = await supabase.from('model_cache').upsert({
        cache_key: cacheKey,
        model_json: model.toJSON(),
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      })

      if (cacheError) {
        console.warn('Failed to cache model:', cacheError)
        // Don't throw error as the model is still loaded successfully
      }

      return model
    } catch (error) {
      console.error('Error loading model:', error)
      throw error
    }
  }

  async recordTrainingMetrics(modelId: number, epoch: number, metrics: Record<string, number>) {
    try {
      const { error } = await supabase.from('training_metrics').insert({
        model_id: modelId,
        epoch,
        loss: metrics.loss,
        accuracy: metrics.accuracy,
        metrics,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error recording metrics:', error)
      throw error
    }
  }

  async cleanup() {
    // No cleanup needed for Supabase connections
  }
}
