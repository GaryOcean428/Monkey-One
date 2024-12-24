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

  private readonly MODEL_CAPABILITIES: Record<ModelProvider, ModelCapabilities> = {
    o1: {
      reasoning: 10,
      creativity: 10,
      knowledge: 10,
      coding: 10,
      search: 9,
      toolUse: 9,
      speed: 8,
      contextWindow: 1000000,
      costPerToken: 0.015
    },
    'o1-mini': {
      reasoning: 8,
      creativity: 8,
      knowledge: 8,
      coding: 8,
      search: 7,
      toolUse: 7,
      speed: 9,
      contextWindow: 128000,
      costPerToken: 0.005
    },
    claude: {
      reasoning: 9,
      creativity: 9,
      knowledge: 9,
      coding: 9,
      search: 8,
      toolUse: 8,
      speed: 7,
      contextWindow: 200000,
      costPerToken: 0.01
    },
    'claude-haiku': {
      reasoning: 8,
      creativity: 8,
      knowledge: 8,
      coding: 8,
      search: 7,
      toolUse: 7,
      speed: 9,
      contextWindow: 100000,
      costPerToken: 0.003
    },
    grok: {
      reasoning: 9,
      creativity: 8,
      knowledge: 9,
      coding: 9,
      search: 8,
      toolUse: 8,
      speed: 8,
      contextWindow: 150000,
      costPerToken: 0.008
    },
    'grok-40': {
      reasoning: 8,
      creativity: 7,
      knowledge: 8,
      coding: 8,
      search: 7,
      toolUse: 7,
      speed: 9,
      contextWindow: 100000,
      costPerToken: 0.004
    },
    perplexity: {
      reasoning: 7,
      creativity: 7,
      knowledge: 8,
      coding: 7,
      search: 10,
      toolUse: 7,
      speed: 9,
      contextWindow: 100000,
      costPerToken: 0.006
    },
    llama: {
      reasoning: 7,
      creativity: 7,
      knowledge: 7,
      coding: 8,
      search: 7,
      toolUse: 10,
      speed: 8,
      contextWindow: 100000,
      costPerToken: 0.002
    },
    phi: {
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
    groq: {
      reasoning: 7,
      creativity: 7,
      knowledge: 7,
      coding: 7,
      search: 7,
      toolUse: 7,
      speed: 9,
      contextWindow: 100000,
      costPerToken: 0.003
    },
    qwen: {
      reasoning: 7,
      creativity: 7,
      knowledge: 7,
      coding: 8,
      search: 7,
      toolUse: 7,
      speed: 8,
      contextWindow: 80000,
      costPerToken: 0.002
    }
  };

  constructor(config: ModelClientConfig = {}) {
    this.modelService = LocalModelService.getInstance();
    this.performanceTracker = ModelPerformanceTracker.getInstance();
    this.currentProvider = config.defaultProvider || 'phi';
    this.fallbackProviders = config.fallbackProviders || ['claude-haiku', 'o1-mini', 'grok-40'];
    this.maxRetries = config.maxRetries || 3;
    this.maxLatency = config.maxLatency;
    this.adaptiveRouting = config.adaptiveRouting ?? true;
    
    // Default routing preferences
    this.routingPreferences = {
      reasoning: ['o1', 'claude', 'grok', 'o1-mini'],
      creativity: ['o1', 'claude', 'grok', 'claude-haiku'],
      coding: ['o1', 'claude', 'grok', 'grok-40'],
      search: ['perplexity', 'o1', 'claude', 'o1-mini'],
      toolUse: ['llama', 'o1', 'claude', 'grok-40'],
      general: ['phi', 'groq', 'qwen', 'claude-haiku'],
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