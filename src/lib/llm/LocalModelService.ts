import { env } from '@xenova/transformers';
import { InferenceSession, Tensor } from 'onnxruntime-web';
import type { Message } from '../types';
import { logger } from '../../utils/logger';

// Configure env for optimal performance
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency;

interface ModelInfo {
  name: string;
  status: 'not_loaded' | 'loading' | 'ready' | 'error';
  error?: string;
}

export class LocalModelService {
  private static instance: LocalModelService;
  private session: InferenceSession | null = null;
  private tokenizer: any = null;
  private isLoading = false;
  private modelId = 'microsoft/phi-2';  
  private modelPath = '/models/phi-2/model.onnx';  
  private maxLength = 128000;
  private modelInfo: ModelInfo = {
    name: 'Phi-2',
    status: 'not_loaded'
  };

  private constructor() {}

  static getInstance(): LocalModelService {
    if (!LocalModelService.instance) {
      LocalModelService.instance = new LocalModelService();
    }
    return LocalModelService.instance;
  }

  getModelInfo(): ModelInfo {
    return { ...this.modelInfo };
  }

  async checkCache(): Promise<{ isComplete: boolean }> {
    try {
      const response = await fetch(this.modelPath, { method: 'HEAD' });
      return { isComplete: response.ok };
    } catch (error) {
      logger.error('Failed to check model cache:', error);
      return { isComplete: false };
    }
  }

  async initialize(): Promise<void> {
    if (this.session || this.isLoading) return;

    try {
      this.isLoading = true;
      this.modelInfo.status = 'loading';
      logger.info(`Initializing ${this.modelInfo.name} model`);

      const cacheResult = await this.checkCache();
      if (!cacheResult.isComplete) {
        throw new Error('Model files not found. Please ensure the model is properly downloaded.');
      }

      // Initialize tokenizer with local files
      const { AutoTokenizer } = await import('@xenova/transformers');
      this.tokenizer = await AutoTokenizer.from_pretrained(this.modelId, {
        local: true,
        cache_dir: '/models/phi-2'
      });

      // Create inference session
      this.session = await InferenceSession.create(this.modelPath, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
        executionMode: 'sequential',
        enableCpuMemArena: true,
        enableMemPattern: true,
        extra: {
          session: {
            inter_op_num_threads: navigator.hardwareConcurrency,
            intra_op_num_threads: navigator.hardwareConcurrency,
          }
        }
      });

      this.modelInfo.status = 'ready';
      logger.info('Model initialized successfully');
    } catch (error) {
      this.modelInfo.status = 'error';
      this.modelInfo.error = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to initialize model:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async generate(prompt: string, options: {
    maxNewTokens?: number;
    temperature?: number;
    topP?: number;
    repetitionPenalty?: number;
  } = {}): Promise<string> {
    if (!this.session || !this.tokenizer) {
      throw new Error('Model not initialized');
    }

    const {
      maxNewTokens = 1024,
      temperature = 0.7,
      topP = 0.9,
      repetitionPenalty = 1.1
    } = options;

    try {
      // Tokenize input
      const inputs = await this.tokenizer(prompt, {
        return_tensors: 'onnx',
        padding: true,
        truncation: true,
        max_length: this.maxLength - maxNewTokens
      });

      // Run inference
      const output = await this.session.run({
        input_ids: new Tensor('int64', inputs.input_ids.data, inputs.input_ids.dims),
        attention_mask: new Tensor('int64', inputs.attention_mask.data, inputs.attention_mask.dims)
      }, {
        max_length: maxNewTokens,
        do_sample: temperature > 0,
        temperature,
        top_p: topP,
        repetition_penalty: repetitionPenalty,
        pad_token_id: this.tokenizer.pad_token_id,
        eos_token_id: this.tokenizer.eos_token_id
      });

      // Decode output tokens
      const generated = await this.tokenizer.decode(output.logits.data, {
        skip_special_tokens: true
      });

      return generated;
    } catch (error) {
      logger.error('Error generating text:', error);
      throw error;
    }
  }

  async processMessage(message: Message): Promise<Message> {
    // Format prompt according to Phi-3.5's template
    const prompt = `
The user said: ${message.content}
The assistant said: `;

    const response = await this.generate(prompt);
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    };
  }
}
