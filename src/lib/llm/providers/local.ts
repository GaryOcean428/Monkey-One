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
      'phi4-gpu': 'vanilj/Phi-4:latest',
      'llama3.2-1b': 'llama3.2:1b-instruct-q2_K'
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
          insecure: true // Allow pulling from Ollama library
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      // Check if model is ready
      const modelResponse = await fetch(`${this.ollamaEndpoint}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.modelName,
        }),
      });

      if (!modelResponse.ok) {
        throw new Error(`Failed to check model status: ${modelResponse.statusText}`);
      }

      this.isInitialized = true;
      this.initError = null;
    } catch (error) {
      this.initError = error instanceof Error ? error : new Error(String(error));
      this.isInitialized = false;
      throw this.initError;
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && !this.initError;
  }

  getInitializationError(): Error | null {
    return this.initError;
  }

  private getModelOptions(modelId: string) {
    const baseOptions = {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      repeat_penalty: 1.1
    };

    // Model-specific options
    const modelOptions = {
      'phi4-gpu': {
        ...baseOptions,
        gpu: true,
        numa: true,
        threads: 4,
        context_length: 8192
      },
      'llama3.2-1b': {
        ...baseOptions,
        gpu: true,
        numa: true,
        threads: 4,
        context_length: 4096,
        repeat_last_n: 256
      }
    };

    return modelOptions[modelId] || baseOptions;
  }

  private formatPrompt(prompt: string, modelId: string): string {
    if (modelId.includes('phi4')) {
      return `Instruct: ${prompt}\nOutput:`;
    }
    
    if (modelId.includes('llama3.2')) {
      return `[INST] ${prompt} [/INST]`;
    }
    
    return `<|start_header_id|>system<|end_header_id|>
You are a helpful AI assistant focused on providing accurate and helpful responses.

<|start_header_id|>user<|end_header_id|>
${prompt}

<|start_header_id|>assistant<|end_header_id|>`;
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
      
      const response = await fetch(`${this.ollamaEndpoint}/generate`, {
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

  async generateStreamingResponse(prompt: string): Promise<ReadableStream> {
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

    const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelName,
        prompt: this.formatPrompt(prompt, this.modelName),
        stream: true,
        options: this.getModelOptions(this.modelName)
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate streaming response: ${response.statusText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const response = JSON.parse(line) as OllamaResponse;
                if (response.response) {
                  controller.enqueue(new TextEncoder().encode(response.response));
                }
                if (response.done) break;
              } catch (e) {
                console.error('Error parsing streaming response:', e);
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }
}
