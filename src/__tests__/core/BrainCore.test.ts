import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BrainCore } from '../../lib/core/BrainCore';
import * as tf from '@tensorflow/tfjs';
import { EventEmitter } from 'events';

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', async () => {
  const actual = await vi.importActual('@tensorflow/tfjs');
  return {
    ...actual,
    setBackend: vi.fn(),
    ready: vi.fn().mockResolvedValue(true),
    sequential: vi.fn(() => ({
      add: vi.fn(),
      compile: vi.fn(),
      predict: vi.fn(() => ({
        dataSync: () => [0.5, 0.3, 0.2],
        dispose: vi.fn()
      })),
      fit: vi.fn(() => Promise.resolve({ history: { loss: [0.1] } })),
      dispose: vi.fn()
    })),
    layers: {
      dense: vi.fn(() => ({ apply: vi.fn() }))
    },
    tensor: vi.fn((data) => ({
      data,
      dataSync: vi.fn(() => data),
      dispose: vi.fn()
    })),
    dispose: vi.fn(),
    tidy: vi.fn((fn) => fn()),
    enableProdMode: vi.fn(),
    env: vi.fn(() => ({
      set: vi.fn(),
      getBool: vi.fn().mockReturnValue(true),
      getNumber: vi.fn().mockReturnValue(1)
    })),
  };
});

describe('BrainCore', () => {
  let brainCore: BrainCore;

  beforeEach(async () => {
    brainCore = new BrainCore();
    await brainCore.initializeBrain();
  });

  afterEach(() => {
    brainCore.cleanup();
    vi.clearAllMocks();
  });

  it('should initialize successfully', () => {
    expect(brainCore).toBeInstanceOf(EventEmitter);
    expect(brainCore.getState()).toBeDefined();
  });

  it('should process input and return valid response', async () => {
    const input = 'Test input';
    const response = await brainCore.process(input);

    expect(response).toHaveProperty('response');
    expect(response).toHaveProperty('emotionalContext');
    expect(response).toHaveProperty('neuralMetrics');
  });

  it('should emit learning event during background learning', async () => {
    const learningListener = vi.fn();
    brainCore.on('learning', learningListener);

    // Trigger background learning
    await brainCore['performBackgroundLearning']();

    expect(learningListener).toHaveBeenCalled();
  });

  it('should update active regions correctly', () => {
    brainCore['state'].isLearning = true;
    brainCore['updateActiveRegions']();

    const activeRegions = brainCore['state'].activeRegions;
    expect(activeRegions).toContain('hippocampus');
    expect(activeRegions).toContain('cortex');
  });

  it('should calculate evolution stage correctly', () => {
    const mockHistory = [
      { accuracy: 0.5 },
      { accuracy: 0.6 },
      { accuracy: 0.7 }
    ];

    const stage = brainCore['calculateEvolutionStage'](mockHistory);
    expect(stage).toBeLessThanOrEqual(1);
    expect(stage).toBeGreaterThan(0);
  });

  it('should store interaction successfully', async () => {
    const input = 'Test input';
    const personalityResponse = {
      response: 'Test response',
      emotionalContext: { valence: 0.5 }
    };
    const neuralMetrics = { architecture: {}, performance: {} };

    await brainCore['storeInteraction'](input, personalityResponse, neuralMetrics);
    // Verify interaction was stored - we could add a mock here to verify the call
  });

  it('should handle background learning', async () => {
    const learningPromise = brainCore.learn();
    await expect(learningPromise).resolves.not.toThrow();
  });

  it('should update neural weights', async () => {
    const weights = await brainCore.getWeights();
    expect(weights).toBeDefined();
    expect(Array.isArray(weights)).toBe(true);
  });

  it('should cleanup resources properly', async () => {
    await brainCore.dispose();
    expect(brainCore.isInitialized()).toBe(false);
  });
});
