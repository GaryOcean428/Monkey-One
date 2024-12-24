import { env } from '@xenova/transformers';
import { InferenceSession, Tensor } from 'onnxruntime-web';
import type { Message } from '../types';
import { logger } from '../../utils/logger';

// Configure env for optimal performance
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency;

export class LocalModelService {
  private static instance: LocalModelService;
  private session: InferenceSession | null = null;
  private tokenizer: any = null;
  private isLoading = false;
  private modelId = 'microsoft/phi-3.5';
  private modelPath = '/models/phi-3.5-q4';  // Local path to quantized model
  private maxLength = 128000; // 128K context window

  private constructor() {}

  static getInstance(): LocalModelService {
    if (!LocalModelService.instance) {
      LocalModelService.instance = new LocalModelService();
    }
    return LocalModelService.instance;
  }

  async initialize(): Promise<void> {
    if (this.session || this.isLoading) return;

    try {
      this.isLoading = true;
      logger.info(`Initializing Phi-3.5 model`);

      // Initialize tokenizer
      const { AutoTokenizer } = await import('@xenova/transformers');
      this.tokenizer = await AutoTokenizer.from_pretrained(this.modelId);

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

      logger.info('Phi-3.5 initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Phi-3.5:', error);
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
