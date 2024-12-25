import type { ModelConfig } from '../models';

export abstract class BaseProvider {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract initialize(): Promise<void>;
  
  abstract generate(prompt: string, config: ModelConfig, options?: any): Promise<string>;
  
  abstract generateStream(prompt: string, config: ModelConfig, options?: any): AsyncGenerator<string>;
  
  abstract isAvailable(): Promise<boolean>;

  getName(): string {
    return this.name;
  }
}
