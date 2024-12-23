import { NeuralCore } from '../evolution/NeuralCore';
import { logger } from '../../utils/logger';
import { mlPredictionDuration } from '../../utils/metrics';
import { captureException } from '../../utils/sentry';

/**
 * Interface defining the structure of neural processing metrics
 */
export interface NeuralMetrics {
  /** The current neural network architecture configuration */
  architecture: unknown;
  /** Performance metrics from the last training or prediction */
  performance: unknown;
  /** Current evolution stage of the neural network (0-1) */
  evolutionStage: number;
}

/**
 * NeuralProcessor handles all neural network operations including
 * predictions, training, and evolution of the network architecture.
 */
export class NeuralProcessor {
  private neuralCore: NeuralCore;

  /**
   * Creates a new instance of NeuralProcessor
   */
  constructor() {
    this.neuralCore = new NeuralCore();
  }

  /**
   * Initializes the neural processor and its underlying neural core.
   * @throws {Error} If initialization fails
   */
  public async initialize(): Promise<void> {
    try {
      await this.neuralCore.initialize();
      logger.info('Neural processor initialized');
    } catch (error) {
      logger.error('Failed to initialize neural processor:', error);
      captureException(error as Error);
      throw error;
    }
  }

  /**
   * Processes an input through the neural network.
   * 
   * @param input - The input string to process
   * @returns Promise resolving to prediction results and metrics
   * @throws {Error} If processing fails
   */
  public async process(input: string): Promise<{
    prediction: unknown;
    metrics: NeuralMetrics;
  }> {
    const startTime = Date.now();
    try {
      const prediction = await this.neuralCore.predict(input);
      const metrics = await this.getNeuralMetrics();

      // Record processing duration
      mlPredictionDuration.observe(
        { model: 'neural_core', type: 'prediction' },
        Date.now() - startTime
      );

      return { prediction, metrics };
    } catch (error) {
      logger.error('Neural processing failed:', error);
      captureException(error as Error, { input });
      throw error;
    }
  }

  /**
   * Gets current metrics from the neural core.
   * @returns Promise resolving to neural metrics
   */
  private async getNeuralMetrics(): Promise<NeuralMetrics> {
    const architecture = this.neuralCore.getArchitecture();
    const trainingHistory = this.neuralCore.getTrainingHistory();
    
    return {
      architecture,
      performance: trainingHistory[trainingHistory.length - 1] || null,
      evolutionStage: this.calculateEvolutionStage(trainingHistory)
    };
  }

  /**
   * Calculates the current evolution stage based on recent performance.
   * 
   * @param history - Array of historical performance metrics
   * @returns Number between 0 and 1 indicating evolution stage
   */
  private calculateEvolutionStage(history: any[]): number {
    if (history.length === 0) return 0;
    
    const recentPerformance = history.slice(-100);
    const averageAccuracy = recentPerformance.reduce(
      (acc, m) => acc + m.accuracy, 0
    ) / recentPerformance.length;

    return Math.min(1, averageAccuracy);
  }

  /**
   * Cleans up resources used by the neural processor.
   */
  public cleanup(): void {
    this.neuralCore.cleanup();
  }
}
