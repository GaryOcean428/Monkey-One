export interface LLMResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export abstract class LLMProvider {
  protected apiKey?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  abstract getName(): string

  abstract getModelName(): string

  abstract getCostPerToken(): number

  abstract generateResponse(prompt: string): Promise<LLMResponse>

  abstract generateStreamingResponse(prompt: string): Promise<ReadableStream>

  abstract isAvailable(): boolean
}
