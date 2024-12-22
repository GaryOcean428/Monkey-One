import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MLService } from '../../lib/ml/MLService';
import * as tf from '@tensorflow/tfjs';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn()
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn()
}));

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn().mockResolvedValue(undefined),
  sequential: vi.fn().mockReturnValue({
    compile: vi.fn(),
    fit: vi.fn(),
    predict: vi.fn(),
    save: vi.fn(),
    dispose: vi.fn(),
    toJSON: vi.fn()
  }),
  layers: {
    dense: vi.fn(),
    dropout: vi.fn()
  },
  train: {
    adam: vi.fn()
  },
  loadLayersModel: vi.fn(),
  tensor: vi.fn(),
  ones: vi.fn().mockReturnValue({
    shape: [1, 512]
  }),
  io: {
    withSaveHandler: vi.fn(handler => handler)
  },
  Tensor: vi.fn(),
  disposeVariables: vi.fn()
}));

describe('MLService', () => {
  let mlService: MLService;

  beforeEach(() => {
    vi.clearAllMocks();
    mlService = new MLService();
  });

  describe('initialization', () => {
    it('should initialize successfully with new model when no model exists', async () => {
      (getDownloadURL as vi.Mock).mockRejectedValueOnce(new Error('No model found'));
      
      await mlService.initialize();
      
      expect(tf.sequential).toHaveBeenCalled();
      expect(tf.loadLayersModel).toHaveBeenCalled();
    });

    it('should load existing model when available', async () => {
      (getDownloadURL as vi.Mock).mockResolvedValueOnce('model-url');
      (tf.loadLayersModel as vi.Mock).mockResolvedValueOnce({
        compile: vi.fn(),
        predict: vi.fn(),
        dispose: vi.fn()
      });

      await mlService.initialize();

      expect(tf.loadLayersModel).toHaveBeenCalledWith('model-url');
      expect(tf.sequential).not.toHaveBeenCalled();
    });
  });

  describe('model operations', () => {
    beforeEach(async () => {
      await mlService.initialize();
    });

    it('should save model to Firebase Storage with correct artifacts', async () => {
      const mockModelArtifacts = {
        modelTopology: { layers: [] },
        weightSpecs: [],
        weightData: new ArrayBuffer(100)
      };

      (tf.sequential as vi.Mock).mockReturnValueOnce({
        save: vi.fn().mockResolvedValueOnce(mockModelArtifacts),
        toJSON: vi.fn().mockReturnValue({ config: {} })
      });

      await mlService['saveModel']();

      expect(uploadBytes).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
    });

    it('should return expected tensor output when predicting with valid input', async () => {
      const mockInput = tf.ones([1, 512]);
      const mockOutput = {
        shape: [1, 32],
        dataSync: vi.fn().mockReturnValue(new Float32Array(32))
      };

      (tf.sequential as vi.Mock).mockReturnValueOnce({
        predict: vi.fn().mockReturnValue(mockOutput)
      });

      const output = await mlService.predict(mockInput);

      expect(output).toBeDefined();
      expect(output.shape).toEqual([1, 32]);
    });

    it('should execute training and save metrics', async () => {
      const mockHistory = {
        history: {
          loss: [0.5, 0.3],
          accuracy: [0.8, 0.9]
        }
      };

      const mockModel = {
        fit: vi.fn().mockResolvedValueOnce(mockHistory),
        save: vi.fn(),
        toJSON: vi.fn()
      };

      (tf.sequential as vi.Mock).mockReturnValueOnce(mockModel);

      const mockData = tf.tensor([1, 2, 3]);
      const mockLabels = tf.tensor([1, 2, 3]);

      const history = await mlService.train(mockData, mockLabels);

      expect(history).toBe(mockHistory);
      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should dispose model and variables', () => {
      mlService.cleanup();
      expect(tf.disposeVariables).toHaveBeenCalled();
    });
  });
});
