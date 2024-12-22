import { NeuralCore } from '../evolution/NeuralCore';
import { PersonalityCore } from './PersonalityCore';
import { EventEmitter } from 'events';
import { memoryManager } from '../memory';

interface BrainState {
  isLearning: boolean;
  isProcessing: boolean;
  lastActivity: number;
  activeRegions: string[];
}

export class BrainCore extends EventEmitter {
  private neuralCore: NeuralCore;
  private personalityCore: PersonalityCore;
  private state: BrainState;
  private readonly UPDATE_INTERVAL = 1000; // 1 second
  private updateTimer: NodeJS.Timer;

  constructor() {
    super();
    this.neuralCore = new NeuralCore();
    this.personalityCore = new PersonalityCore();
    this.state = {
      isLearning: false,
      isProcessing: false,
      lastActivity: Date.now(),
      activeRegions: []
    };

    this.initializeBrain();
  }

  private async initializeBrain() {
    await this.neuralCore.initialize();
    this.startActivityMonitoring();
    this.registerEventHandlers();
  }

  private startActivityMonitoring() {
    this.updateTimer = setInterval(() => {
      this.monitorActivity();
    }, this.UPDATE_INTERVAL);
  }

  private registerEventHandlers() {
    this.on('learning', () => {
      this.state.isLearning = true;
      this.state.lastActivity = Date.now();
      this.emit('stateChange', this.state);
    });

    this.on('processing', () => {
      this.state.isProcessing = true;
      this.state.lastActivity = Date.now();
      this.emit('stateChange', this.state);
    });

    this.on('idle', () => {
      this.state.isLearning = false;
      this.state.isProcessing = false;
      this.emit('stateChange', this.state);
    });
  }

  private async monitorActivity() {
    const currentTime = Date.now();
    const idleThreshold = 5000; // 5 seconds

    if (currentTime - this.state.lastActivity > idleThreshold) {
      // Trigger background learning during idle periods
      await this.performBackgroundLearning();
    }

    // Update active regions based on current activity
    this.updateActiveRegions();
  }

  private async performBackgroundLearning() {
    if (!this.state.isLearning && !this.state.isProcessing) {
      this.emit('learning');
      await this.neuralCore.evolve();
      this.emit('idle');
    }
  }

  private updateActiveRegions() {
    const regions = new Set(this.state.activeRegions);

    if (this.state.isLearning) {
      regions.add('hippocampus');
      regions.add('cortex');
    }

    if (this.state.isProcessing) {
      regions.add('thalamus');
      regions.add('cerebellum');
    }

    this.state.activeRegions = Array.from(regions);
  }

  async process(input: string, userId?: string): Promise<{
    response: string;
    emotionalContext: any;
    neuralMetrics: any;
  }> {
    try {
      this.emit('processing');

      // Process through personality core first
      const personalityResponse = await this.personalityCore.processInteraction(
        input,
        userId || 'anonymous'
      );

      // Get neural predictions and learning metrics
      const neuralMetrics = await this.getNeuralMetrics();

      // Store interaction in memory
      await this.storeInteraction(input, personalityResponse, neuralMetrics);

      this.emit('idle');

      return {
        response: personalityResponse.response,
        emotionalContext: personalityResponse.emotionalContext,
        neuralMetrics
      };
    } catch (error) {
      console.error('Error in brain processing:', error);
      this.emit('idle');
      throw error;
    }
  }

  private async getNeuralMetrics() {
    const architecture = this.neuralCore.getArchitecture();
    const trainingHistory = this.neuralCore.getTrainingHistory();
    
    return {
      architecture,
      performance: trainingHistory[trainingHistory.length - 1] || null,
      evolutionStage: this.calculateEvolutionStage(trainingHistory)
    };
  }

  private calculateEvolutionStage(history: any[]): number {
    if (history.length === 0) return 0;
    
    const recentPerformance = history.slice(-100);
    const averageAccuracy = recentPerformance.reduce(
      (acc, m) => acc + m.accuracy, 0
    ) / recentPerformance.length;

    return Math.min(1, averageAccuracy);
  }

  private async storeInteraction(
    input: string,
    personalityResponse: any,
    neuralMetrics: any
  ) {
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
  }

  getState(): BrainState {
    return { ...this.state };
  }

  getPersonalityCore(): PersonalityCore {
    return this.personalityCore;
  }

  getNeuralCore(): NeuralCore {
    return this.neuralCore;
  }

  cleanup() {
    clearInterval(this.updateTimer);
    this.removeAllListeners();
  }
}