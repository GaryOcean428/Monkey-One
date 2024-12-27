import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  apiEndpoint: string;
  llm: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    streamResponses: boolean;
    contextLength: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  performance: {
    batchSize: number;
    cacheDuration: number;
    cacheEnabled: boolean;
    debugMode: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  memory: {
    maxItems: number;
    retentionDays: number;
    vectorSearch: boolean;
    similarityThreshold: number;
  };
  security: {
    apiKeyRotation: number;
    sandboxMode: boolean;
    contentFiltering: boolean;
    maxTokensPerRequest: number;
  };
}

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
    defaultModel: 'llama3.2:1b-instruct-q2_K',
    temperature: 0.7,
    maxTokens: 4096,
    streamResponses: true,
    contextLength: 4096,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0
  },
  performance: {
    batchSize: 16,
    cacheDuration: 3600,
    cacheEnabled: true,
    debugMode: false,
    logLevel: 'info'
  },
  memory: {
    maxItems: 1000,
    retentionDays: 30,
    vectorSearch: true,
    similarityThreshold: 0.8
  },
  security: {
    apiKeyRotation: 30,
    sandboxMode: true,
    contentFiltering: true,
    maxTokensPerRequest: 4096
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