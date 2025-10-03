import { GitClient } from '../clients/GitClient';
import { logger } from '../../utils/logger';
import { LocalProvider } from '../providers';
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
  private provider: LocalProvider;
  private gitClient: GitClient;
  private performanceTracker: ModelPerformanceTracker;
  private isInitialized: boolean = false;
  private suggestions: Map<string, ImprovementSuggestion>;
  private analysisHistory: CodeAnalysisResult[];
  private readonly ANALYSIS_INTERVAL = 24 * 60 * 60 * 1000; // Daily
  private readonly MAX_HISTORY = 30; // Keep last 30 analyses

  private constructor() {
    this.provider = new LocalProvider();
    this.gitClient = new GitClient();
    this.performanceTracker = ModelPerformanceTracker.getInstance();
    this.suggestions = new Map();
    this.analysisHistory = [];
  }

  static getInstance(): SelfImprovementManager {
    if (!SelfImprovementManager.instance) {
      SelfImprovementManager.instance = new SelfImprovementManager();
    }
    return SelfImprovementManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.provider.initialize();
      this.isInitialized = true;
      logger.info('Self-improvement manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize self-improvement manager:', error);
      throw error;
    }
  }

  private async analyzeCodebase(): Promise<CodeAnalysisResult> {
    logger.info('Starting codebase self-analysis');

    // Use Phi to analyze its own code
    const codebaseAnalysis = await this.provider.generateResponse({
      type: 'self-analysis',
      scope: ['src/lib/llm', 'src/lib/clients', 'src/lib/improvement'],
      metrics: ['performance', 'quality', 'security', 'maintainability']
    });

    // Use specialized models for specific analyses
    const [performanceAnalysis, securityAnalysis, architectureAnalysis] = await Promise.all([
      this.provider.generateResponse('Analyze performance bottlenecks and optimization opportunities'),
      this.provider.generateResponse('Identify security vulnerabilities and improvement areas'),
      this.provider.generateResponse('Review architecture and suggest structural improvements')
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

  private calculateMetric(_type: string): number {
    // Calculate metric based on performance data and analysis results
    return Math.random() * 10; // Placeholder
  }

  private async processAnalyses(analyses: unknown[]): Promise<ImprovementSuggestion[]> {
    const suggestions: ImprovementSuggestion[] = [];
    
    for (const analysis of analyses) {
      const processed = await this.provider.generateResponse({
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

  async assessMergeQuality(suggestionId: string): Promise<{
    canMerge: boolean;
    quality: number;
    conflicts: string[];
    recommendations: string[];
  }> {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }

    if (!suggestion.branchName) {
      throw new Error(`Suggestion ${suggestionId} has no branch`);
    }

    // Check for merge conflicts
    const conflicts = await this.gitClient.checkMergeConflicts(suggestion.branchName);
    
    // Assess code quality metrics
    const metrics = suggestion.metrics || {
      estimatedImpact: 0,
      complexity: 0,
      riskLevel: 0
    };

    // Calculate merge quality score (0-1)
    const qualityFactors = {
      hasNoConflicts: conflicts.length === 0 ? 0.3 : 0,
      lowRisk: (1 - metrics.riskLevel) * 0.25,
      highImpact: metrics.estimatedImpact * 0.25,
      lowComplexity: (1 - metrics.complexity) * 0.2
    };

    const quality = Object.values(qualityFactors).reduce((sum, val) => sum + val, 0);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (conflicts.length > 0) {
      recommendations.push(`Resolve ${conflicts.length} merge conflict(s) before merging`);
    }
    
    if (metrics.riskLevel > 0.7) {
      recommendations.push('High risk level - consider additional testing or review');
    }
    
    if (metrics.complexity > 0.8) {
      recommendations.push('High complexity - consider breaking into smaller changes');
    }
    
    if (metrics.estimatedImpact < 0.3) {
      recommendations.push('Low estimated impact - verify the benefit justifies the change');
    }

    // Additional performance and security checks
    const performanceImpact = await this.performanceTracker.estimateImpact(
      suggestion.affectedFiles
    );
    
    if (performanceImpact < -0.1) {
      recommendations.push('Potential negative performance impact detected');
    }

    return {
      canMerge: conflicts.length === 0 && quality >= 0.6,
      quality,
      conflicts,
      recommendations
    };
  }

  async mergeImprovement(
    suggestionId: string,
    options: { force?: boolean; squash?: boolean } = {}
  ): Promise<void> {
    const assessment = await this.assessMergeQuality(suggestionId);
    
    if (!assessment.canMerge && !options.force) {
      throw new Error(
        `Cannot merge suggestion ${suggestionId}. Quality: ${assessment.quality.toFixed(2)}. ` +
        `Recommendations: ${assessment.recommendations.join('; ')}`
      );
    }

    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion?.branchName) {
      throw new Error(`Suggestion ${suggestionId} not ready for merge`);
    }

    // Perform the merge
    await this.gitClient.mergeBranch(suggestion.branchName, {
      squash: options.squash ?? true,
      message: `Merge improvement: ${suggestion.title}\n\nQuality score: ${assessment.quality.toFixed(2)}`
    });

    // Update suggestion status
    suggestion.status = 'completed';
    suggestion.updatedAt = new Date();
    this.suggestions.set(suggestionId, suggestion);

    logger.info(
      `Successfully merged improvement ${suggestionId} with quality score ${assessment.quality.toFixed(2)}`
    );
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
