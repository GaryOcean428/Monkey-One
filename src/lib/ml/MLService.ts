import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebase/config';
import * as tf from '@tensorflow/tfjs';
import type { ModelArtifacts } from '@tensorflow/tfjs-core/dist/io/types';

export class MLService {
  private storage = getStorage(app);
  private firestore = getFirestore(app);
  private model: tf.LayersModel | null = null;

  async initialize() {
    await tf.ready();
    
    // Load or create model
    try {
      this.model = await this.loadModel();
    } catch (error) {
      console.warn('No existing model found, creating new one');
      this.model = this.createModel();
      await this.saveModel();
    }
  }

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

  private async loadModel(): Promise<tf.LayersModel> {
    // Try to load from Firebase Storage
    const modelRef = this.getModelRef('ml-models/latest');
    const modelUrl = await getDownloadURL(modelRef);
    return await tf.loadLayersModel(modelUrl);
  }

  private getModelRef(path: string) {
    return ref(this.storage, path);
  }

  private async saveModel() {
    if (!this.model) {
      return;
    }

    const modelArtifacts = await this.model.save(tf.io.withSaveHandler(async (artifacts: ModelArtifacts) => {
      const modelRef = this.getModelRef('ml-models/latest');
      await uploadBytes(modelRef, new Blob([JSON.stringify(artifacts)]));
      
      // Calculate size for weight data considering it might be an array
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
  }

  async train(data: tf.Tensor, labels: tf.Tensor, epochs: number = 10) {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const history = await this.model.fit(data, labels, {
      epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          // Save training metrics
          await addDoc(collection(this.firestore, 'training-metrics'), {
            epoch,
            ...logs,
            timestamp: new Date()
          });
        }
      }
    });

    // Save updated model
    await this.saveModel();
    return history;
  }

  async predict(input: tf.Tensor): Promise<tf.Tensor> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }
    return this.model.predict(input) as tf.Tensor;
  }

  async getTrainingHistory() {
    const metricsRef = collection(this.firestore, 'training-metrics');
    const q = query(metricsRef, where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  cleanup() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    tf.disposeVariables();
  }
}
