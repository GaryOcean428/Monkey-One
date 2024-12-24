import { BaseAgent } from '../base';
import { NeuralCore } from '../../evolution/NeuralCore';
import { memoryManager } from '../../memory';
import { GitHubClient } from '../../github/GitHubClient';
import { CodeProcessor } from '../../llm/CodeProcessor';
import type { Message, CodeInsight, LearningMetric } from '../../../types';
import * as tf from '@tensorflow/tfjs';

export class ObserverAgent extends BaseAgent {
  private neuralCore: NeuralCore;
  private codeProcessor: CodeProcessor;
  private insights: Map<string, CodeInsight> = new Map();
  private learningMetrics: LearningMetric[] = [];
  private readonly INSIGHT_THRESHOLD = 0.7;

  constructor(id: string, name: string) {
    super(id, name, 'observer', [
      'code_analysis',
      'pattern_recognition',
      'performance_monitoring',
      'learning_optimization',
      'insight_generation'
    ]);

    this.neuralCore = new NeuralCore();
    this.codeProcessor = new CodeProcessor();
    this.initializeObserver();
  }

  private async initializeObserver() {
    await this.neuralCore.initialize();
    await this.loadPreviousInsights();
    this.startContinuousLearning();
  }

  private async loadPreviousInsights() {
    const insights = await memoryManager.search('code_insight');
    insights.forEach(insight => {
      const parsed = JSON.parse(insight.content);
      this.insights.set(parsed.id, parsed);
    });
  }

  private startContinuousLearning() {
    setInterval(async () => {
      await this.evolveNeuralNetwork();
      await this.updateLearningMetrics();
    }, 300000); // Every 5 minutes
  }

  async analyzeCodebase(path: string = '/'): Promise<CodeInsight[]> {
    try {
      // Get all code files from the repository
      const files = await this.github.getContents(
        this.github.username,
        'monkey-one',
        path
      );

      const insights: CodeInsight[] = [];

      for (const file of files) {
        if (file.type === 'file' && file.name.match(/\.(ts|tsx|js|jsx)$/)) {
          const content = await this.github.getContents(
            this.github.username,
            'monkey-one',
            file.path
          );

          // Process code through neural network
          const codeEmbedding = await this.processCode(content);
          
          // Generate insights based on neural analysis
          const fileInsights = await this.generateInsights(
            file.path,
            content,
            codeEmbedding
          );

          insights.push(...fileInsights);
        }
      }

      return insights;
    } catch (error) {
      console.error('Error analyzing codebase:', error);
      return [];
    }
  }

  private async processCode(content: string): Promise<tf.Tensor> {
    // Convert code to tensor representation
    const processed = await this.codeProcessor.processCodingTask(content);
    return tf.tensor(processed.embedding);
  }

  private async generateInsights(
    path: string,
    content: string,
    embedding: tf.Tensor
  ): Promise<CodeInsight[]> {
    const insights: CodeInsight[] = [];

    // Pattern recognition
    const patterns = await this.detectPatterns(content);
    if (patterns.confidence > this.INSIGHT_THRESHOLD) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'pattern',
        path,
        description: patterns.description,
        suggestion: patterns.suggestion,
        confidence: patterns.confidence
      });
    }

    // Performance analysis
    const performance = await this.analyzePerformance(content);
    if (performance.score < 0.7) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'performance',
        path,
        description: performance.issues.join('\n'),
        suggestion: performance.suggestions.join('\n'),
        confidence: 0.85
      });
    }

    // Search for existing solutions
    const similarSolutions = await this.searchGitHubForSolutions(
      patterns.description,
      'typescript'
    );

    if (similarSolutions.length > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'solution',
        path,
        description: 'Found similar implementations in other projects',
        suggestion: this.formatSolutionSuggestions(similarSolutions),
        confidence: 0.9
      });
    }

    // Store insights
    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
      this.storeInsight(insight);
    });

    return insights;
  }

  private async detectPatterns(content: string): Promise<{
    description: string;
    suggestion: string;
    confidence: number;
  }> {
    // Use neural network to detect patterns
    const embedding = await this.processCode(content);
    const prediction = await this.neuralCore.predict(embedding);
    
    // Convert prediction to pattern insights
    return {
      description: 'Detected potential code pattern',
      suggestion: 'Consider refactoring using the strategy pattern',
      confidence: prediction.dataSync()[0]
    };
  }

  private async analyzePerformance(content: string): Promise<{
    score: number;
    issues: string[];
    suggestions: string[];
  }> {
    // Analyze code for performance issues
    const analysis = await this.codeProcessor.analyzePerformance(content);
    
    return {
      score: analysis.score,
      issues: analysis.issues,
      suggestions: analysis.suggestions
    };
  }

  private formatSolutionSuggestions(solutions: any[]): string {
    return solutions.map(solution =>
      `Found similar solution in ${solution.repository.full_name}:\n` +
      `File: ${solution.path}\n` +
      `URL: ${solution.html_url}\n`
    ).join('\n\n');
  }

  private async storeInsight(insight: CodeInsight) {
    await memoryManager.add({
      type: 'code_insight',
      content: JSON.stringify(insight),
      tags: ['insight', insight.type, 'code-analysis']
    });
  }

  private async evolveNeuralNetwork() {
    // Get recent insights for training
    const recentInsights = Array.from(this.insights.values())
      .slice(-100);

    // Prepare training data
    const trainingData = await Promise.all(
      recentInsights.map(async insight => ({
        input: await this.processCode(insight.description),
        output: tf.tensor1d([insight.confidence])
      }))
    );

    // Train neural network
    for (const data of trainingData) {
      await this.neuralCore.learn(data.input, data.output);
    }
  }

  private async updateLearningMetrics() {
    const metrics = this.neuralCore.getTrainingHistory();
    this.learningMetrics = metrics;

    await memoryManager.add({
      type: 'learning_metrics',
      content: JSON.stringify(metrics),
      tags: ['metrics', 'learning', 'neural']
    });
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Analyze message intent
      if (message.content.includes('analyze')) {
        const insights = await this.analyzeCodebase();
        return this.createResponse(this.formatInsightsResponse(insights));
      }

      // Handle other observer tasks
      return this.createResponse(
        'I\'m actively monitoring the system and will provide insights when they become available.'
      );
    } catch (error) {
      console.error('Error in ObserverAgent:', error);
      return this.createResponse(
        'I encountered an error while processing your request. Please try again.'
      );
    }
  }

  private formatInsightsResponse(insights: CodeInsight[]): string {
    if (insights.length === 0) {
      return 'No significant insights found at this time.';
    }

    return 'Here are my current insights:\n\n' +
      insights.map(insight =>
        `Type: ${insight.type}\n` +
        `File: ${insight.path}\n` +
        `Description: ${insight.description}\n` +
        `Suggestion: ${insight.suggestion}\n` +
        `Confidence: ${(insight.confidence * 100).toFixed(1)}%\n`
      ).join('\n');
  }

  getInsights(): CodeInsight[] {
    return Array.from(this.insights.values());
  }

  getLearningMetrics(): LearningMetric[] {
    return [...this.learningMetrics];
  }
}