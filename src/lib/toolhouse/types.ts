export type ToolhouseOptions = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  streaming?: boolean;
};

export type WebSearchResult = {
  url: string;
  title: string;
  snippet: string;
};

export type PineconeConfig = {
  apiKey: string;
  environment: string;
  indexName: string;
  namespace?: string;
};

export type MongoDBConfig = {
  connectionString: string;
  database: string;
  collection: string;
};

export type MemorySearchOptions = {
  limit?: number;
  minRelevance?: number;
  filter?: Record<string, any>;
};

export type CodeGenerationOptions = {
  language?: string;
  framework?: string;
  maxLength?: number;
};

export type ImageGenerationOptions = {
  model?: string;
  size?: string;
  quality?: string;
  style?: string;
};

export type SendEmailOptions = {
  to: string;
  subject: string;
  body: string;
  html?: boolean;
};

export type WebScraperOptions = {
  selector?: string;
  waitFor?: string;
  javascript?: boolean;
};

export type Memory = {
  id: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  timestamp: number;
};
