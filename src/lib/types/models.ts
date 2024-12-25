export interface ModelConfig {
  provider: string;
  contextWindow: number;
  maxOutput?: number;
  modelName: string;
  releaseDate?: string;
  keyStrengths?: string[];
  modelCardUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ModelResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamChunk {
  text: string;
  done: boolean;
}

export interface ModelOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  [key: string]: any;
}

export interface ModelMetrics {
  totalRequests: number;
  errorRate: number;
  cacheHitRate: number;
  averageLatency: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  lastUpdated: Date;
}
