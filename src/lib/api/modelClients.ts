import { ModelConfig } from '../models'
import { TokenCounter, TokenCount } from '../utils/tokenCounter'
import { logger } from '../../utils/logger'
import { RateLimiter } from '../utils/rateLimiter'
import { ResponseCache } from '../utils/responseCache'

export interface ModelResponse {
  text: string
  usage: TokenCount
}

export interface StreamChunk {
  text: string
  done: boolean
}

export interface ModelClientOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stream?: boolean
  cacheResponse?: boolean
}

// Initialize global rate limiter and cache
const rateLimiter = new RateLimiter()
const responseCache = new ResponseCache()

abstract class BaseModelClient {
  protected config: ModelConfig
  protected apiKey: string

  constructor(config: ModelConfig, apiKey: string) {
    this.config = config
    this.apiKey = apiKey
  }

  protected async validateInput(prompt: string): Promise<void> {
    if (!TokenCounter.validateContextLength(prompt, this.config.contextWindow)) {
      throw new Error(
        `Prompt exceeds maximum context length of ${this.config.contextWindow} tokens`
      )
    }
  }

  protected async checkRateLimit(): Promise<void> {
    const hasToken = await rateLimiter.waitForToken(this.config.provider.toLowerCase())
    if (!hasToken) {
      throw new Error(`Rate limit exceeded for ${this.config.provider}`)
    }
  }

  protected async checkCache(
    prompt: string,
    options: ModelClientOptions
  ): Promise<ModelResponse | null> {
    if (options.stream || !options.cacheResponse) {
      return null
    }

    const cacheKey = `${this.config.provider}-${this.config.apiEndpoint}-${prompt}`
    const cachedResponse = await responseCache.get(cacheKey, options)

    if (cachedResponse) {
      logger.info(`Cache hit for ${cacheKey}`)
      return cachedResponse
    }

    logger.info(`Cache miss for ${cacheKey}`)
    return null
  }

  protected async cacheResponse(
    prompt: string,
    options: ModelClientOptions,
    response: ModelResponse
  ): Promise<void> {
    if (!options.stream && options.cacheResponse) {
      const cacheKey = `${this.config.provider}-${this.config.apiEndpoint}-${prompt}`
      await responseCache.set(cacheKey, options, response)
      logger.info(`Cached response for ${cacheKey}`)
    }
  }

  abstract generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse>
  abstract generateStream(prompt: string, options: ModelClientOptions): AsyncGenerator<StreamChunk>
}

export class OpenAIClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const cachedResponse = await this.checkCache(prompt, options)
    if (cachedResponse) return cachedResponse

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        prompt,
        stream: false,
        ...options,
      }),
    })

    const data = await response.json()
    const result = {
      text: data.choices[0].text,
      usage: data.usage,
    }

    await this.cacheResponse(prompt, options, result)
    return result
  }

  async *generateStream(prompt: string, options: ModelClientOptions): AsyncGenerator<StreamChunk> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        prompt,
        stream: true,
        ...options,
      }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            yield {
              text: data.choices[0].text,
              done: false,
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    yield { text: '', done: true }
  }
}

export class AnthropicClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const cachedResponse = await this.checkCache(prompt, options)
    if (cachedResponse) return cachedResponse

    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        stream: false,
        ...options,
      }),
    })

    const data = await response.json()
    const result = {
      text: data.completion,
      usage: TokenCounter.getTokenCounts(prompt, data.completion),
    }

    await this.cacheResponse(prompt, options, result)
    return result
  }

  async *generateStream(prompt: string, options: ModelClientOptions): AsyncGenerator<StreamChunk> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        stream: true,
        ...options,
      }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            yield {
              text: data.completion,
              done: false,
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    yield { text: '', done: true }
  }
}

export class PerplexityClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const cachedResponse = await this.checkCache(prompt, options)
    if (cachedResponse) return cachedResponse

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        ...options,
      }),
    })

    const data = await response.json()
    const result = {
      text: data.choices[0].message.content,
      usage: data.usage,
    }

    await this.cacheResponse(prompt, options, result)
    return result
  }

  async *generateStream(prompt: string, options: ModelClientOptions): AsyncGenerator<StreamChunk> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        ...options,
      }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            yield {
              text: data.choices[0].message.content,
              done: false,
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    yield { text: '', done: true }
  }
}

export class GroqClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const cachedResponse = await this.checkCache(prompt, options)
    if (cachedResponse) return cachedResponse

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        ...options,
      }),
    })

    const data = await response.json()
    const result = {
      text: data.choices[0].message.content,
      usage: data.usage,
    }

    await this.cacheResponse(prompt, options, result)
    return result
  }

  async *generateStream(prompt: string, options: ModelClientOptions): AsyncGenerator<StreamChunk> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        ...options,
      }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            yield {
              text: data.choices[0].message.content,
              done: false,
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    yield { text: '', done: true }
  }
}

export class QwenClient extends BaseModelClient {
  async generate(prompt: string, options: ModelClientOptions): Promise<ModelResponse> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const cachedResponse = await this.checkCache(prompt, options)
    if (cachedResponse) return cachedResponse

    const response = await fetch('https://api.qwen.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        ...options,
      }),
    })

    const data = await response.json()
    const result = {
      text: data.choices[0].message.content,
      usage: TokenCounter.getTokenCounts(prompt, data.choices[0].message.content),
    }

    await this.cacheResponse(prompt, options, result)
    return result
  }

  async *generateStream(prompt: string, options: ModelClientOptions): AsyncGenerator<StreamChunk> {
    await this.validateInput(prompt)
    await this.checkRateLimit()

    const response = await fetch('https://api.qwen.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.apiEndpoint,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        ...options,
      }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            yield {
              text: data.choices[0].message.content,
              done: false,
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    yield { text: '', done: true }
  }
}

// Factory to create appropriate client based on provider
export function createModelClient(config: ModelConfig): BaseModelClient {
  const getApiKey = (provider: string): string => {
    const key = process.env[`VITE_${provider.toUpperCase()}_API_KEY`]
    if (!key) throw new Error(`API key not found for provider: ${provider}`)
    return key
  }

  switch (config.provider.toLowerCase()) {
    case 'openai':
      return new OpenAIClient(config, getApiKey('openai'))
    case 'anthropic':
      return new AnthropicClient(config, getApiKey('anthropic'))
    case 'perplexity':
      return new PerplexityClient(config, getApiKey('perplexity'))
    case 'groq':
      return new GroqClient(config, getApiKey('groq'))
    case 'qwen':
      return new QwenClient(config, getApiKey('qwen'))
    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}
