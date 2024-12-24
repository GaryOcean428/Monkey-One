import { z } from 'zod';

const TOOLHOUSE_API_KEY = import.meta.env.VITE_TOOLHOUSE_API_KEY;
const API_BASE_URL = 'https://api.toolhouse.io/v1';

if (!TOOLHOUSE_API_KEY) {
  throw new Error('Missing Toolhouse API key');
}

export type ToolhouseOptions = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  streaming?: boolean;
};

const defaultOptions: ToolhouseOptions = {
  temperature: parseFloat(import.meta.env.VITE_AI_MODEL_TEMPERATURE || '0.7'),
  maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '4096'),
  topP: parseFloat(import.meta.env.VITE_AI_TOP_P || '0.9'),
  frequencyPenalty: parseFloat(import.meta.env.VITE_AI_FREQUENCY_PENALTY || '0'),
  presencePenalty: parseFloat(import.meta.env.VITE_AI_PRESENCE_PENALTY || '0'),
  streaming: import.meta.env.VITE_AI_STREAMING_ENABLED === 'true'
};

export class ToolhouseClient {
  private readonly apiKey: string;
  private readonly options: ToolhouseOptions;

  constructor(options: Partial<ToolhouseOptions> = {}) {
    this.apiKey = TOOLHOUSE_API_KEY;
    this.options = { ...defaultOptions, ...options };
  }

  async chat(messages: Array<{ role: string; content: string }>, options: Partial<ToolhouseOptions> = {}) {
    const mergedOptions = { ...this.options, ...options };
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages,
          ...mergedOptions
        })
      });

      if (!response.ok) {
        throw new Error(`Toolhouse API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Toolhouse chat error:', error);
      throw error;
    }
  }

  async embedText(text: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Toolhouse API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Toolhouse embedding error:', error);
      throw error;
    }
  }

  async generateCode(prompt: string, options: { language?: string } = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/code/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Toolhouse API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Toolhouse code generation error:', error);
      throw error;
    }
  }

  async analyzeCode(code: string, options: { language?: string } = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/code/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          code,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Toolhouse API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Toolhouse code analysis error:', error);
      throw error;
    }
  }
}
