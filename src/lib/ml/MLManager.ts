import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { app } from '../firebase/firebase';
import * as tf from '@tensorflow/tfjs';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { Sequelize } from 'sequelize';

export class MLManager {
  private storage = getStorage(app);
  private firestore = getFirestore(app);
  private redis: Redis;
  private pgPool: Pool;
  private sequelize: Sequelize;

  constructor() {
    // Initialize Redis
    this.redis = new Redis({
      host: import.meta.env.VITE_REDIS_HOST,
      port: parseInt(import.meta.env.VITE_REDIS_PORT),
      password: import.meta.env.VITE_REDIS_PASSWORD
    });

    // Initialize PostgreSQL pool
    this.pgPool = new Pool({
      user: import.meta.env.VITE_PG_USER,
      host: import.meta.env.VITE_PG_HOST,
      database: import.meta.env.VITE_PG_DATABASE,
      password: import.meta.env.VITE_PG_PASSWORD,
      port: parseInt(import.meta.env.VITE_PG_PORT)
    });

    // Initialize Sequelize
    this.sequelize = new Sequelize(
      import.meta.env.VITE_PG_DATABASE,
      import.meta.env.VITE_PG_USER,
      import.meta.env.VITE_PG_PASSWORD,
      {
        host: import.meta.env.VITE_PG_HOST,
        dialect: 'postgres',
        logging: false
      }
    );

    this.initializeInfrastructure();
  }

  private async initializeInfrastructure() {
    await this.setupDatabase();
    await this.setupCaching();
    await this.setupModelStorage();
  }

  private async setupDatabase() {
    // Create ML-related tables
    await this.sequelize.query(`
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
    `);
  }

  private async setupCaching() {
    // Set up Redis cache structure
    await this.redis.config('SET', 'maxmemory', '2gb');
    await this.redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
  }

  private async setupModelStorage() {
    // Create storage buckets for model artifacts
    const modelBucket = this.storage.ref('ml-models');
    const checkpointBucket = this.storage.ref('model-checkpoints');
    
    await modelBucket.listAll();
    await checkpointBucket.listAll();
  }

  async saveModel(model: tf.LayersModel, name: string, version: string) {
    // Save model architecture and weights
    const modelArtifacts = await model.save('indexeddb://temp');
    const modelRef = this.storage.ref(`ml-models/${name}/${version}`);
    
    await modelRef.put(new Blob([JSON.stringify(modelArtifacts)]));

    // Save model metadata to PostgreSQL
    await this.sequelize.models.ml_models.create({
      name,
      version,
      architecture: model.toJSON(),
      metrics: {}
    });
  }

  async loadModel(name: string, version: string): Promise<tf.LayersModel> {
    // Try cache first
    const cacheKey = `model:${name}:${version}`;
    const cachedModel = await this.redis.get(cacheKey);
    
    if (cachedModel) {
      return tf.loadLayersModel(tf.io.fromMemory(JSON.parse(cachedModel)));
    }

    // Load from storage
    const modelRef = this.storage.ref(`ml-models/${name}/${version}`);
    const modelBlob = await modelRef.getDownloadURL();
    const model = await tf.loadLayersModel(modelBlob);

    // Cache model
    await this.redis.set(
      cacheKey,
      JSON.stringify(model.toJSON()),
      'EX',
      3600 // 1 hour
    );

    return model;
  }

  async recordTrainingMetrics(
    modelId: number,
    epoch: number,
    metrics: Record<string, number>
  ) {
    await this.sequelize.models.training_metrics.create({
      model_id: modelId,
      epoch,
      loss: metrics.loss,
      accuracy: metrics.accuracy,
      metrics
    });
  }

  async cleanup() {
    await this.redis.quit();
    await this.pgPool.end();
    await this.sequelize.close();
  }
}