import * as tf from '@tensorflow/tfjs';
import { memoryManager } from '../memory';
import type { NeuralArchitecture, TrainingMetrics } from '@/types';

export class NeuralCore {
  private model: tf.LayersModel | null = null;
  private architecture: NeuralArchitecture;
  private trainingHistory: TrainingMetrics[] = [];
  private readonly BATCH_SIZE = 32;
  private readonly LEARNING_RATE = 0.001;
  private modelInitialized = false;
  private memoryOptimized = false;

  constructor() {
    this.architecture = {
      inputDim: 512,
      hiddenLayers: [256, 128, 64],
      outputDim: 512,
      activations: ['relu', 'relu', 'relu', 'tanh']
    };
  }

  async initialize(): Promise<void> {
    if (this.modelInitialized) return;

    // Enable memory optimization
    if (!this.memoryOptimized) {
      tf.enableProdMode(); // Disable debug mode
      const env = tf.env();
      env.set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0); // Aggressive texture cleanup
      env.set('WEBGL_FORCE_F16_TEXTURES', true); // Use 16-bit floats
      this.memoryOptimized = true;
    }

    await tf.ready();
    this.model = this.buildModel();
    await this.loadPretrainedWeights();
    this.modelInitialized = true;
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();

    // Use tf.tidy to automatically clean up intermediate tensors
    return tf.tidy(() => {
      // Input layer
      model.add(tf.layers.dense({
        units: this.architecture.hiddenLayers[0],
        inputShape: [this.architecture.inputDim],
        activation: this.architecture.activations[0],
        kernelInitializer: 'glorotNormal'
      }));

      // Hidden layers with dropout for regularization
      for (let i = 1; i < this.architecture.hiddenLayers.length; i++) {
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({
          units: this.architecture.hiddenLayers[i],
          activation: this.architecture.activations[i],
          kernelInitializer: 'glorotNormal'
        }));
      }

      // Output layer
      model.add(tf.layers.dense({
        units: this.architecture.outputDim,
        activation: this.architecture.activations[this.architecture.activations.length - 1]
      }));

      model.compile({
        optimizer: tf.train.adam(this.LEARNING_RATE),
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });

      return model;
    });
  }

  async learn(input: tf.Tensor, target: tf.Tensor): Promise<TrainingMetrics> {
    if (!this.model || !this.modelInitialized) {
      throw new Error('Model not initialized');
    }

    // Use tf.tidy for automatic memory management
    const metrics = await tf.tidy(async () => {
      const result = await this.model!.fit(input, target, {
        epochs: 1,
        batchSize: this.BATCH_SIZE,
        validationSplit: 0.1,
        shuffle: true
      });

      const metrics: TrainingMetrics = {
        loss: result.history.loss[0],
        accuracy: result.history.acc[0],
        epoch: this.trainingHistory.length + 1,
        timestamp: Date.now()
      };

      this.trainingHistory.push(metrics);
      await this.saveProgress(metrics);

      return metrics;
    });

    // Force garbage collection after training
    if (tf.memory().numTensors > 1000) {
      tf.disposeVariables();
      await tf.nextFrame(); // Wait for GC
    }

    return metrics;
  }

  async predict(input: tf.Tensor): Promise<tf.Tensor> {
    if (!this.model || !this.modelInitialized) {
      throw new Error('Model not initialized');
    }

    // Use tf.tidy for prediction
    return tf.tidy(() => this.model!.predict(input) as tf.Tensor);
  }

  private async loadPretrainedWeights(): Promise<void> {
    try {
      const weights = await memoryManager.search('neural_weights', {
        limit: 1,
        useSemanticSearch: false // Disable for performance
      });

      if (weights.length > 0) {
        const weightData = JSON.parse(weights[0].content);
        await this.model?.loadWeights(weightData);
      }
    } catch (error) {
      console.warn('No pre-trained weights found, starting fresh');
    }
  }

  private async saveProgress(metrics: TrainingMetrics): Promise<void> {
    // Only save periodically to reduce I/O
    if (metrics.epoch % 10 === 0) {
      await memoryManager.add({
        type: 'training_progress',
        content: JSON.stringify(metrics),
        tags: ['neural', 'training', 'metrics']
      });

      // Save weights periodically
      if (metrics.epoch % 100 === 0) {
        const weights = await this.model?.getWeights();
        if (weights) {
          await memoryManager.add({
            type: 'neural_weights',
            content: JSON.stringify(weights),
            tags: ['neural', 'weights', `epoch_${metrics.epoch}`]
          });
        }
      }
    }
  }

  cleanup(): void {
    // Clean up resources
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    tf.disposeVariables();
    this.modelInitialized = false;
  }

  getArchitecture(): NeuralArchitecture {
    return { ...this.architecture };
  }

  getTrainingHistory(): TrainingMetrics[] {
    // Return only recent history to save memory
    return this.trainingHistory.slice(-100);
  }
}