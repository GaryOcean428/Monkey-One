import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebase/config';
import * as tf from '@tensorflow/tfjs-core/dist/io/types';
import { logger } from '../../utils/logger';
import { captureException } from '../../utils/sentry';
import { mlPredictionDuration } from '../../utils/metrics';

/**
 * MLService handles machine learning operations including model management,
 * training, and predictions. It integrates with Firebase for model storage
 * and metrics tracking.
 */
export class MLService {
  private storage = getStorage(app);
  private firestore = getFirestore(app);
  private model: tf.LayersModel | null = null;

  /**
   * Initializes the MLService by loading or creating a model.
   * @throws {Error} If initialization fails
   */
  async initialize(): Promise<void> {
    try {
      await tf.ready();
      logger.info('TensorFlow.js initialized');
      
      // Load or create model
      try {
        this.model = await this.loadModel();
        logger.info('Model loaded successfully');
      } catch (error) {
        logger.warn('No existing model found, creating new one');
        this.model = this.createModel();
        await this.saveModel();
      }
    } catch (error) {
      logger.error('Failed to initialize MLService:', error);
      captureException(error as Error);
      throw error;
    }
  }

  /**
   * Creates a new neural network model with predefined architecture.
   * @returns A new TensorFlow.js LayersModel
   */
  private createModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 256, activation: 'relu', inputShape: [512] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'tanh' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Loads a model from Firebase Storage.
   * @returns Promise resolving to the loaded model
   * @throws {Error} If model loading fails
   */
  private async loadModel(): Promise<tf.LayersModel> {
    try {
      const modelRef = this.getModelRef('ml-models/latest');
      const modelUrl = await getDownloadURL(modelRef);
      return await tf.loadLayersModel(modelUrl);
    } catch (error) {
      logger.error('Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Gets a reference to a model in Firebase Storage.
   * @param path - Path to the model in storage
   * @returns Storage reference
   */
  private getModelRef(path: string) {
    return ref(this.storage, path);
  }

  /**
   * Saves the current model to Firebase Storage and records metadata.
   * @throws {Error} If saving fails
   */
  private async saveModel(): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }

    try {
      const modelArtifacts = await this.model.save(tf.io.withSaveHandler(async (artifacts: ModelArtifacts) => {
        const modelRef = this.getModelRef('ml-models/latest');
        await uploadBytes(modelRef, new Blob([JSON.stringify(artifacts)]));
        
        let weightDataBytes = 0;
        if (artifacts.weightData) {
          if (artifacts.weightData instanceof ArrayBuffer) {
            weightDataBytes = artifacts.weightData.byteLength;
          } else if (Array.isArray(artifacts.weightData)) {
            weightDataBytes = artifacts.weightData.reduce((total, buffer) => total + buffer.byteLength, 0);
          }
        }

        return {
          modelArtifactsInfo: {
            dateSaved: new Date(),
            modelTopologyType: 'JSON',
            modelTopologyBytes: artifacts.modelTopology ? JSON.stringify(artifacts.modelTopology).length : 0,
            weightSpecsBytes: artifacts.weightSpecs ? JSON.stringify(artifacts.weightSpecs).length : 0,
            weightDataBytes
          }
        };
      }));

      // Save metadata to Firestore
      await addDoc(collection(this.firestore, 'ml-models'), {
        version: 'latest',
        architecture: this.model.toJSON(),
        savedAt: new Date(),
        metrics: modelArtifacts.modelArtifactsInfo
      });

      logger.info('Model saved successfully');
    } catch (error) {
      logger.error('Failed to save model:', error);
      captureException(error as Error);
      throw error;
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
  async train(data: tf.Tensor, labels: tf.Tensor, epochs: number = 10): Promise<tf.History> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const startTime = Date.now();
    try {
      const history = await this.model.fit(data, labels, {
        epochs,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            await addDoc(collection(this.firestore, 'training-metrics'), {
              epoch,
              ...logs,
              timestamp: new Date()
            });
          }
        }
      });

      mlPredictionDuration.observe(
        { model: 'neural_core', type: 'training' },
        Date.now() - startTime
      );

      await this.saveModel();
      return history;
    } catch (error) {
      logger.error('Training failed:', error);
      captureException(error as Error);
      throw error;
    }
  }

  /**
   * Makes predictions using the trained model.
   * @param input - Input tensor
   * @returns Prediction tensor
   * @throws {Error} If prediction fails or model is not initialized
   */
  async predict(input: tf.Tensor): Promise<tf.Tensor> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const startTime = Date.now();
    try {
      const prediction = this.model.predict(input) as tf.Tensor;
      
      mlPredictionDuration.observe(
        { model: 'neural_core', type: 'prediction' },
        Date.now() - startTime
      );

      return prediction;
    } catch (error) {
      logger.error('Prediction failed:', error);
      captureException(error as Error);
      throw error;
    }
  }

  /**
   * Retrieves training history from Firestore.
   * @returns Array of training metrics
   */
  async getTrainingHistory(): Promise<unknown[]> {
    try {
      const metricsRef = collection(this.firestore, 'training-metrics');
      const q = query(metricsRef, where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Failed to get training history:', error);
      captureException(error as Error);
      throw error;
    }
  }

  /**
   * Cleans up resources used by the MLService.
   */
  cleanup(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    tf.disposeVariables();
    logger.info('MLService cleanup complete');
  }
}
