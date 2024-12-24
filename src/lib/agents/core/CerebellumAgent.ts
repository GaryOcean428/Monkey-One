import { BaseAgent } from '../base';
import type { Message } from '../../../types';
import { memoryManager } from '../../../lib/memory';

interface MotorPattern {
  id: string;
  sequence: string[];
  timing: number[];
  accuracy: number;
  confidence: number;
  usageCount: number;
  lastUsed: number;
}

interface LearningMetrics {
  errorRate: number;
  adaptationRate: number;
  refinementLevel: number;
  executionSpeed: number;
}

export class CerebellumAgent extends BaseAgent {
  private motorPatterns: Map<string, MotorPattern> = new Map();
  private learningMetrics: LearningMetrics;
  private readonly REFINEMENT_THRESHOLD = 0.8;
  private readonly ADAPTATION_RATE = 0.1;
  private readonly MAX_PATTERNS = 1000;

  constructor(id: string, name: string) {
    super(id, name, 'cerebellum', [
      'motor_learning',
      'timing_coordination',
      'error_correction',
      'sequence_optimization'
    ]);

    this.learningMetrics = {
      errorRate: 0.5,
      adaptationRate: this.ADAPTATION_RATE,
      refinementLevel: 0,
      executionSpeed: 1.0
    };

    this.initializeCerebellum();
  }

  private async initializeCerebellum() {
    await this.loadMotorPatterns();
    this.startPerformanceOptimization();
  }

  private async loadMotorPatterns() {
    const patterns = await memoryManager.search('motor_pattern');
    patterns.forEach(pattern => {
      const motorPattern = JSON.parse(pattern.content) as MotorPattern;
      this.motorPatterns.set(motorPattern.id, motorPattern);
    });
  }

  private startPerformanceOptimization() {
    setInterval(() => {
      this.optimizePerformance();
    }, 10000); // Optimize every 10 seconds
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Analyze motor components
      const motorComponents = await this.analyzeMotorComponents(message);
      
      // Find or create motor pattern
      const pattern = await this.getMotorPattern(motorComponents);
      
      // Execute and refine pattern
      const result = await this.executeMotorPattern(pattern);
      
      // Update learning metrics
      this.updateLearningMetrics(result);

      return this.createResponse(
        `Executed motor pattern with ${result.accuracy * 100}% accuracy`
      );
    } catch (error) {
      console.error('Error in CerebellumAgent:', error);
      return this.createResponse(
        'I encountered an error in motor pattern execution. Adjusting coordination.'
      );
    }
  }

  private async analyzeMotorComponents(message: Message): Promise<string[]> {
    const content = message.content.toLowerCase();
    const components: string[] = [];

    // Extract action sequences
    const actionWords = [
      'move', 'rotate', 'shift', 'turn', 'push',
      'pull', 'lift', 'drop', 'grab', 'release'
    ];

    actionWords.forEach(action => {
      if (content.includes(action)) {
        components.push(action);
      }
    });

    return components;
  }

  private async getMotorPattern(components: string[]): Promise<MotorPattern> {
    const patternKey = components.join('-');
    let pattern = this.motorPatterns.get(patternKey);

    if (!pattern) {
      pattern = this.createNewPattern(components);
      await this.storeMotorPattern(pattern);
    }

    return pattern;
  }

  private createNewPattern(components: string[]): MotorPattern {
    return {
      id: crypto.randomUUID(),
      sequence: components,
      timing: components.map(() => 1000), // Default 1s per component
      accuracy: 0.5,
      confidence: 0.1,
      usageCount: 0,
      lastUsed: Date.now()
    };
  }

  protected async executeMotorPattern(pattern: MotorPattern): Promise<{
    success: boolean;
    accuracy: number;
    executionTime: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    const errors: string[] = [];
    let totalAccuracy = 0;

    // Execute each component in sequence
    for (let i = 0; i < pattern.sequence.length; i++) {
      const component = pattern.sequence[i];
      const timing = pattern.timing[i];
      
      try {
        // Simulate component execution
        await this.executeComponent(component, timing);
        totalAccuracy += 1;
      } catch (error) {
        errors.push(`Error executing ${component}: ${error}`);
      }
    }

    const executionTime = Date.now() - startTime;
    const accuracy = totalAccuracy / pattern.sequence.length;

    // Update pattern metrics
    pattern.accuracy = (pattern.accuracy * pattern.usageCount + accuracy) / (pattern.usageCount + 1);
    pattern.usageCount++;
    pattern.lastUsed = Date.now();
    pattern.confidence = Math.min(1, pattern.confidence + this.ADAPTATION_RATE);

    // Store updated pattern
    await this.storeMotorPattern(pattern);

    return {
      success: errors.length === 0,
      accuracy,
      executionTime,
      errors
    };
  }

  private async executeComponent(component: string, timing: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success rate based on confidence
        const success = Math.random() < this.learningMetrics.refinementLevel;
        if (success) {
          resolve();
        } else {
          reject(new Error('Component execution failed'));
        }
      }, timing);
    });
  }

  private async storeMotorPattern(pattern: MotorPattern) {
    await memoryManager.add({
      type: 'motor_pattern',
      content: JSON.stringify(pattern),
      tags: ['motor', 'pattern', ...pattern.sequence]
    });

    this.motorPatterns.set(pattern.sequence.join('-'), pattern);

    // Maintain pattern limit
    if (this.motorPatterns.size > this.MAX_PATTERNS) {
      this.pruneOldPatterns();
    }
  }

  private pruneOldPatterns() {
    const patterns = Array.from(this.motorPatterns.entries());
    patterns.sort((a, b) => {
      // Prioritize keeping patterns with high usage and recent activity
      const scoreA = a[1].usageCount * 0.7 + (1 / (Date.now() - a[1].lastUsed)) * 0.3;
      const scoreB = b[1].usageCount * 0.7 + (1 / (Date.now() - b[1].lastUsed)) * 0.3;
      return scoreA - scoreB;
    });

    // Remove lowest scoring patterns
    const patternsToRemove = patterns.slice(0, patterns.length - this.MAX_PATTERNS);
    patternsToRemove.forEach(([key]) => {
      this.motorPatterns.delete(key);
    });
  }

  private updateLearningMetrics(result: {
    accuracy: number;
    executionTime: number;
    errors: string[];
  }) {
    this.learningMetrics = {
      errorRate: (this.learningMetrics.errorRate * 0.9 + (result.errors.length > 0 ? 1 : 0) * 0.1),
      adaptationRate: this.ADAPTATION_RATE * (1 + result.accuracy),
      refinementLevel: Math.min(1, this.learningMetrics.refinementLevel + this.ADAPTATION_RATE * result.accuracy),
      executionSpeed: result.executionTime
    };
  }

  private optimizePerformance() {
    // Adjust timing based on success rate
    this.motorPatterns.forEach(pattern => {
      if (pattern.accuracy > this.REFINEMENT_THRESHOLD) {
        pattern.timing = pattern.timing.map(t => t * 0.95); // Speed up successful patterns
      } else {
        pattern.timing = pattern.timing.map(t => t * 1.05); // Slow down error-prone patterns
      }
    });

    // Update refinement level
    const averageAccuracy = Array.from(this.motorPatterns.values())
      .reduce((sum, p) => sum + p.accuracy, 0) / this.motorPatterns.size;

    this.learningMetrics.refinementLevel = Math.min(1, averageAccuracy);
  }

  getLearningMetrics(): LearningMetrics {
    return { ...this.learningMetrics };
  }

  getMotorPatterns(): MotorPattern[] {
    return Array.from(this.motorPatterns.values());
  }
}