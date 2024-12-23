import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MLService } from '../../lib/ml/MLService';
import * as tf from '@tensorflow/tfjs';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn()
  })),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn()
  })),
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn()
}));

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn().mockResolvedValue(true),
  sequential: vi.fn(() => ({
    add: vi.fn(),
    compile: vi.fn(),
    fit: vi.fn().mockResolvedValue({ history: { loss: [0.1] } }),
    predict: vi.fn(() => tf.tensor2d([[0.5]], [1, 1])),
    save: vi.fn().mockResolvedValue(undefined),
    loadLayersModel: vi.fn()
  })),
  layers: {
    dense: vi.fn(() => ({ apply: vi.fn() })),
    dropout: vi.fn(() => ({ apply: vi.fn() }))
  },
  tensor2d: vi.fn((data) => ({
    data,
    dataSync: vi.fn(() => data),
    dispose: vi.fn()
  }))
}));

describe('MLService', () => {
  let mlService: MLService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mlService = new MLService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize successfully', async () => {
    await mlService.initialize();
    expect(mlService).toBeDefined();
  });

  it('should create a model with the correct architecture', async () => {
    await mlService.initialize();
    expect(tf.sequential).toHaveBeenCalled();
  });

  it('should handle training with valid data', async () => {
    await mlService.initialize();
    const data = tf.tensor2d([[1, 2], [3, 4]], [2, 2]);
    const labels = tf.tensor2d([[1], [0]], [2, 1]);

    const result = await mlService.train(data, labels);
    expect(result.history.loss).toBeDefined();
  });

  it('should throw error when predicting without initialization', async () => {
    const input = tf.tensor2d([[1, 2]], [1, 2]);
    await expect(mlService.predict(input)).rejects.toThrow();
  });

  it('should save model successfully', async () => {
    await mlService.initialize();
    await expect(mlService.saveModel()).resolves.not.toThrow();
  });

  it('should get training history', async () => {
    await mlService.initialize();
    const data = tf.tensor2d([[1, 2]], [1, 2]);
    const labels = tf.tensor2d([[1]], [1, 1]);
    await mlService.train(data, labels);
    
    const history = mlService.getTrainingHistory();
    expect(history).toBeDefined();
  });
});
