export interface Settings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  apiEndpoint: string;
  
  llm?: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    streamResponses: boolean;
    contextLength: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };

  agents?: {
    maxConcurrentTasks: number;
    taskTimeout: number;
    autoDelegation: boolean;
    defaultRole: string;
    maxRetries: number;
    errorThreshold: number;
  };

  memory?: {
    maxItems: number;
    retentionDays: number;
    contextWindowSize: number;
    vectorSearch: boolean;
    embeddingModel: string;
    similarityThreshold: number;
  };

  performance?: {
    batchSize: number;
    cacheDuration: number;
    cacheEnabled: boolean;
    debugMode: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    metricsEnabled: boolean;
  };

  security?: {
    apiKeyRotation: number;
    rateLimit: number;
    sandboxMode: boolean;
    contentFiltering: boolean;
    maxTokensPerRequest: number;
    allowedDomains: string[];
  };
}