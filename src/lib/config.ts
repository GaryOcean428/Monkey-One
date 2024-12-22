import { z } from 'zod';

const configSchema = z.object({
  xai: z.object({
    apiKey: z.string(),
    baseUrl: z.string(),
    defaultModel: z.string(),
    maxTokens: z.number(),
    temperature: z.number(),
  }),
  memory: z.object({
    retentionDays: z.number(),
    maxSize: z.number(),
  }),
  agents: z.object({
    maxMemoryItems: z.number(),
    defaultRole: z.string(),
  }),
  google: z.object({
    apiKey: z.string(),
    baseUrl: z.string(),
    searchEngineId: z.string(),
    resultsPerPage: z.number(),
  }),
});

type Config = z.infer<typeof configSchema>;

const config: Config = {
  xai: {
    apiKey: import.meta.env.VITE_XAI_API_KEY || '',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-beta',
    maxTokens: 1000,
    temperature: 0.7,
  },
  memory: {
    retentionDays: 30,
    maxSize: 1000,
  },
  agents: {
    maxMemoryItems: 100,
    defaultRole: 'assistant',
  },
  google: {
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    baseUrl: 'https://www.googleapis.com/customsearch/v1',
    searchEngineId: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '',
    resultsPerPage: 5,
  },
} as const;

export { config, type Config, configSchema };