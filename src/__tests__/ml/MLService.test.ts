import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MLService } from '../../lib/ml/MLService';
import * as tf from '@tensorflow/tfjs';
import { app, database } from '@/lib/firebase/config';

// Mock Firebase
vi.mock('@/lib/firebase/config', () => ({
  app: {
    name: '[DEFAULT]',
    options: {
      projectId: 'test-project',
      databaseURL: 'https://test-project.firebaseio.com'
    }
  },
  database: {
    ref: vi.fn(() => ({
      push: vi.fn().mockResolvedValue({ key: 'test-key' }),
      set: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue({
        exists: () => true,
        val: () => ({ data: 'test-data' })
      })
    }))
  }
}));

describe('MLService', () => {
  let mlService: MLService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mlService = new MLService();
    await mlService.initialize();
  });

  afterEach(async () => {
    mlService.cleanup();
  });

  it('should initialize successfully', () => {
    expect(mlService['model']).toBeDefined();
  });

  it('should create a model with the correct architecture', () => {
    const model = mlService['model'];
    expect(model?.layers.length).toBeGreaterThan(0);
  });

  it('should handle training with valid data', async () => {
    const data = tf.tensor2d([[1, 2], [3, 4]], [2, 2]);
    const labels = tf.tensor2d([[1], [0]], [2, 1]);

    const history = await mlService.train(data, labels, 1);
    expect(history).toBeDefined();
    expect(history.history).toBeDefined();
  });

  it('should throw error when predicting without initialization', async () => {
    const uninitializedService = new MLService();
    const input = tf.tensor2d([[1, 2]], [1, 2]);

    await expect(uninitializedService.predict(input)).rejects.toThrow('Model not initialized');
  });

  it('should save model successfully', async () => {
    const uploadBytesSpy = vi.spyOn(mlService['storage'], 'uploadBytes');
    await mlService['saveModel']();
    expect(uploadBytesSpy).toHaveBeenCalled();
  });

  it('should get training history', async () => {
    const history = await mlService.getTrainingHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});
