import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types/settings';

interface SettingsState {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'light',
  fontSize: 'medium',
  notifications: true,
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000',
  llm: {
    defaultModel: 'gpt-4-o1',
    temperature: 0.7,
    maxTokens: 1000,
    streamResponses: true,
    contextLength: 4096,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0
  },
  agents: {
    maxConcurrentTasks: 5,
    taskTimeout: 30000,
    autoDelegation: true,
    defaultRole: 'assistant',
    maxRetries: 3,
    errorThreshold: 0.1
  },
  memory: {
    maxItems: 1000,
    retentionDays: 30,
    vectorSearch: true,
    contextWindowSize: 4096,
    embeddingModel: 'text-embedding-ada-002',
    similarityThreshold: 0.8
  },
  performance: {
    batchSize: 32,
    cacheDuration: 3600,
    cacheEnabled: true,
    debugMode: false,
    logLevel: 'info',
    metricsEnabled: true
  },
  security: {
    apiKeyRotation: 30,
    rateLimit: 100,
    sandboxMode: true,
    contentFiltering: true,
    maxTokensPerRequest: 4096,
    allowedDomains: ['*']
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);