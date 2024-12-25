import { LocalModelService } from '../llm/LocalModelService';
import { logger } from '../utils/logger';
import { ModelPerformanceTracker, ModelProvider, TaskType } from '../llm/ModelPerformanceTracker';

type ModelCapabilities = 
  | 'reasoning'      // 0-10 reasoning capability
  | 'creativity'     // 0-10 creative capability
  | 'knowledge'      // 0-10 knowledge base
  | 'coding'        // 0-10 coding capability
  | 'search'        // 0-10 search capability
  | 'toolUse'       // 0-10 tool usage capability
  | 'speed'         // 0-10 inference speed
  | 'contextWindow' // Maximum context window size
  | 'costPerToken' // Cost in USD per 1K tokens

interface ModelClientConfig {
  defaultProvider?: ModelProvider;
  fallbackProviders?: ModelProvider[];
  maxRetries?: number;
  routingPreferences?: {
    [key in TaskType]?: ModelProvider[];
  };
  maxLatency?: number;    // Maximum acceptable latency in ms
  adaptiveRouting?: boolean; // Whether to use performance-based routing
}

export class ModelClient {
  private modelService: LocalModelService;
  private performanceTracker: ModelPerformanceTracker;
  private currentProvider: ModelProvider;
  private fallbackProviders: ModelProvider[];
  private maxRetries: number;
  private maxLatency?: number;
  private adaptiveRouting: boolean;
  private routingPreferences: Required<ModelClientConfig>['routingPreferences'];

  // Model version control to prevent using outdated models
  private readonly MODEL_VERSIONS = {
    'phi3.5': 'latest',
    'gpt-4o': '2024-11-06',
    'gpt-4o-mini': '2024-07-18',
    'o1': '2024-12-01',
    'o1-mini': '2024-09-15',
    'llama-3.3-70b-versatile': '20241225',
    'claude-3-5-sonnet': 'v2@20241022',
    'claude-3-5-haiku': '20241022',
    'qwq-32b': 'preview',
    'sonar-huge': 'latest',
    'sonar-large': 'latest',
    'sonar-small': 'latest'
  } as const;

  private readonly MODEL_CAPABILITIES: Record<ModelProvider, ModelCapabilities> = {
    'gpt-4o': {
      reasoning: 10,
      creativity: 9,
      knowledge: 10,
      coding: 9,
      search: 9,
      toolUse: 10,
      speed: 7,
      contextWindow: 128000,
      costPerToken: 0.015
    },
    'gpt-4o-mini': {
      reasoning: 8,
      creativity: 8,
      knowledge: 8,
      coding: 8,
      search: 8,
      toolUse: 8,
      speed: 9,
      contextWindow: 128000,
      costPerToken: 0.008
    },
    'o1': {
      reasoning: 10,
      creativity: 10,
      knowledge: 10,
      coding: 10,
      search: 9,
      toolUse: 9,
      speed: 8,
      contextWindow: 200000,
      costPerToken: 0.015
    },
    'o1-mini': {
      reasoning: 9,
      creativity: 8,
      knowledge: 9,
      coding: 9,
      search: 8,
      toolUse: 8,
      speed: 9,
      contextWindow: 128000,
      costPerToken: 0.008
    },
    'llama-3.3-70b-versatile': {
      reasoning: 9,
      creativity: 8,
      knowledge: 9,
      coding: 9,
      search: 8,
      toolUse: 9,
      speed: 7,
      contextWindow: 128000,
      costPerToken: 0.002
    },
    'claude-3-5-sonnet': {
      reasoning: 9,
      creativity: 9,
      knowledge: 9,
      coding: 9,
      search: 8,
      toolUse: 9,
      speed: 8,
      contextWindow: 200000,
      costPerToken: 0.01
    },
    'claude-3-5-haiku': {
      reasoning: 8,
      creativity: 8,
      knowledge: 8,
      coding: 8,
      search: 7,
      toolUse: 8,
      speed: 10,
      contextWindow: 200000,
      costPerToken: 0.006
    },
    'qwq-32b': {
      reasoning: 8,
      creativity: 7,
      knowledge: 8,
      coding: 9,
      search: 7,
      toolUse: 7,
      speed: 8,
      contextWindow: 32768,
      costPerToken: 0.001
    },
    'sonar-huge': {
      reasoning: 9,
      creativity: 8,
      knowledge: 10,
      coding: 8,
      search: 10,
      toolUse: 8,
      speed: 7,
      contextWindow: 127072,
      costPerToken: 0.004
    },
    'sonar-large': {
      reasoning: 8,
      creativity: 7,
      knowledge: 9,
      coding: 7,
      search: 10,
      toolUse: 7,
      speed: 8,
      contextWindow: 127072,
      costPerToken: 0.002
    },
    'sonar-small': {
      reasoning: 7,
      creativity: 6,
      knowledge: 8,
      coding: 6,
      search: 10,
      toolUse: 6,
      speed: 9,
      contextWindow: 127072,
      costPerToken: 0.001
    },
    'phi3.5': {
      reasoning: 7,
      creativity: 7,
      knowledge: 7,
      coding: 8,
      search: 7,
      toolUse: 7,
      speed: 10,
      contextWindow: 128000,
      costPerToken: 0.001
    }
    'phi3.5': {
      reasoning: 7,
      creativity: 7,
      knowledge: 7,
      coding: 8,
      search: 7,
      toolUse: 7,
      speed: 10,
      contextWindow: 128000,
      costPerToken: 0.001
    },
    'llama-3.3-70b-versatile': {
      reasoning: 9,
      creativity: 8,
      knowledge: 9,
      coding: 9,
      search: 8,
      toolUse: 9,
      speed: 7,
      contextWindow: 128000,
      costPerToken: 0.002
    },
    'llama-3.2-70b': {
      reasoning: 8,
      creativity: 8,
      knowledge: 8,
      coding: 9,
      search: 7,
      toolUse: 8,
      speed: 7,
      contextWindow: 128000,
      costPerToken: 0.002
    },
    'llama-3.1-70b': {
      reasoning: 8,
      creativity: 7,
      knowledge: 8,
      coding: 8,
      search: 7,
      toolUse: 7,
      speed: 8,
      contextWindow: 128000,
      costPerToken: 0.002
    },
    'gpt-4o': {
      reasoning: 10,
      creativity: 9,
      knowledge: 10,
      coding: 9,
      search: 9,
      toolUse: 10,
      speed: 7,
      contextWindow: 128000,
      costPerToken: 0.015
    },
    'claude-3-5-sonnet': {
      reasoning: 9,
      creativity: 9,
      knowledge: 9,
      coding: 9,
      search: 8,
      toolUse: 9,
      speed: 8,
      contextWindow: 200000,
      costPerToken: 0.01
    },
    'o1': {
      reasoning: 10,
      creativity: 10,
      knowledge: 10,
      coding: 10,
      search: 9,
      toolUse: 9,
      speed: 8,
      contextWindow: 200000,
      costPerToken: 0.015
    }
  };

  constructor(config: ModelClientConfig = {}) {
    this.modelService = LocalModelService.getInstance();
    this.performanceTracker = ModelPerformanceTracker.getInstance();
    this.currentProvider = config.defaultProvider || 'phi3.5';
    this.fallbackProviders = config.fallbackProviders || ['llama-3.1-70b', 'llama-3.2-70b'];
    this.maxRetries = config.maxRetries || 3;
    this.maxLatency = config.maxLatency;
    this.adaptiveRouting = config.adaptiveRouting ?? true;
    
    // Updated routing preferences based on approved models
    this.routingPreferences = {
      reasoning: ['o1', 'gpt-4o', 'llama-3.3-70b-versatile'],
      creativity: ['o1', 'claude-3-5-sonnet', 'gpt-4o'],
      coding: ['o1', 'llama-3.3-70b-versatile', 'claude-3-5-sonnet'],
      search: ['gpt-4o', 'o1', 'claude-3-5-sonnet'],
      toolUse: ['gpt-4o', 'o1', 'llama-3.3-70b-versatile'],
      general: ['phi3.5', 'llama-3.1-70b', 'llama-3.2-70b'],
      ...config.routingPreferences
    };
  }

  private detectTaskType(messages: Array<{ role: string; content: string }> | string): TaskType {
    const content = typeof messages === 'string' 
      ? messages 
      : messages.map(m => m.content).join(' ');

    // Task detection heuristics
    if (content.includes('```') || /\b(code|function|class|import)\b/i.test(content)) {
      return 'coding';
    }
    if (/\b(search|find|look up|query)\b/i.test(content)) {
      return 'search';
    }
    if (/\b(tool|execute|run|command)\b/i.test(content)) {
      return 'toolUse';
    }
    if (/\b(why|how|explain|analyze|compare)\b/i.test(content)) {
      return 'reasoning';
    }
    if (/\b(create|generate|imagine|design)\b/i.test(content)) {
      return 'creativity';
    }
    return 'general';
  }

  private getProvidersForTask(taskType: TaskType): ModelProvider[] {
    if (this.adaptiveRouting) {
      const bestModel = this.performanceTracker.getBestModelForTask(taskType, this.maxLatency);
      const preferredProviders = this.routingPreferences[taskType] || [];
      return [bestModel, ...preferredProviders.filter(p => p !== bestModel)];
    }
    return this.routingPreferences[taskType] || [];
  }

  private async callExternalAPI(endpoint: string, data: any) {
    const startTime = Date.now();
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const latency = Date.now() - startTime;
      
      this.performanceTracker.recordLatency(data.provider, latency);
      this.performanceTracker.recordSuccess(
        data.provider,
        result.usage?.total_tokens || 0,
        (result.usage?.total_tokens || 0) * this.MODEL_CAPABILITIES[data.provider].costPerToken
      );

      if (result.quality_score) {
        this.performanceTracker.recordQualityScore(
          data.provider,
          data.taskType,
          result.quality_score
        );
      }

      return result;
    } catch (error) {
      this.performanceTracker.recordError(data.provider);
      throw error;
    }
  }

  private async useLocalModel(prompt: string) {
    const startTime = Date.now();
    try {
      const result = await this.modelService.generate(prompt);
      const latency = Date.now() - startTime;
      
      this.performanceTracker.recordLatency('phi', latency);
      this.performanceTracker.recordSuccess('phi', result.usage?.total_tokens || 0, 0);
      
      return result;
    } catch (error) {
      this.performanceTracker.recordError('phi');
      throw error;
    }
  }

  private async withTaskRouting<T>(
    messages: Array<{ role: string; content: string }> | string,
    operation: (provider: ModelProvider, taskType: TaskType) => Promise<T>
  ): Promise<T> {
    const taskType = this.detectTaskType(messages);
    const providers = this.getProvidersForTask(taskType);
    let lastError: Error | null = null;

    for (let i = 0; i < this.maxRetries; i++) {
      for (const provider of providers) {
        try {
          logger.info(`Attempting task type '${taskType}' with provider '${provider}'`);
          return await operation(provider, taskType);
        } catch (error) {
          lastError = error as Error;
          logger.warn(`Failed to use provider ${provider} for task '${taskType}':`, error);
          continue;
        }
      }
    }

    throw lastError || new Error('All providers failed');
  }

  async chat(messages: Array<{ role: string; content: string }>) {
    return this.withTaskRouting(messages, async (provider, taskType) => {
      if (provider === 'phi') {
        const prompt = messages
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
        return this.useLocalModel(prompt);
      }

      const response = await this.callExternalAPI('chat', {
        provider,
        messages,
        taskType,
        capabilities: this.MODEL_CAPABILITIES[provider]
      });
      return response.content;
    });
  }

  async complete(prompt: string) {
    return this.withTaskRouting(prompt, async (provider, taskType) => {
      if (provider === 'phi') {
        return this.useLocalModel(prompt);
      }

      const response = await this.callExternalAPI('complete', {
        provider,
        prompt,
        taskType,
        capabilities: this.MODEL_CAPABILITIES[provider]
      });
      return response.completion;
    });
  }

  async isReady(): Promise<boolean> {
    if (this.currentProvider === 'phi') {
      return this.modelService.isInitialized();
    }
    return true;
  }

  setProvider(provider: ModelProvider) {
    this.currentProvider = provider;
  }

  getCurrentProvider(): ModelProvider {
    return this.currentProvider;
  }

  getModelCapabilities(provider: ModelProvider): ModelCapabilities {
    return this.MODEL_CAPABILITIES[provider];
  }

  updateRoutingPreferences(preferences: Partial<Required<ModelClientConfig>['routingPreferences']>) {
    this.routingPreferences = {
      ...this.routingPreferences,
      ...preferences
    };
  }

  getPerformanceMetrics(provider: ModelProvider) {
    return this.performanceTracker.getModelPerformance(provider);
  }

  getModelStats(provider: ModelProvider) {
    return this.performanceTracker.getModelStats(provider);
  }
}