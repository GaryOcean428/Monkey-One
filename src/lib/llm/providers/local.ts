import { LLMProvider, LLMResponse } from './base';

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

export class LocalProvider extends LLMProvider {
  private modelName: string;
  private isInitialized: boolean = false;
  private initError: Error | null = null;
  private ollamaEndpoint: string;

  constructor(modelName: string = 'llama3.2:1b-instruct-q2_K', ollamaEndpoint?: string) {
    super();
    // Map model IDs to Ollama model names
    const modelMap: { [key: string]: string } = {
      'llama3.2-1b': 'llama3.2:1b-instruct-q2_K',
      'phi3.5': 'phi3.5:latest',
      'sonar-small': 'llama-3.1-sonar-small-128k-online',
      'sonar-large': 'llama-3.1-sonar-large-128k-online',
      'sonar-huge': 'llama-3.1-sonar-huge-128k-online'
    };
    this.modelName = modelMap[modelName] || modelName;
    
    // Set Ollama endpoint based on environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    this.ollamaEndpoint = ollamaEndpoint || (isDevelopment ? 'http://localhost:11434' : '/api/ollama');
  }

  getName(): string {
    return 'Local';
  }

  getModelName(): string {
    return this.modelName;
  }

  getCostPerToken(): number {
    return 0; // Local models don't have a cost per token
  }

  async initialize(): Promise<void> {
    try {
      // Pull the model if it doesn't exist
      const response = await fetch(`${this.ollamaEndpoint}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.modelName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to pull model: ${errorText}`);
      }

      this.isInitialized = true;
    } catch (error) {
      this.initError = error;
      throw error;
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && !this.initError;
  }

  private getModelOptions(modelName: string): Record<string, any> {
    const defaultOptions = {
      temperature: 0.7,
      top_p: 0.9,
      repeat_penalty: 1.1,
      top_k: 40,
      num_predict: -1,
    };

    // Model-specific options
    const modelOptions: { [key: string]: Record<string, any> } = {
      'llama3.2:1b-instruct-q2_K': {
        ...defaultOptions,
        temperature: 0.7,
        top_p: 0.9,
        repeat_penalty: 1.1,
        context_length: 4096,
      },
      'phi3.5:latest': {
        ...defaultOptions,
        temperature: 0.1,
        top_p: 0.95,
        repeat_penalty: 1.2,
      },
      'llama-3.1-sonar-small-128k-online': {
        ...defaultOptions,
        temperature: 0.8,
        top_k: 50,
      },
      'llama-3.1-sonar-large-128k-online': {
        ...defaultOptions,
        temperature: 0.7,
        top_k: 45,
      },
      'llama-3.1-sonar-huge-128k-online': {
        ...defaultOptions,
        temperature: 0.6,
        top_k: 40,
      },
    };

    return modelOptions[modelName] || defaultOptions;
  }

  private formatPrompt(prompt: string, modelName: string): string {
    if (modelName.startsWith('llama3.2')) {
      return `[INST] ${prompt} [/INST]`;
    }
    if (modelName.startsWith('phi3.5')) {
      return `Instruct: ${prompt}\nOutput:`;
    }
    return prompt;
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    if (!this.isInitialized) {
      try {
        await this.initialize();
      } catch (error) {
        throw new Error(`Failed to initialize local model: ${error.message}`);
      }
    }

    if (!this.isAvailable()) {
      throw new Error(`Local model is not available: ${this.initError?.message}`);
    }

    try {
      const options = this.getModelOptions(this.modelName);
      const formattedPrompt = this.formatPrompt(prompt, this.modelName);
      
      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt: formattedPrompt,
          ...options,
          stream: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${errorText}`);
      }

      const result: OllamaResponse = await response.json();
      return {
        content: result.response,
        model: this.modelName,
        usage: {
          prompt_tokens: 0, // Ollama doesn't provide token counts
          completion_tokens: 0,
          total_tokens: 0
        }
      };
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }
}
