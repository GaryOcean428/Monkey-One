import type {
  ToolhouseOptions,
  WebSearchResult,
  PineconeConfig,
  MongoDBConfig,
  MemorySearchOptions,
  CodeGenerationOptions,
  ImageGenerationOptions,
  SendEmailOptions,
  WebScraperOptions,
  Memory,
} from './types'

const TOOLHOUSE_API_KEY = import.meta.env.VITE_TOOLHOUSE_API_KEY
const API_BASE_URL = 'https://api.toolhouse.ai/v1'

if (!TOOLHOUSE_API_KEY) {
  throw new Error('Missing Toolhouse API key')
}

const defaultOptions: ToolhouseOptions = {
  temperature: parseFloat(import.meta.env.VITE_AI_MODEL_TEMPERATURE || '0.7'),
  maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '4096'),
  topP: parseFloat(import.meta.env.VITE_AI_TOP_P || '0.9'),
  frequencyPenalty: parseFloat(import.meta.env.VITE_AI_FREQUENCY_PENALTY || '0'),
  presencePenalty: parseFloat(import.meta.env.VITE_AI_PRESENCE_PENALTY || '0'),
  streaming: import.meta.env.VITE_AI_STREAMING_ENABLED === 'true',
}

export class ToolhouseClient {
  private readonly apiKey: string
  private readonly options: ToolhouseOptions

  constructor(options: Partial<ToolhouseOptions> = {}) {
    this.apiKey = TOOLHOUSE_API_KEY
    this.options = { ...defaultOptions, ...options }
  }

  private async request<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Toolhouse API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Toolhouse ${endpoint} error:`, error)
      throw error
    }
  }

  // Web Search Tools
  async webSearch(query: string): Promise<WebSearchResult[]> {
    return this.request('/tools/web_search', { query })
  }

  async exaWebSearch(query: string): Promise<WebSearchResult[]> {
    return this.request('/tools/exa_web_search', { query })
  }

  async tavily(query: string): Promise<WebSearchResult[]> {
    return this.request('/tools/tavily_web_search', { query })
  }

  // Memory & Vector Store Tools
  async storeMemory(content: string, metadata?: Record<string, any>): Promise<void> {
    return this.request('/tools/memory_store', { content, metadata })
  }

  async recallMemory(query: string, options?: MemorySearchOptions): Promise<Memory[]> {
    return this.request('/tools/memory_fetch', { query, ...options })
  }

  async searchMemory(query: string, options?: MemorySearchOptions): Promise<Memory[]> {
    return this.request('/tools/memory_search', { query, ...options })
  }

  async deleteMemory(memoryIds: string[]): Promise<void> {
    return this.request('/tools/memory_delete', { memoryIds })
  }

  // Pinecone Tools
  async pineconeUpsert(
    vectors: number[][],
    metadata: Record<string, any>[],
    config: PineconeConfig
  ): Promise<void> {
    return this.request('/tools/pinecone_memory_store', {
      vectors,
      metadata,
      config,
    })
  }

  async pineconeSearch(
    vector: number[],
    config: PineconeConfig,
    topK: number = 10
  ): Promise<any[]> {
    return this.request('/tools/pinecone_memory_search', {
      vector,
      config,
      topK,
    })
  }

  // MongoDB Tools
  async mongoDBStore(data: any, config: MongoDBConfig): Promise<void> {
    return this.request('/tools/mongo_db_memory_store', {
      data,
      config,
    })
  }

  async mongoDBSearch(query: any, config: MongoDBConfig): Promise<any[]> {
    return this.request('/tools/mongo_db_memory_search', {
      query,
      config,
    })
  }

  // Code Tools
  async generateCode(prompt: string, options?: CodeGenerationOptions): Promise<string> {
    return this.request('/tools/code_interpreter', {
      prompt,
      ...options,
    })
  }

  async executeCode(code: string, language: string): Promise<any> {
    return this.request('/tools/code_interpreter', {
      code,
      language,
    })
  }

  // File & Content Tools
  async extractPDFTables(pdfUrl: string): Promise<any[]> {
    return this.request('/tools/pdf2csv', { url: pdfUrl })
  }

  async getPageContents(url: string, options?: WebScraperOptions): Promise<string> {
    return this.request('/tools/scraper', {
      url,
      ...options,
    })
  }

  async diffbotScrape(url: string): Promise<any> {
    return this.request('/tools/diffbot', { url })
  }

  // Email Tools
  async sendEmail(options: SendEmailOptions): Promise<void> {
    return this.request('/tools/send_email', options)
  }

  // Image Tools
  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<string> {
    return this.request('/tools/image_generation_flux', {
      prompt,
      ...options,
    })
  }

  // Utility Tools
  async getCurrentTime(): Promise<string> {
    return this.request('/tools/current_time', {})
  }

  async isPrime(number: number): Promise<boolean> {
    return this.request('/tools/is_prime', { number })
  }

  async getRandomEmoji(): Promise<string> {
    return this.request('/tools/random_emoji', {})
  }

  async getTrends(keyword: string): Promise<any> {
    return this.request('/tools/google_trends', { keyword })
  }

  async getNews(): Promise<any[]> {
    return this.request('/tools/get_current_news', {})
  }

  async searchJobs(query: string): Promise<any[]> {
    return this.request('/tools/job_openings_search', { query })
  }

  async searchX(query: string): Promise<any[]> {
    return this.request('/tools/search_x', { query })
  }

  async githubFile(repo: string, path: string): Promise<string> {
    return this.request('/tools/github_file', { repo, path })
  }
}
