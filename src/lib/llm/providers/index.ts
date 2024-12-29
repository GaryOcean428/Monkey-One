import { XAIProvider } from './xai';
import { GroqProvider } from './groq';
import { PerplexityProvider } from './perplexity';
import { QwenProvider } from './qwen';
import { GraniteProvider } from './granite';
import { LocalProvider } from './local';
import type { Message } from '../../../types';

export interface LLMProvider {
  id: string;
  name: string;
  sendMessage(message: string, context?: Message[], options?: {
    useRag?: boolean;
    documents?: string[];
    maxTokens?: number;
  }): Promise<string>;
  streamResponse?(
    message: string,
    onChunk: (chunk: string) => void,
    options?: {
      useRag?: boolean;
      documents?: string[];
      maxTokens?: number;
    }
  ): Promise<void>;
}

export class LLMManager {
  private providers: Map<string, LLMProvider>;
  private activeProvider: string | null;

  constructor() {
    this.providers = new Map();
    this.activeProvider = null;
    this.registerDefaultProviders();
  }

  private registerDefaultProviders() {
    const providers: LLMProvider[] = [
      // Local provider
      new LocalProvider(),
      // Cloud providers - only initialize if API keys are available
      ...(import.meta.env.VITE_XAI_API_KEY ? [new XAIProvider(import.meta.env.VITE_XAI_API_KEY)] : []),
      ...(import.meta.env.VITE_GROQ_API_KEY ? [new GroqProvider(import.meta.env.VITE_GROQ_API_KEY)] : []),
      ...(import.meta.env.VITE_PERPLEXITY_API_KEY ? [new PerplexityProvider(import.meta.env.VITE_PERPLEXITY_API_KEY)] : []),
      ...(import.meta.env.VITE_HF_API_KEY ? [
        new QwenProvider(import.meta.env.VITE_HF_API_KEY),
        new GraniteProvider(import.meta.env.VITE_HF_API_KEY)
      ] : [])
    ];

    // Register providers and set first available as active
    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
      if (!this.activeProvider) {
        this.activeProvider = provider.id;
      }
    });
  }

  public registerProvider(id: string, provider: LLMProvider) {
    this.providers.set(id, provider);
    if (!this.activeProvider) {
      this.activeProvider = id;
    }
  }

  public getActiveProvider(): LLMProvider {
    if (!this.activeProvider) {
      throw new Error('No active provider set');
    }
    const provider = this.providers.get(this.activeProvider);
    if (!provider) {
      throw new Error('Active provider not found');
    }
    return provider;
  }

  public setActiveProvider(id: string) {
    if (!this.providers.has(id)) {
      throw new Error(`Provider ${id} not found`);
    }
    this.activeProvider = id;
  }

  async sendMessage(message: string, context?: Message[], options?: {
    useRag?: boolean;
    documents?: string[];
    maxTokens?: number;
  }): Promise<string> {
    const provider = this.getActiveProvider();
    return provider.sendMessage(message, context, options);
  }

  async streamResponse(
    message: string,
    onChunk: (chunk: string) => void,
    options?: {
      useRag?: boolean;
      documents?: string[];
      maxTokens?: number;
    }
  ): Promise<void> {
    const provider = this.getActiveProvider();
    if (!provider.streamResponse) {
      throw new Error('Current provider does not support streaming');
    }
    return provider.streamResponse(message, onChunk, options);
  }
}

export const llmManager = new LLMManager();