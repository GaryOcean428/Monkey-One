import { z } from 'zod'
import { Logger } from './logger/Logger'

const TOOLHOUSE_API_KEY = import.meta.env.VITE_TOOLHOUSE_API_KEY
const API_BASE_URL = 'https://api.toolhouse.io/v1'

if (!TOOLHOUSE_API_KEY) {
  throw new Error('Missing Toolhouse API key')
}

// Schema for validating options
const ToolhouseOptionsSchema = z.object({
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(1).max(8192).optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  streaming: z.boolean().optional(),
})

export type ToolhouseOptions = z.infer<typeof ToolhouseOptionsSchema>

const defaultOptions: ToolhouseOptions = {
  temperature: parseFloat(import.meta.env.VITE_AI_MODEL_TEMPERATURE || '0.7'),
  maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '4096'),
  topP: parseFloat(import.meta.env.VITE_AI_TOP_P || '0.9'),
  frequencyPenalty: parseFloat(import.meta.env.VITE_AI_FREQUENCY_PENALTY || '0'),
  presencePenalty: parseFloat(import.meta.env.VITE_AI_PRESENCE_PENALTY || '0'),
  streaming: import.meta.env.VITE_AI_STREAMING_ENABLED === 'true',
}

interface ChatResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}

interface MemoryResponse {
  id: string
  content: string
  metadata: Record<string, unknown>
  timestamp: string
}

interface SearchResponse {
  results: Array<{
    id: string
    content: string
    metadata: Record<string, unknown>
    score: number
  }>
}

export class ToolhouseClient {
  private readonly apiKey: string
  private readonly options: ToolhouseOptions
  private readonly logger: Logger

  constructor(options: Partial<ToolhouseOptions> = {}) {
    this.apiKey = TOOLHOUSE_API_KEY
    this.options = ToolhouseOptionsSchema.parse({ ...defaultOptions, ...options })
    this.logger = new Logger('ToolhouseClient')
  }

  async chat(
    messages: Array<{ role: string; content: string }>,
    options: Partial<ToolhouseOptions> = {}
  ): Promise<ChatResponse> {
    const mergedOptions = ToolhouseOptionsSchema.parse({ ...this.options, ...options })

    try {
      const response = await globalThis.fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages,
          ...mergedOptions,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      this.logger.error('Error in chat:', { error })
      throw error
    }
  }

  async storeMemory(
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<MemoryResponse> {
    try {
      const response = await globalThis.fetch(`${API_BASE_URL}/memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          content,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      this.logger.error('Error storing memory:', { error })
      throw error
    }
  }

  async searchMemory(
    query: string,
    options: { limit?: number; filter?: Record<string, unknown> } = {}
  ): Promise<SearchResponse> {
    try {
      const response = await globalThis.fetch(`${API_BASE_URL}/memory/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      this.logger.error('Error searching memory:', { error })
      throw error
    }
  }
}

// Create and export default instance
export const toolhouse = new ToolhouseClient()
export default toolhouse
