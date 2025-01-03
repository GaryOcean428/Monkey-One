export interface LLMSettings {
  defaultModel: string
  temperature: number
  maxTokens: number
  streamResponses: boolean
  contextLength: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

export interface MemorySettings {
  maxItems: number
  retentionDays: number
  vectorSearch: boolean
  similarityThreshold: number
}

export interface PerformanceSettings {
  batchSize: number
  cacheDuration: number
  cacheEnabled: boolean
  debugMode: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface SecuritySettings {
  apiKeyRotation: number
  sandboxMode: boolean
  contentFiltering: boolean
  maxTokensPerRequest: number
}

export interface Settings {
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  notifications: boolean
  apiEndpoint: string
  llm: LLMSettings
  memory: MemorySettings
  performance: PerformanceSettings
  security: SecuritySettings
}
