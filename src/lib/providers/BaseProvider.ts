import type { ModelConfig, ModelResponse, StreamChunk } from '../types/models';

export abstract class BaseProvider {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract initialize(): Promise<void>;
  
  abstract generate(prompt: string, options?: any): Promise<ModelResponse>;
  
  abstract generateStream(prompt: string, options?: any): AsyncGenerator<StreamChunk>;
  
  abstract isAvailable(): Promise<boolean>;

  getName(): string {
    return this.name;
  }
}
