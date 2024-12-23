import { EventEmitter } from 'events';
import { PersonalityCore } from './PersonalityCore';
import { ActivityMonitor } from './ActivityMonitor';
import { NeuralProcessor } from './NeuralProcessor';
import { memoryManager } from '../memory';
import { logger } from '../../utils/logger';
import { captureException } from '../../utils/sentry';

/**
 * BrainCore is the central processing unit of the AI system.
 * It coordinates between different specialized components like the PersonalityCore,
 * ActivityMonitor, and NeuralProcessor to process inputs and generate responses.
 * 
 * @extends EventEmitter
 */
export class BrainCore extends EventEmitter {
  private personalityCore: PersonalityCore;
  private activityMonitor: ActivityMonitor;
  private neuralProcessor: NeuralProcessor;

  /**
   * Creates a new instance of BrainCore.
   * Initializes all core components and starts the brain initialization process.
   */
  constructor() {
    super();
    this.personalityCore = new PersonalityCore();
    this.activityMonitor = new ActivityMonitor();
    this.neuralProcessor = new NeuralProcessor();
    
    this.initializeBrain().catch(error => {
      logger.error('Failed to initialize brain:', error);
      captureException(error);
    });
  }

  /**
   * Initializes the brain by setting up the neural processor and event handlers.
   * @throws {Error} If initialization fails
   */
  private async initializeBrain(): Promise<void> {
    try {
      await this.neuralProcessor.initialize();
      this.registerEventHandlers();
      logger.info('Brain initialized successfully');
    } catch (error) {
      logger.error('Brain initialization failed:', error);
      captureException(error as Error);
      throw error;
    }
  }

  /**
   * Sets up event handlers for brain activities.
   * Primarily handles idle state to trigger background learning.
   */
  private registerEventHandlers(): void {
    this.activityMonitor.on('idle', () => {
      this.performBackgroundLearning().catch(error => {
        logger.error('Background learning failed:', error);
        captureException(error);
      });
    });
  }

  /**
   * Performs background learning when the system is idle.
   * This helps improve system performance over time.
   */
  private async performBackgroundLearning(): Promise<void> {
    if (!this.activityMonitor.getState().isLearning) {
      this.activityMonitor.recordActivity('learning');
      await this.neuralProcessor.process('background_learning');
      this.emit('learningComplete');
    }
  }

  /**
   * Processes an input through the brain's components.
   * 
   * @param input - The input string to process
   * @param userId - Optional user identifier for personalization
   * @returns Promise resolving to the processed response with emotional context and neural metrics
   * @throws {Error} If processing fails
   */
  public async process(input: string, userId?: string): Promise<{
    response: string;
    emotionalContext: unknown;
    neuralMetrics: unknown;
  }> {
    try {
      this.activityMonitor.recordActivity('processing');
      logger.debug('Processing input:', { input, userId });

      const personalityResponse = await this.personalityCore.processInteraction(
        input,
        userId || 'anonymous'
      );

      const { prediction, metrics } = await this.neuralProcessor.process(input);

      await this.storeInteraction(input, personalityResponse, metrics);

      logger.debug('Processing complete', { userId });

      return {
        response: personalityResponse.response,
        emotionalContext: personalityResponse.emotionalContext,
        neuralMetrics: metrics
      };
    } catch (error) {
      logger.error('Error in brain processing:', error);
      captureException(error as Error, { input, userId });
      throw error;
    }
  }

  /**
   * Stores an interaction in the memory system for future reference.
   * 
   * @param input - The original input
   * @param personalityResponse - The response from personality processing
   * @param neuralMetrics - Metrics from neural processing
   */
  private async storeInteraction(
    input: string,
    personalityResponse: unknown,
    neuralMetrics: unknown
  ): Promise<void> {
    try {
      await memoryManager.add({
        type: 'brain_interaction',
        content: JSON.stringify({
          input,
          response: personalityResponse,
          metrics: neuralMetrics,
          timestamp: Date.now()
        }),
        tags: ['brain', 'interaction', 'learning']
      });
    } catch (error) {
      logger.error('Failed to store interaction:', error);
      captureException(error as Error);
    }
  }

  /**
   * Gets the current state of the brain's activity monitor.
   * @returns The current activity state
   */
  public getState(): ReturnType<typeof ActivityMonitor.prototype.getState> {
    return this.activityMonitor.getState();
  }

  /**
   * Cleans up resources and stops all brain processes.
   * Should be called when shutting down the system.
   */
  public cleanup(): void {
    this.activityMonitor.cleanup();
    this.neuralProcessor.cleanup();
    this.removeAllListeners();
    logger.info('Brain cleanup complete');
  }
}