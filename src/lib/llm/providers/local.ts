import { LLMProvider } from './base';
import { useSettingsStore } from '../../../store/settingsStore';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
  eval_count?: number;
}

export class LocalProvider implements LLMProvider {
  id = 'local';
  name = 'Local';
  private modelName: string;
  private isInitialized: boolean = false;
  private initError: Error | null = null;
  private ollamaEndpoint: string;

  constructor(modelName: string = 'llama3.2:1b-instruct-q2_K', ollamaEndpoint?: string) {
    this.modelName = modelName;
    this.ollamaEndpoint = ollamaEndpoint || 'http://localhost:11434';
  }

  private async checkOllamaConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/tags`);
      if (!response.ok) throw new Error('Failed to connect to Ollama');
      const data = await response.json();
      return data.models?.some((model: any) => model.name === this.modelName) || false;
    } catch (error) {
      console.error('Ollama connection error:', error);
      return false;
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const hasConnection = await this.checkOllamaConnection();
    if (!hasConnection) {
      this.initError = new Error('Could not connect to Ollama or model not found');
      throw this.initError;
    }

    this.isInitialized = true;
  }

  async sendMessage(
    message: string,
    context: any[] = [],
    options: { useRag?: boolean; documents?: string[]; maxTokens?: number } = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const prompt = options.useRag && options.documents?.length
      ? `Context:\n${options.documents.join('\n\n')}\n\nUser: ${message}`
      : message;

    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          prompt,
          stream: false,
          options: {
            num_predict: options.maxTokens || 4096,
            temperature: useSettingsStore.getState().settings.llm.temperature,
            top_p: useSettingsStore.getState().settings.llm.topP,
            presence_penalty: useSettingsStore.getState().settings.llm.presencePenalty,
            frequency_penalty: useSettingsStore.getState().settings.llm.frequencyPenalty
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error in LocalProvider.sendMessage:', error);
      throw new Error('Failed to get response from Ollama');
    }
  }

  async streamResponse(
    message: string,
    onChunk: (chunk: string) => void,
    options: { useRag?: boolean; documents?: string[]; maxTokens?: number } = {}
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const prompt = options.useRag && options.documents?.length
      ? `Context:\n${options.documents.join('\n\n')}\n\nUser: ${message}`
      : message;

    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          prompt,
          stream: true,
          options: {
            num_predict: options.maxTokens || 4096,
            temperature: useSettingsStore.getState().settings.llm.temperature,
            top_p: useSettingsStore.getState().settings.llm.topP,
            presence_penalty: useSettingsStore.getState().settings.llm.presencePenalty,
            frequency_penalty: useSettingsStore.getState().settings.llm.frequencyPenalty
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama stream request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body reader available');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const data: OllamaResponse = JSON.parse(line);
            if (data.response) {
              onChunk(data.response);
            }
          } catch (e) {
            console.warn('Failed to parse streaming response:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error in LocalProvider.streamResponse:', error);
      throw new Error('Failed to stream response from Ollama');
    }
  }
}
