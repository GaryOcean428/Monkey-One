export interface ModelConfig {
  name: string;
  apiName: string;
  provider: 'openai' | 'anthropic' | 'groq' | 'qwen' | 'local';
  parameters?: number;
  contextWindow: number;
  maxOutput: number;
  releaseDate: string;
  keyStrengths: string[];
  modelCardLink?: string;
  quantization?: {
    bits: number;
    scheme: string;
  };
}

export interface ModelResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    model: string;
    latency: number;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface StreamChunk {
  text: string;
  isComplete: boolean;
  metadata?: {
    model: string;
    latency?: number;
  };
}

export interface ModelOptions {
  temperature?: number;
  maxTokens?: number;
  streamDelay?: number;
  stopSequences?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
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
