import { ModelClient } from '../clients/ModelClient';
import { GitClient } from '../clients/GitClient';
import { logger } from '../utils/logger';
import { LocalModelService } from '../llm/LocalModelService';
import { ModelPerformanceTracker } from '../llm/ModelPerformanceTracker';

interface ImprovementSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'performance' | 'functionality' | 'reliability' | 'security' | 'architecture';
  affectedFiles: string[];
  proposedChanges: {
    file: string;
    changes: string;
  }[];
  metrics?: {
    estimatedImpact: number;
    complexity: number;
    riskLevel: number;
  };
  status: 'proposed' | 'reviewing' | 'approved' | 'implementing' | 'completed' | 'rejected';
  branchName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CodeAnalysisResult {
  suggestions: ImprovementSuggestion[];
  metrics: {
    codeQuality: number;
    performance: number;
    security: number;
    maintainability: number;
  };
  timestamp: Date;
}

export class SelfImprovementManager {
  private static instance: SelfImprovementManager;
  private modelClient: ModelClient;
  private gitClient: GitClient;
  private performanceTracker: ModelPerformanceTracker;
  private localModel: LocalModelService;
  private suggestions: Map<string, ImprovementSuggestion>;
  private analysisHistory: CodeAnalysisResult[];
  private readonly ANALYSIS_INTERVAL = 24 * 60 * 60 * 1000; // Daily
  private readonly MAX_HISTORY = 30; // Keep last 30 analyses

  private constructor() {
    this.modelClient = new ModelClient();
    this.gitClient = new GitClient();
    this.performanceTracker = ModelPerformanceTracker.getInstance();
    this.localModel = LocalModelService.getInstance();
    this.suggestions = new Map();
    this.analysisHistory = [];
    this.startPeriodicAnalysis();
  }

  static getInstance(): SelfImprovementManager {
    if (!SelfImprovementManager.instance) {
      SelfImprovementManager.instance = new SelfImprovementManager();
    }
    return SelfImprovementManager.instance;
  }

  private async analyzeCodebase(): Promise<CodeAnalysisResult> {
    logger.info('Starting codebase self-analysis');

    // Use Phi to analyze its own code
    const codebaseAnalysis = await this.localModel.analyze({
      type: 'self-analysis',
      scope: ['src/lib/llm', 'src/lib/clients', 'src/lib/improvement'],
      metrics: ['performance', 'quality', 'security', 'maintainability']
    });

    // Use specialized models for specific analyses
    const [performanceAnalysis, securityAnalysis, architectureAnalysis] = await Promise.all([
      this.modelClient.complete('Analyze performance bottlenecks and optimization opportunities', 'perplexity'),
      this.modelClient.complete('Identify security vulnerabilities and improvement areas', 'claude'),
      this.modelClient.complete('Review architecture and suggest structural improvements', 'o1')
    ]);

    // Combine and process all analyses
    const suggestions = await this.processAnalyses([
      codebaseAnalysis,
      performanceAnalysis,
      securityAnalysis,
      architectureAnalysis
    ]);

    const result: CodeAnalysisResult = {
      suggestions,
      metrics: {
        codeQuality: this.calculateMetric('quality'),
        performance: this.calculateMetric('performance'),
        security: this.calculateMetric('security'),
        maintainability: this.calculateMetric('maintainability')
      },
      timestamp: new Date()
    };

    this.analysisHistory.push(result);
    if (this.analysisHistory.length > this.MAX_HISTORY) {
      this.analysisHistory.shift();
    }

    return result;
  }

  private calculateMetric(type: string): number {
    // Calculate metric based on performance data and analysis results
    return Math.random() * 10; // Placeholder
  }

  private async processAnalyses(analyses: any[]): Promise<ImprovementSuggestion[]> {
    const suggestions: ImprovementSuggestion[] = [];
    
    for (const analysis of analyses) {
      const processed = await this.localModel.process({
        type: 'improvement-extraction',
        content: analysis,
        format: 'suggestion'
      });

      suggestions.push(...processed.suggestions);
    }

    return suggestions;
  }

  private async createImprovementBranch(suggestion: ImprovementSuggestion): Promise<string> {
    const branchName = `improvement/${suggestion.category}/${suggestion.id}`;
    
    await this.gitClient.createBranch(branchName);
    
    // Apply proposed changes
    for (const change of suggestion.proposedChanges) {
      await this.gitClient.modifyFile(change.file, change.changes);
    }

    // Commit changes
    await this.gitClient.commit(
      `Improvement: ${suggestion.title}\n\n${suggestion.description}`,
      suggestion.affectedFiles
    );

    // Push branch
    await this.gitClient.push(branchName);

    return branchName;
  }

  private startPeriodicAnalysis() {
    setInterval(async () => {
      try {
        await this.analyzeCodebase();
      } catch (error) {
        logger.error('Failed to perform periodic analysis:', error);
      }
    }, this.ANALYSIS_INTERVAL);
  }

  async requestImmediateAnalysis(): Promise<CodeAnalysisResult> {
    return this.analyzeCodebase();
  }

  async implementSuggestion(suggestionId: string): Promise<void> {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }

    suggestion.status = 'implementing';
    suggestion.branchName = await this.createImprovementBranch(suggestion);
    suggestion.updatedAt = new Date();

    this.suggestions.set(suggestionId, suggestion);
    logger.info(`Created improvement branch: ${suggestion.branchName}`);
  }

  async reviewSuggestion(suggestionId: string, approve: boolean): Promise<void> {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }

    suggestion.status = approve ? 'approved' : 'rejected';
    suggestion.updatedAt = new Date();

    this.suggestions.set(suggestionId, suggestion);
  }

  getSuggestions(filter?: {
    status?: ImprovementSuggestion['status'];
    category?: ImprovementSuggestion['category'];
    priority?: ImprovementSuggestion['priority'];
  }): ImprovementSuggestion[] {
    let filtered = Array.from(this.suggestions.values());

    if (filter) {
      if (filter.status) {
        filtered = filtered.filter(s => s.status === filter.status);
      }
      if (filter.category) {
        filtered = filtered.filter(s => s.category === filter.category);
      }
      if (filter.priority) {
        filtered = filtered.filter(s => s.priority === filter.priority);
      }
    }

    return filtered;
  }

  getAnalysisHistory(): CodeAnalysisResult[] {
    return [...this.analysisHistory];
  }

  getMetricsTrend(metric: keyof CodeAnalysisResult['metrics']): number[] {
    return this.analysisHistory.map(analysis => analysis.metrics[metric]);
  }
}
