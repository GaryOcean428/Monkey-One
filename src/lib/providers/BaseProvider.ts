import type { ModelResponse, StreamChunk } from '../types/models'

export abstract class BaseProvider {
  protected name: string
  protected modelName: string = ''
  protected ollamaEndpoint: string = ''
  protected isInitialized: boolean = false
  protected initError: Error | null = null

  constructor(name: string) {
    this.name = name
  }

  abstract initialize(): Promise<void>

  abstract generate(prompt: string, options?: any): Promise<ModelResponse>

  abstract generateStream(prompt: string, options?: any): AsyncGenerator<StreamChunk>

  abstract isAvailable(): Promise<boolean>

  getName(): string {
    return this.name
  }
}
